const path = require('path');

const emailConfig = {
  from: process.env.AWS_SES_FROM_EMAIL || 'mailer@zennara.in',
  replyTo: process.env.AWS_SES_VERIFIED_EMAIL || 'admin@recyclemydevice.com',
  
  // Email templates directory
  templatesDir: path.join(__dirname, '../templates'),
  
  // Template mappings
  templates: {
    otp: {
      subject: 'Your Admin Login OTP - CashMyMobile',
      template: 'otpEmail.html',
    },
    orderReceived: {
      subject: 'Order Received - CashMyMobile',
      template: 'orderReceived.html',
    },
    packSent: {
      subject: 'Postage Pack Sent - CashMyMobile',
      template: 'packSent.html',
    },
    deviceReceived: {
      subject: 'Device Received - CashMyMobile',
      template: 'deviceReceived.html',
    },
    inspectionPassed: {
      subject: 'Device Inspection Passed - CashMyMobile',
      template: 'inspectionPassed.html',
    },
    inspectionFailed: {
      subject: 'Device Inspection Update - CashMyMobile',
      template: 'inspectionFailed.html',
    },
    priceRevised: {
      subject: 'Price Revision - CashMyMobile',
      template: 'priceRevised.html',
    },
    payoutReady: {
      subject: 'Payout Ready - CashMyMobile',
      template: 'payoutReady.html',
    },
    paymentSent: {
      subject: 'Payment Sent - CashMyMobile',
      template: 'paymentSent.html',
    },
    contactConfirmation: {
      subject: 'We Received Your Message - CashMyMobile',
      template: 'contactConfirmation.html',
    },
  },
  
  // Email content defaults
  defaults: {
    companyName: 'CashMyMobile',
    websiteUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    supportEmail: 'Support@cashmymobile.co.uk',
    supportPhone: '03332244018',
    logoUrl: 'https://res.cloudinary.com/dn2sab6qc/image/upload/v1771700003/Cashmymobile_logo_y7ndez.png',
  },
};

module.exports = emailConfig;
