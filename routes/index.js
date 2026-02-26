const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const orderRoutes = require('./order.routes');
const deviceRoutes = require('./device.routes');
const pricingRoutes = require('./pricing.routes');
const utilityRoutes = require('./utility.routes');
const apiGatewayRoutes = require('./apiGateway.routes');
const ipWhitelistRoutes = require('./ipWhitelist.routes');
const apiLogRoutes = require('./apiLog.routes');
const dashboardRoutes = require('./dashboard.routes');
const contactRoutes = require('./contact.routes');
const uploadRoutes = require('./upload.routes');
const exportRoutes = require('./export.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/orders', orderRoutes);
router.use('/devices', deviceRoutes);
router.use('/pricing', pricingRoutes);
router.use('/utilities', utilityRoutes);
router.use('/gateway', apiGatewayRoutes);
router.use('/ip-whitelist', ipWhitelistRoutes);
router.use('/api-logs', apiLogRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/contact', contactRoutes);
router.use('/upload', uploadRoutes);
router.use('/export', exportRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CashMyMobile API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      orders: '/api/orders',
      devices: '/api/devices',
      pricing: '/api/pricing',
      utilities: '/api/utilities',
      gateway: '/api/gateway',
      ipWhitelist: '/api/ip-whitelist',
      apiLogs: '/api/api-logs',
      dashboard: '/api/dashboard',
      contact: '/api/contact',
      upload: '/api/upload',
      export: '/api/export',
    },
  });
});

module.exports = router;
