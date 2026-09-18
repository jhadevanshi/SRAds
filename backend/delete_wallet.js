const pool = require('./config/database');

async function deleteWalletData() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const advertiserId = 4;
    
    // Delete transactions
    const delRes = await client.query('DELETE FROM wallet_transactions WHERE advertiser_id = $1', [advertiserId]);
    console.log(`Deleted ${delRes.rowCount} wallet transactions.`);
    
    // Reset balance
    await client.query('UPDATE advertisers SET wallet_balance = 0 WHERE id = $1', [advertiserId]);
    console.log(`Reset wallet_balance to 0 for advertiser ${advertiserId}.`);
    
    await client.query('COMMIT');
    console.log('Wallet data successfully deleted.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting wallet data:', error);
  } finally {
    client.release();
    pool.end();
  }
}

deleteWalletData();
