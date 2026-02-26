# CashMyMobile Backend API

Backend API server for CashMyMobile - A phone recycling platform that allows customers to sell their old phones and receive instant quotes.

## 🚀 Features

- **Admin Authentication**: OTP-based email authentication
- **Order Management**: Complete order workflow from received to paid
- **Device Catalog**: Manage devices with pricing per network/storage/condition
- **API Gateway**: External API for partner integrations
- **Email Notifications**: Automated email notifications for order status updates
- **File Uploads**: S3 integration for device images and CSV imports
- **Analytics Dashboard**: Real-time statistics and insights

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- AWS Account (for S3 and SES)

## 🛠️ Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Seed the database (optional):
```bash
npm run seed
```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📁 Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Mongoose schemas
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
├── validators/      # Input validation schemas
├── templates/       # Email templates
├── seeders/         # Database seeders
├── scripts/         # Utility scripts
└── tests/           # Test files
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to admin email
- `POST /api/auth/verify-otp` - Verify OTP and get JWT token

### Orders
- `GET /api/orders` - List all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order

### Devices
- `GET /api/devices` - List all devices
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### API Gateway
- `POST /api/gateway/decisiontech` - External order creation

*(See full API documentation for complete endpoint list)*

## 🧪 Testing

```bash
npm test
```

## 📝 Scripts

- `npm run seed` - Seed database with initial data
- `npm run clear` - Clear all database collections
- `npm run migrate` - Run data migrations

## 🔒 Security

- JWT authentication for admin routes
- IP whitelisting for external API
- Rate limiting on all endpoints
- Input validation and sanitization
- MongoDB injection protection

## 📧 Email Templates

Email templates are located in the `templates/` directory and support the following order statuses:
- Order Received
- Pack Sent
- Device Received
- Inspection Passed/Failed
- Price Revised
- Payout Ready
- Payment Sent

## 🌐 Environment Variables

See `.env.example` for all required environment variables.

## 📄 License

Private - CashMyMobile © 2026
