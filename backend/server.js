const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT) || 5000;

// Middleware
app.set('trust proxy', true);   // trust x-forwarded-proto from ngrok / reverse proxies
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
  })
);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/advertisers', require('./routes/advertisers'));
app.use('/api/devices', require('./routes/devices'));
app.use('/api/media', require('./routes/media'));
app.use('/api/ads', require('./routes/ads'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/driver', require('./routes/driver'));
app.use('/api/admin/drivers', require('./routes/admin_drivers'));
app.use('/api/business', require('./routes/business'));
app.use('/api/deploy', require('./routes/deploy'));
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SRAds API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ── Offline detection ────────────────────────────────────────────────────
// Mark devices as Offline if no heartbeat received for 60+ seconds.
// Runs every 30 seconds regardless of app state — handles crash, battery
// death, network loss, app kill, background process stop.
const OFFLINE_TIMEOUT_SECONDS = 180;
const OFFLINE_CHECK_INTERVAL_MS = 60000;

// Validate Cashfree Environment Variables on Startup
if (process.env.NODE_ENV === 'production') {
  if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
    console.error('\n===================================================================================');
    console.error('❌ FATAL ERROR: Production Cashfree credentials missing!');
    console.error('Ensure CASHFREE_CLIENT_ID and CASHFREE_CLIENT_SECRET are set in your production environment.');
    console.error('===================================================================================\n');
    process.exit(1);
  }
  if (!process.env.BACKEND_PUBLIC_URL) {
    console.warn('⚠️ WARNING: BACKEND_PUBLIC_URL is not set. Webhooks and return URLs may fail in production.');
  }
} else if (!process.env.CASHFREE_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET.trim() === '' || process.env.CASHFREE_CLIENT_SECRET === '<your_existing_secret>') {
  console.error('\n===================================================================================');
  console.error('❌ FATAL ERROR: CASHFREE_CLIENT_SECRET is missing from your backend/.env file!');
  console.error('You MUST add your secret key from the Cashfree Dashboard for payments to work.');
  console.error('Example: CASHFREE_CLIENT_SECRET=test_123456789...');
  console.error('===================================================================================\n');
}

async function markStaleDevicesOffline() {
  try {
    const pool = require('./config/database');
    const result = await pool.query(
      `UPDATE devices SET status = 'Offline', updated_at = CURRENT_TIMESTAMP
       WHERE status = 'Online'
       AND (heartbeat_at IS NULL OR heartbeat_at < NOW() - INTERVAL '${OFFLINE_TIMEOUT_SECONDS} seconds')`
    );
    if (result.rowCount > 0) {
      console.log(`[Offline Detection] Marked ${result.rowCount} device(s) as Offline (no heartbeat >${OFFLINE_TIMEOUT_SECONDS}s)`);
    }
  } catch (err) {
    console.error('[Offline Detection] Error:', err.message);
  }
}

setInterval(markStaleDevicesOffline, OFFLINE_CHECK_INTERVAL_MS);
console.log(`[Offline Detection] Started (check every ${OFFLINE_CHECK_INTERVAL_MS / 1000}s, timeout ${OFFLINE_TIMEOUT_SECONDS}s)`);

const startServer = (port = DEFAULT_PORT, attempts = 0) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Initialize WebSockets
    try {
      const { initWebSocket } = require('./services/websocket');
      initWebSocket(server);
    } catch (wsErr) {
      console.error('Failed to initialize WebSocket server:', wsErr.message);
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      if (attempts >= 10) {
        console.error(`Unable to find an available port after 10 attempts.`);
        process.exit(1);
      }

      const nextPort = port + 1;
      console.warn(`Port ${port} is already in use. Trying ${nextPort}...`);
      server.close(() => startServer(nextPort, attempts + 1));
    } else {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  });
};

startServer();
