const swaggerJsDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CashMyMobile API',
      version: '1.0.0',
      description: 'Backend API for CashMyMobile - Phone Recycling Platform',
      contact: {
        name: 'CashMyMobile Support',
        email: 'Support@cashmymobile.co.uk',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.cashmymobile.co.uk'
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ipWhitelist: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Forwarded-For',
          description: 'IP-based authentication for external API',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            orderNumber: { type: 'string' },
            source: { type: 'string', enum: ['WEBSITE', 'API'] },
            status: { 
              type: 'string',
              enum: ['RECEIVED', 'PACK_SENT', 'DEVICE_RECEIVED', 'INSPECTION_PASSED', 
                     'INSPECTION_FAILED', 'PRICE_REVISED', 'PAYOUT_READY', 'PAID', 'CLOSED', 'CANCELLED']
            },
            customerName: { type: 'string' },
            customerPhone: { type: 'string' },
            customerEmail: { type: 'string' },
            customerAddress: { type: 'string' },
            deviceId: { type: 'string' },
            deviceName: { type: 'string' },
            network: { type: 'string' },
            deviceGrade: { type: 'string', enum: ['NEW', 'GOOD', 'BROKEN'] },
            storage: { type: 'string' },
            offeredPrice: { type: 'number' },
            finalPrice: { type: 'number' },
            postageMethod: { type: 'string', enum: ['label', 'postbag'] },
            paymentMethod: { type: 'string' },
            paymentStatus: { type: 'string', enum: ['PENDING', 'PAID'] },
            payoutDetails: {
              type: 'object',
              properties: {
                bankName: { type: 'string' },
                accountNumber: { type: 'string' },
                sortCode: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Device: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            brand: { type: 'string' },
            name: { type: 'string' },
            fullName: { type: 'string' },
            category: { type: 'string' },
            imageUrl: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Admin authentication endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Devices', description: 'Device catalog endpoints' },
      { name: 'Pricing', description: 'Pricing management endpoints' },
      { name: 'Utilities', description: 'Utility items endpoints' },
      { name: 'API Gateway', description: 'External API endpoints' },
      { name: 'Dashboard', description: 'Dashboard statistics endpoints' },
      { name: 'Upload', description: 'File upload endpoints' },
      { name: 'Export', description: 'Data export endpoints' },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'], // Path to API docs
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

module.exports = swaggerSpec;
