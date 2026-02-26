const PDFDocument = require('pdfkit');
const logger = require('../utils/logger');

/**
 * Generate an order invoice PDF and return it as a Buffer
 */
const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const primaryColor = '#2563eb';
      const greenColor = '#10b981';
      const grayColor = '#6b7280';
      const lightGray = '#f9fafb';

      // ── Header ──────────────────────────────────────────────────────────────
      doc
        .fillColor(primaryColor)
        .fontSize(26)
        .font('Helvetica-Bold')
        .text('CashMyMobile', 50, 50);

      doc
        .fillColor(grayColor)
        .fontSize(10)
        .font('Helvetica')
        .text('www.cashmymobile.co.uk', 50, 80)
        .text('Support@cashmymobile.co.uk', 50, 93);

      // Invoice label (top-right)
      doc
        .fillColor(primaryColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('ORDER INVOICE', 350, 50, { align: 'right', width: 200 });

      doc
        .fillColor(grayColor)
        .fontSize(10)
        .font('Helvetica')
        .text(`Order #: ${order.orderNumber}`, 350, 78, { align: 'right', width: 200 })
        .text(
          `Date: ${new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}`,
          350,
          91,
          { align: 'right', width: 200 }
        )
        .text(`Status: ${order.status}`, 350, 104, { align: 'right', width: 200 });

      // Divider
      doc.moveTo(50, 125).lineTo(545, 125).strokeColor('#e5e7eb').lineWidth(1).stroke();

      // ── Customer Details ─────────────────────────────────────────────────────
      doc
        .fillColor('#111827')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Customer Details', 50, 140);

      doc
        .fillColor('#374151')
        .fontSize(10)
        .font('Helvetica')
        .text(order.customerName, 50, 158)
        .text(order.customerPhone, 50, 171);

      if (order.customerEmail) {
        doc.text(order.customerEmail, 50, 184);
      }

      const addrY = order.customerEmail ? 197 : 184;
      doc.text(order.customerAddress, 50, addrY, { width: 240 });

      // ── Device Details Box ───────────────────────────────────────────────────
      const boxTop = 250;
      doc
        .fillColor(lightGray)
        .roundedRect(50, boxTop, 495, 160, 6)
        .fill();

      doc
        .fillColor('#111827')
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('Device Details', 70, boxTop + 15);

      const rows = [
        ['Device', order.deviceName],
        ['Storage', order.storage || 'N/A'],
        ['Network', order.network],
        ['Condition', order.deviceGrade],
        ['Postage Method', order.postageMethod === 'label' ? 'Print Label' : 'Post Bag'],
      ];

      let rowY = boxTop + 38;
      rows.forEach(([label, value]) => {
        doc
          .fillColor(grayColor)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(label, 70, rowY);
        doc
          .fillColor('#111827')
          .font('Helvetica')
          .text(value, 270, rowY);
        rowY += 20;
      });

      // ── Price Section ────────────────────────────────────────────────────────
      const priceTop = boxTop + 175;
      doc
        .fillColor(greenColor)
        .roundedRect(50, priceTop, 495, 55, 6)
        .fill();

      doc
        .fillColor('#ffffff')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('Offered Price', 70, priceTop + 14);

      doc
        .fillColor('#ffffff')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(`£${order.offeredPrice.toFixed(2)}`, 0, priceTop + 10, {
          align: 'right',
          width: 525,
        });

      // ── Payment Details ──────────────────────────────────────────────────────
      if (order.payoutDetails && (order.payoutDetails.accountNumber || order.payoutDetails.sortCode)) {
        const payTop = priceTop + 75;
        doc
          .fillColor('#111827')
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('Payment Details', 50, payTop);

        doc
          .fillColor(grayColor)
          .fontSize(10)
          .font('Helvetica');

        let payY = payTop + 18;
        if (order.payoutDetails.accountName) {
          doc.text(`Account Name: ${order.payoutDetails.accountName}`, 50, payY);
          payY += 15;
        }
        if (order.payoutDetails.accountNumber) {
          doc.text(`Account Number: ****${order.payoutDetails.accountNumber.slice(-4)}`, 50, payY);
          payY += 15;
        }
        if (order.payoutDetails.sortCode) {
          doc.text(`Sort Code: ${order.payoutDetails.sortCode}`, 50, payY);
        }
      }

      // ── What Happens Next ────────────────────────────────────────────────────
      const stepsTop = 560;
      doc
        .fillColor('#eff6ff')
        .roundedRect(50, stepsTop, 495, 115, 6)
        .fill();

      doc
        .fillColor(primaryColor)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('What Happens Next?', 70, stepsTop + 12);

      const steps = [
        '1. We\'ll send you a postage pack within 1-2 business days.',
        '2. Pack your device securely and send it using the provided method.',
        '3. We\'ll inspect your device and confirm the final price.',
        '4. Payment will be sent directly to your bank account.',
      ];

      doc
        .fillColor('#374151')
        .fontSize(10)
        .font('Helvetica');

      let stepY = stepsTop + 32;
      steps.forEach((step) => {
        doc.text(step, 70, stepY, { width: 455 });
        stepY += 18;
      });

      // ── Footer ───────────────────────────────────────────────────────────────
      doc
        .moveTo(50, 690)
        .lineTo(545, 690)
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();

      doc
        .fillColor(grayColor)
        .fontSize(9)
        .font('Helvetica')
        .text(
          'Thank you for choosing CashMyMobile. This is an auto-generated invoice — please keep it for your records.',
          50,
          700,
          { align: 'center', width: 495 }
        )
        .text('© 2024 CashMyMobile. All rights reserved.', 50, 715, {
          align: 'center',
          width: 495,
        });

      doc.end();
    } catch (error) {
      logger.error(`PDF generation error: ${error.message}`);
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };
