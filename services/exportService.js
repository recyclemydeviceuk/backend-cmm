const { Parser } = require('@json2csv/plainjs');
const archiver = require('archiver');
const logger = require('../utils/logger');

/**
 * Export orders to CSV
 */
const exportOrdersToCSV = async (orders) => {
  try {
    const fields = [
      { label: 'Order Number', value: 'orderNumber' },
      { label: 'Source', value: 'source' },
      { label: 'Status', value: 'status' },
      { label: 'Customer Name', value: 'customerName' },
      { label: 'Customer Phone', value: 'customerPhone' },
      { label: 'Customer Email', value: 'customerEmail' },
      { label: 'Device Name', value: 'deviceName' },
      { label: 'Network', value: 'network' },
      { label: 'Storage', value: 'storage' },
      { label: 'Device Grade', value: 'deviceGrade' },
      { label: 'Offered Price', value: 'offeredPrice' },
      { label: 'Final Price', value: 'finalPrice' },
      { label: 'Payment Status', value: 'paymentStatus' },
      { label: 'Postage Method', value: 'postageMethod' },
      { label: 'Tracking Number', value: 'trackingNumber' },
      { label: 'Created At', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(orders);

    logger.info(`Exported ${orders.length} orders to CSV`);
    return csv;
  } catch (error) {
    logger.error(`Error exporting orders to CSV:`, error.message);
    throw error;
  }
};

/**
 * Export devices to CSV
 */
const exportDevicesToCSV = async (devices) => {
  try {
    const fields = [
      { label: 'Brand', value: 'brand' },
      { label: 'Name', value: 'name' },
      { label: 'Full Name', value: 'fullName' },
      { label: 'Category', value: 'category' },
      { label: 'Is Active', value: 'isActive' },
      { label: 'Screen Size', value: 'specifications.screenSize' },
      { label: 'Processor', value: 'specifications.processor' },
      { label: 'Camera', value: 'specifications.camera' },
      { label: 'Battery', value: 'specifications.battery' },
      { label: 'Release Year', value: 'specifications.releaseYear' },
      { label: 'Image URL', value: 'imageUrl' },
      { label: 'Created At', value: 'createdAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(devices);

    logger.info(`Exported ${devices.length} devices to CSV`);
    return csv;
  } catch (error) {
    logger.error(`Error exporting devices to CSV:`, error.message);
    throw error;
  }
};

/**
 * Export pricing to CSV
 */
const exportPricingToCSV = async (pricing) => {
  try {
    const fields = [
      { label: 'Device Name', value: 'deviceName' },
      { label: 'Network', value: 'network' },
      { label: 'Storage', value: 'storage' },
      { label: 'NEW Price', value: 'gradeNew' },
      { label: 'GOOD Price', value: 'gradeGood' },
      { label: 'BROKEN Price', value: 'gradeBroken' },
      { label: 'Updated At', value: 'updatedAt' },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(pricing);

    logger.info(`Exported ${pricing.length} pricing entries to CSV`);
    return csv;
  } catch (error) {
    logger.error(`Error exporting pricing to CSV:`, error.message);
    throw error;
  }
};

/**
 * Export analytics to CSV
 */
const exportAnalyticsToCSV = async (analyticsData) => {
  try {
    const sections = [];

    // Summary section
    sections.push('SUMMARY');
    sections.push(`Total Orders,${analyticsData.summary.totalOrders}`);
    sections.push(`Total Revenue,£${analyticsData.summary.totalRevenue}`);
    sections.push(`Paid Orders,${analyticsData.summary.paidOrders}`);
    sections.push(`Average Order Value,£${analyticsData.summary.avgOrderValue}`);
    sections.push('');

    // Status breakdown
    sections.push('STATUS BREAKDOWN');
    sections.push('Status,Count');
    analyticsData.statusBreakdown.forEach((item) => {
      sections.push(`${item._id},${item.count}`);
    });
    sections.push('');

    // Top devices
    sections.push('TOP DEVICES');
    sections.push('Device,Order Count,Total Value');
    analyticsData.topDevices.forEach((item) => {
      sections.push(`${item._id},${item.count},£${item.totalValue}`);
    });

    const csv = sections.join('\n');

    logger.info('Exported analytics to CSV');
    return csv;
  } catch (error) {
    logger.error(`Error exporting analytics to CSV:`, error.message);
    throw error;
  }
};

/**
 * Export all data to ZIP
 */
const exportAllDataToZip = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const archive = archiver('zip', {
        zlib: { level: 9 },
      });

      const chunks = [];

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => {
        const buffer = Buffer.concat(chunks);
        logger.info('Created ZIP archive with all data');
        resolve(buffer);
      });
      archive.on('error', reject);

      // Add CSV files to archive
      const ordersCSV = await exportOrdersToCSV(data.orders);
      archive.append(ordersCSV, { name: 'orders.csv' });

      const devicesCSV = await exportDevicesToCSV(data.devices);
      archive.append(devicesCSV, { name: 'devices.csv' });

      const pricingCSV = await exportPricingToCSV(data.pricing);
      archive.append(pricingCSV, { name: 'pricing.csv' });

      // Finalize archive
      archive.finalize();
    } catch (error) {
      logger.error(`Error creating ZIP archive:`, error.message);
      reject(error);
    }
  });
};

module.exports = {
  exportOrdersToCSV,
  exportDevicesToCSV,
  exportPricingToCSV,
  exportAnalyticsToCSV,
  exportAllDataToZip,
};
