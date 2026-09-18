// ==========================================
// 8. WALLET — CASHFREE INTEGRATION
// ==========================================

const getCashfreeHeaders = () => ({
  'x-client-id': process.env.CASHFREE_CLIENT_ID,
  'x-client-secret': process.env.CASHFREE_CLIENT_SECRET,
  'x-api-version': '2023-08-01',
  'Content-Type': 'application/json',
});

const getCashfreeBaseUrl = () => {
  return process.env.CASHFREE_ENVIRONMENT === 'sandbox' 
    ? 'https://sandbox.cashfree.com/pg' 
    : 'https://api.cashfree.com/pg';
};

/**
 * POST /api/business/wallet/create-order
 * Creates a Cashfree order and a pending wallet_transaction.
 */
router.post('/wallet/create-order', businessAuth, async (req, res) => {
  const { amount } = req.body;
  const numAmount = parseFloat(amount);

  if (!numAmount || numAmount < 500) {
    return res.status(400).json({ success: false, message: 'Minimum amount is ₹500' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Fetch business details
    const bizRes = await client.query('SELECT * FROM advertisers WHERE id = $1', [req.businessId]);
    if (bizRes.rows.length === 0) throw new Error('Business not found');
    const biz = bizRes.rows[0];

    const internalOrderId = `order_${Date.now()}_${req.businessId}_${Math.floor(Math.random() * 1000)}`;

    // Call Cashfree API
    const response = await axios.post(`${getCashfreeBaseUrl()}/orders`, {
      order_id: internalOrderId,
      order_amount: numAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: `biz_${biz.id}`,
        customer_name: biz.company_name || 'Business User',
        customer_email: biz.email || 'no-email@srads.com',
        customer_phone: biz.phone || '9999999999',
      },
      order_meta: {
        return_url: `https://dummy.return.url/verify?order_id={order_id}` // WebView intercepts this
      },
      order_note: 'SRAds Wallet Top-up'
    }, { headers: getCashfreeHeaders() });

    const cashfreeOrder = response.data;

    // Create pending transaction
    await client.query(`
      INSERT INTO wallet_transactions (advertiser_id, amount, type, reason, cashfree_order_id, cashfree_payment_session_id, status)
      VALUES ($1, $2, 'Wallet Top-up', 'Cashfree Wallet Recharge', $3, $4, 'PENDING')
    `, [req.businessId, numAmount, internalOrderId, cashfreeOrder.payment_session_id]);

    // Generate short-lived token for WebView
    const checkoutToken = jwt.sign(
      { order_id: internalOrderId, business_id: req.businessId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '30m' }
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      order_id: internalOrderId,
      payment_session_id: cashfreeOrder.payment_session_id,
      checkout_token: checkoutToken
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Cashfree Create Order] Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Could not initialize payment' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/business/wallet/checkout/:orderId
 * Serves the Cashfree Web SDK for Expo Go WebView
 */
router.get('/wallet/checkout/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { token } = req.query;

  try {
    // Verify JWT to ensure this checkout is secure and scoped
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.order_id !== orderId) {
      return res.status(403).send('Invalid checkout link.');
    }

    // Fetch session ID
    const txnRes = await pool.query('SELECT cashfree_payment_session_id FROM wallet_transactions WHERE cashfree_order_id = $1 AND advertiser_id = $2', [orderId, decoded.business_id]);
    if (txnRes.rows.length === 0) return res.status(404).send('Order not found.');

    const paymentSessionId = txnRes.rows[0].cashfree_payment_session_id;
    const isSandbox = process.env.CASHFREE_ENVIRONMENT === 'sandbox';
    const sdkUrl = isSandbox ? 'https://sdk.cashfree.com/js/v3/cashfree.js' : 'https://sdk.cashfree.com/js/v3/cashfree.js';

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
          <title>SRAds Secure Checkout</title>
          <script src="${sdkUrl}"></script>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f8fafc; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #f59e0b; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px;}
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
      </head>
      <body>
          <div class="loader"></div>
          <p style="color: #64748b; font-weight: 600;">Initializing Secure Checkout...</p>
          <script>
              const cashfree = Cashfree({ mode: "${isSandbox ? 'sandbox' : 'production'}" });
              let checkoutOptions = {
                  paymentSessionId: "${paymentSessionId}",
                  redirectTarget: "_self"
              };
              cashfree.checkout(checkoutOptions).then((result) => {
                  if(result.error){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_FAILED', error: result.error.message }));
                  }
                  if(result.redirect){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_REDIRECT' }));
                  }
                  if(result.paymentDetails){
                      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PAYMENT_SUCCESS' }));
                  }
              });
          </script>
      </body>
      </html>
    `;

    res.send(html);
  } catch (err) {
    console.error('[Cashfree Checkout Load] Error:', err.message);
    res.status(403).send('Link expired or invalid.');
  }
});

/**
 * POST /api/business/wallet/verify-payment
 * Server-to-server verification of payment status.
 */
router.post('/wallet/verify-payment', businessAuth, async (req, res) => {
  const { order_id } = req.body;
  if (!order_id) return res.status(400).json({ success: false, message: 'Order ID required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lock the transaction row to prevent race conditions (Idempotency)
    const txnRes = await client.query(
      'SELECT * FROM wallet_transactions WHERE cashfree_order_id = $1 AND advertiser_id = $2 FOR UPDATE',
      [order_id, req.businessId]
    );

    if (txnRes.rows.length === 0) {
      throw new Error('Transaction not found or unauthorized');
    }

    const txn = txnRes.rows[0];

    // Check if already credited
    if (txn.status === 'SUCCESS') {
      await client.query('ROLLBACK');
      return res.json({ success: true, message: 'Payment already verified and credited', wallet_balance: await getCurrentBalance(req.businessId) });
    }

    // 2. Query Cashfree for real status
    const cfRes = await axios.get(`${getCashfreeBaseUrl()}/orders/${order_id}`, { headers: getCashfreeHeaders() });
    const orderData = cfRes.data;

    if (orderData.order_status === 'PAID') {
      const paidAmount = parseFloat(orderData.order_amount);
      const expectedAmount = parseFloat(txn.amount);

      if (paidAmount !== expectedAmount || orderData.order_currency !== 'INR') {
        throw new Error('Amount or currency mismatch during verification');
      }

      // 3. Credit wallet
      await client.query('UPDATE advertisers SET wallet_balance = wallet_balance + $1 WHERE id = $2', [paidAmount, req.businessId]);
      
      // 4. Update transaction
      await client.query("UPDATE wallet_transactions SET status = 'SUCCESS' WHERE id = $1", [txn.id]);
      
      await client.query('COMMIT');
      
      const newBalance = await getCurrentBalance(req.businessId);
      return res.json({ success: true, message: 'Payment successful', wallet_balance: newBalance });
    } else {
      // Payment failed or pending in Cashfree
      if (orderData.order_status === 'ACTIVE') {
        await client.query('COMMIT'); // Release lock
        return res.json({ success: false, status: 'PENDING', message: 'Payment is still pending' });
      }
      
      await client.query("UPDATE wallet_transactions SET status = 'FAILED' WHERE id = $1", [txn.id]);
      await client.query('COMMIT');
      return res.json({ success: false, status: 'FAILED', message: 'Payment failed or cancelled' });
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Cashfree Verify] Error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Verification failed' });
  } finally {
    client.release();
  }
});

async function getCurrentBalance(businessId) {
  const bizRes = await pool.query('SELECT wallet_balance FROM advertisers WHERE id = $1', [businessId]);
  return bizRes.rows[0].wallet_balance;
}

module.exports = router;
