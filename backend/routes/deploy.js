const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');

const DEPLOY_SECRET = process.env.DEPLOY_SECRET || 'srads_auto_deploy_secret_2026';

// Webhook endpoint for Auto-Deployment
router.post('/webhook', (req, res) => {
  const secretHeader = req.headers['x-deploy-secret'] || req.query.secret;
  
  // Basic security check (header or secret query param)
  if (secretHeader && secretHeader !== DEPLOY_SECRET) {
    return res.status(403).json({ success: false, message: 'Invalid deployment secret' });
  }

  console.log('🚀 [Auto-Deploy] Deployment triggered...');
  
  res.json({
    success: true,
    message: 'Auto-deployment initiated. Pulling latest code and reloading PM2...',
    timestamp: new Date().toISOString()
  });

  // Execute pull and reload asynchronously
  const projectRoot = path.resolve(__dirname, '..');
  const deployCommand = `git pull origin main && pm2 restart all`;

  exec(deployCommand, { cwd: projectRoot }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ [Auto-Deploy Error]:', error.message);
      console.error('STDERR:', stderr);
      return;
    }
    console.log('✅ [Auto-Deploy Success]:\n', stdout);
  });
});

// Manual status check for deploy route
router.get('/status', (req, res) => {
  res.json({
    success: true,
    service: 'SRAds Auto-Deploy Webhook',
    status: 'Ready',
    configuredRoot: path.resolve(__dirname, '..')
  });
});

module.exports = router;
