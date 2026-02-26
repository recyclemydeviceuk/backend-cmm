const { sesClient } = require('../config/aws');
const { SendEmailCommand, SendRawEmailCommand } = require('@aws-sdk/client-ses');
const emailConfig = require('../config/email');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');
const { generateInvoicePDF } = require('./pdfService');

/**
 * Replace template variables with actual values
 */
const replaceTemplateVars = (template, variables) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value || '');
  }
  return result;
};

/**
 * Load email template from file
 */
const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf-8');
    return template;
  } catch (error) {
    logger.error(`Error loading template ${templateName}:`, error.message);
    // Return basic template if file not found
    return emailConfig.templates[templateName]?.defaultContent || '<p>{{message}}</p>';
  }
};

/**
 * Send email via AWS SES
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const params = {
      Source: emailConfig.from,
      Destination: {
        ToAddresses: Array.isArray(to) ? to : [to],
      },
      Message: {
        Subject: {
          Data: subject,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: html,
            Charset: 'UTF-8',
          },
          ...(text && {
            Text: {
              Data: text,
              Charset: 'UTF-8',
            },
          }),
        },
      },
    };

    const command = new SendEmailCommand(params);
    const result = await sesClient.send(command);

    logger.info(`Email sent successfully to ${to}. MessageId: ${result.MessageId}`);
    return result;
  } catch (error) {
    logger.error(`Error sending email to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Build a raw MIME email with optional PDF attachment for AWS SES
 */
