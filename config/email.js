const path = require('path');

const emailConfig = {
  from: process.env.AWS_SES_FROM_EMAIL || 'noreply@cashmymobile.co.uk',
  replyTo: process.env.AWS_SES_VERIFIED_EMAIL || 'admin@recyclemydevice.com',
  
  // Email templates directory
  templatesDir: path.join(__dirname, '../templates'),
  
  // Template mappings
  templates: {
    otp: {
      subject: 'Admin OTP - CashMyMobile',
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
    counterOfferReceived: {
      subject: 'Counter Offer for Your Device - CashMyMobile',
      template: 'counterOfferReceived.html',
    },
    counterOfferAccepted: {
      subject: 'Counter Offer Accepted - CashMyMobile',
      template: 'counterOfferAccepted.html',
    },
    counterOfferDeclined: {
      subject: 'Counter Offer Declined - CashMyMobile',
      template: 'counterOfferDeclined.html',
    },
  },
  
  // Email content defaults
  defaults: {
    companyName: 'CashMyMobile',
    websiteUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    supportEmail: 'Support@cashmymobile.co.uk',
    supportPhone: '03333356679',
    logoUrl: 'https://res.cloudinary.com/dn2sab6qc/image/upload/v1771700003/Cashmymobile_logo_y7ndez.png',
  },
};

module.exports = emailConfig;
