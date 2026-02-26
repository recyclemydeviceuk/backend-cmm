const winston = require('winston');
const path = require('path');

/**
 * Winston logger configuration
 * Logs to console and file
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define file format (without colors)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.uncolorize(),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format,
  }),
  
  // Error log file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: fileFormat,
  }),
  
  // Combined log file
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    format: fileFormat,
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log'),
      format: fileFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log'),
      format: fileFormat,
    }),
  ],
});

module.exports = logger;