const buildRawEmail = ({ from, to, subject, html, pdfBuffer, pdfFilename }) => {
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const recipients = Array.isArray(to) ? to : [to];

  const lines = [
    `From: ${from}`,
    `To: ${recipients.join(', ')}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
  ];

  if (pdfBuffer && pdfFilename) {
    const b64 = pdfBuffer.toString('base64');
    const chunks = b64.match(/.{1,76}/g) || [];
    lines.push(
      `--${boundary}`,
      `Content-Type: application/pdf; name="${pdfFilename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${pdfFilename}"`,
      '',
      ...chunks
    );
  }

  lines.push(`--${boundary}--`);
  return lines.join('\r\n');
};

/**
 * Send email with optional PDF attachment via AWS SES SendRawEmailCommand
 */
const sendRawEmail = async ({ to, subject, html, pdfBuffer, pdfFilename }) => {
  try {
    const rawMessage = buildRawEmail({
      from: emailConfig.from,
      to,
      subject,
      html,
      pdfBuffer,
      pdfFilename,
    });

    const command = new SendRawEmailCommand({
      RawMessage: { Data: Buffer.from(rawMessage) },
    });

    const result = await sesClient.send(command);
    const recipients = Array.isArray(to) ? to.join(', ') : to;
    logger.info(`Raw email sent successfully to ${recipients}. MessageId: ${result.MessageId}`);
    return result;
  } catch (error) {
    logger.error(`Error sending raw email to ${to}:`, error.message);
    throw error;
  }
};

/**
 * Send OTP email to admin
 */
const sendOTP = async (email, otp) => {
  try {
    const template = await loadTemplate('otp');
    const html = replaceTemplateVars(template, {
      otp,
      email,
      companyName: 'CashMyMobile',
      validityMinutes: '10',
    });

    await sendEmail({
      to: email,
      subject: 'Your Admin Login OTP',
      html,
    });

    logger.info(`OTP email sent to ${email}`);
  } catch (error) {
    logger.error(`Error sending OTP email:`, error.message);
    throw error;
  }
};

/**
 * Send order confirmation email
 */
const sendOrderConfirmation = async (order) => {
  try {
    if (!order.customerEmail) return;

    const template = await loadTemplate('orderReceived');
    const html = replaceTemplateVars(template, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      deviceName: order.deviceName,
      network: order.network,
      storage: order.storage,
      deviceGrade: order.deviceGrade,
      offeredPrice: order.offeredPrice.toFixed(2),
      companyName: 'CashMyMobile',
      supportEmail: process.env.SUPPORT_EMAIL || 'Support@cashmymobile.co.uk',
      supportPhone: process.env.SUPPORT_PHONE || '03332244018',
    });

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(order);
    const pdfFilename = `Invoice-${order.orderNumber}.pdf`;

    await sendRawEmail({
      to: order.customerEmail,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html,
      pdfBuffer,
      pdfFilename,
    });

    logger.info(`Order confirmation with PDF invoice sent for ${order.orderNumber}`);
  } catch (error) {
    logger.error(`Error sending order confirmation:`, error.message);
    throw error;
  }
};

/**
 * Send order status update email
 */
const sendOrderStatusUpdate = async (order, oldStatus) => {
  try {
    if (!order.customerEmail) return;

    const statusMessages = {
      PACK_SENT: 'Your postage pack has been sent',
      DEVICE_RECEIVED: 'We have received your device',
      INSPECTION_PASSED: 'Your device has passed inspection',
      INSPECTION_FAILED: 'Your device did not pass inspection',
      PRICE_REVISED: 'The price for your device has been revised',
      PAYOUT_READY: 'Your payment is ready to be processed',
      PAID: 'Payment has been sent',
      CLOSED: 'Your order has been completed',
      CANCELLED: 'Your order has been cancelled',
    };

    const template = await loadTemplate('orderStatusUpdate');
    const html = replaceTemplateVars(template, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      oldStatus: oldStatus,
      newStatus: order.status,
      statusMessage: statusMessages[order.status] || 'Status updated',
      deviceName: order.deviceName,
      finalPrice: order.finalPrice ? `£${order.finalPrice.toFixed(2)}` : `£${order.offeredPrice.toFixed(2)}`,
      companyName: 'CashMyMobile',
    });

    await sendEmail({
      to: order.customerEmail,
      subject: `Order Update - ${order.orderNumber}`,
      html,
    });

    logger.info(`Status update email sent for ${order.orderNumber} (${oldStatus} -> ${order.status})`);
  } catch (error) {
    logger.error(`Error sending status update email:`, error.message);
    throw error;
  }
};

/**
 * Send contact form confirmation
 */
const sendContactConfirmation = async (submission) => {
  try {
    const template = await loadTemplate('contactConfirmation');
    const html = replaceTemplateVars(template, {
      name: submission.name,
      subject: submission.subject,
      message: submission.message,
      companyName: 'CashMyMobile',
    });

    await sendEmail({
      to: submission.email,
      subject: 'We received your message',
      html,
    });

    logger.info(`Contact confirmation sent to ${submission.email}`);
  } catch (error) {
    logger.error(`Error sending contact confirmation:`, error.message);
    throw error;
  }
};

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmation = async (order) => {
  try {
    if (!order.customerEmail) return;

    const template = await loadTemplate('paymentConfirmation');
    const html = replaceTemplateVars(template, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      deviceName: order.deviceName,
      paidAmount: order.finalPrice ? `£${order.finalPrice.toFixed(2)}` : `£${order.offeredPrice.toFixed(2)}`,
      bankName: order.payoutDetails?.bankName || 'your bank',
      accountNumber: order.payoutDetails?.accountNumber ? `****${order.payoutDetails.accountNumber.slice(-4)}` : '',
      companyName: 'CashMyMobile',
    });

    await sendEmail({
      to: order.customerEmail,
      subject: `Payment Sent - ${order.orderNumber}`,
      html,
    });

    logger.info(`Payment confirmation sent for ${order.orderNumber}`);
  } catch (error) {
    logger.error(`Error sending payment confirmation:`, error.message);
    throw error;
  }
};

/**
 * Send price revision email to customer
 */
const sendPriceRevisionEmail = async (order, oldPrice, newPrice, reason) => {
  try {
    if (!order.customerEmail) return;

    const template = await loadTemplate('priceRevision');
    const html = replaceTemplateVars(template, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      deviceName: order.deviceName,
      originalPrice: `£${oldPrice.toFixed(2)}`,
      revisedPrice: `£${newPrice.toFixed(2)}`,
      revisionReason: reason || 'Price adjustment after inspection',
      companyName: 'CashMyMobile',
      supportEmail: process.env.SUPPORT_EMAIL || 'Support@cashmymobile.co.uk',
      supportPhone: process.env.SUPPORT_PHONE || '03332244018',
    });

    await sendEmail({
      to: order.customerEmail,
      subject: `Price Revision - ${order.orderNumber}`,
      html,
    });

    logger.info(`Price revision email sent for ${order.orderNumber} (${oldPrice} -> ${newPrice})`);
  } catch (error) {
    logger.error(`Error sending price revision email:`, error.message);
    throw error;
  }
};

/**
 * Send order completion and thank you email with invoice
 */
const sendOrderCompletionEmail = async (order) => {
  try {
    if (!order.customerEmail) return;

    const template = await loadTemplate('orderCompleted');
    const html = replaceTemplateVars(template, {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      deviceName: order.deviceName,
      deviceGrade: order.deviceGrade,
      finalPrice: (order.finalPrice || order.offeredPrice).toFixed(2),
      companyName: 'CashMyMobile',
      supportEmail: process.env.SUPPORT_EMAIL || 'Support@cashmymobile.co.uk',
      supportPhone: process.env.SUPPORT_PHONE || '03332244018',
    });

    // Generate PDF invoice
    const pdfBuffer = await generateInvoicePDF(order);
    const pdfFilename = `Invoice-${order.orderNumber}.pdf`;

    await sendRawEmail({
      to: order.customerEmail,
      subject: `Order Completed & Paid - ${order.orderNumber}`,
      html,
      pdfBuffer,
      pdfFilename,
    });

    logger.info(`Order completion email with PDF invoice sent for ${order.orderNumber}`);
  } catch (error) {
    logger.error(`Error sending order completion email:`, error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendRawEmail,
  sendOTP,
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendContactConfirmation,
  sendPaymentConfirmation,
  sendPriceRevisionEmail,
  sendOrderCompletionEmail,
};
