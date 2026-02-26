const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');
const routes = require('./routes');

/**
 * Initialize Express Application
 */
const app = express();

/**
 * Environment Variables
 */
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cashmymobile';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

/**
 * Ensure required directories exist
 */
const createDirectories = () => {
  const dirs = [
    path.join(__dirname, 'logs'),
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/images'),
    path.join(__dirname, 'uploads/csv'),
    path.join(__dirname, 'exports'),
  ];

  dirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });
};

createDirectories();

/**
 * Security Middleware
 */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

/**
 * CORS Configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = CORS_ORIGIN.split(',').map(o => o.trim());
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

/**
 * Body Parser Middleware
 */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/**
 * Request Logging Middleware
 */
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

/**
 * Static Files
 */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    memory: process.memoryUsage(),
  });
});

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CashMyMobile API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Favicon Handler
 */
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

/**
 * API Routes
 */
app.use('/api', routes);

/**
 * 404 Handler
 */
app.use(notFound);

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * MongoDB Connection
 */
const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(MONGODB_URI, options);
    
    logger.info('✅ MongoDB connected successfully');
    logger.info(`📊 Database: ${mongoose.connection.name}`);
    logger.info(`🔗 Host: ${mongoose.connection.host}`);
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * MongoDB Connection Events
 */
mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from MongoDB');
});

/**
 * Graceful Shutdown
 */
const gracefulShutdown = async (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close server
    if (server) {
      await new Promise((resolve) => {
        server.close(() => {
          logger.info('HTTP server closed');
          resolve();
        });
      });
    }
    
    // Close MongoDB connection
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

/**
 * Process Event Handlers
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit in production, just log
  if (NODE_ENV !== 'production') {
    process.exit(1);
  }
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Exit on uncaught exceptions
  process.exit(1);
});

/**
 * Start Server
 */
let server;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    server = app.listen(PORT, () => {
      logger.info('=================================');
      logger.info(`🚀 Server started successfully!`);
      logger.info(`📍 Environment: ${NODE_ENV}`);
      logger.info(`🌐 URL: http://localhost:${PORT}`);
      logger.info(`📡 API: http://localhost:${PORT}/api`);
      logger.info(`💚 Health: http://localhost:${PORT}/health`);
      logger.info('=================================');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
      } else {
        logger.error('❌ Server error:', error);
      }
      process.exit(1);
    });
    
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Initialize Application
 */
if (require.main === module) {
  startServer();
}

/**
 * Export for testing
 */
module.exports = app;
