const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../../middleware/auth');

// Import route modules
const authRoutes = require('./auth');
const webhookRoutes = require('./webHooks');
const adminRoutes = require('./admin');

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     tags: [Health]
 *     description: Check if the API is running and healthy
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "VTU API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'VTU API is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Detailed Health Check
 *     tags: [Health]
 *     description: Get detailed health status including database connection
 *     responses:
 *       200:
 *         description: All systems are healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "All systems operational"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "connected"
 *                     redis:
 *                       type: string
 *                       example: "connected"
 *                     external_apis:
 *                       type: string
 *                       example: "operational"
 *       503:
 *         description: One or more services are down
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Service unavailable"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T10:30:00.000Z"
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "disconnected"
 *                     redis:
 *                       type: string
 *                       example: "connected"
 *                     external_apis:
 *                       type: string
 *                       example: "operational"
 */
router.get('/health', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const healthStatus = {
      success: true,
      message: 'All systems operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: dbStatus,
        redis: 'connected', // You can add actual Redis check here
        external_apis: 'operational'
      }
    };

    // If any service is down, return 503
    if (dbStatus !== 'connected') {
      healthStatus.success = false;
      healthStatus.message = 'Service unavailable';
      return res.status(503).json(healthStatus);
    }

    res.json(healthStatus);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Health check failed',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal error'
    });
  }
});

/**
 * @swagger
 * /status:
 *   get:
 *     summary: API Status Information
 *     tags: [Health]
 *     description: Get API status and configuration information
 *     responses:
 *       200:
 *         description: API status information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "operational"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     features:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["airtime", "data", "cable_tv", "electricity", "wallet"]
 *                     rateLimit:
 *                       type: object
 *                       properties:
 *                         windowMs:
 *                           type: number
 *                           example: 900000
 *                         maxRequests:
 *                           type: number
 *                           example: 100
 *                     maintenance:
 *                       type: object
 *                       properties:
 *                         isMaintenanceMode:
 *                           type: boolean
 *                           example: false
 *                         scheduledMaintenance:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-20T02:00:00.000Z"
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'operational',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      features: ['airtime', 'data', 'cable_tv', 'electricity', 'wallet'],
      rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
      },
      maintenance: {
        isMaintenanceMode: false,
        scheduledMaintenance: null
      }
    }
  });
});

/**
 * @swagger
 * /protected:
 *   get:
 *     summary: Protected Route Test
 *     tags: [Health]
 *     security:
 *       - bearerAuth: []
 *     description: Test protected route access
 *     responses:
 *       200:
 *         description: Successfully accessed protected route
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Protected route accessed successfully"
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     role:
 *                       type: string
 *                       example: "user"
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/protected', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Protected route accessed successfully',
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

/**
 * @swagger
 * /docs:
 *   get:
 *     summary: API Documentation Redirect
 *     tags: [Health]
 *     description: Redirect to Swagger API documentation
 *     responses:
 *       302:
 *         description: Redirect to API documentation
 *         headers:
 *           Location:
 *             description: URL to API documentation
 *             schema:
 *               type: string
 *               example: "/api-docs"
 */
router.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// API Documentation
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'B-Classy API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      vtu: '/api/vtu',
      wallet: '/api/wallet'
    },
    documentation: 'API documentation will be available soon'
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/hooks', webhookRoutes);
router.use('/admin',adminRoutes);

// 404 handler for API routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

module.exports = router; 