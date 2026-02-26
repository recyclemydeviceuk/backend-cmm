const csv = require('csv-parser');
const fs = require('fs');
const logger = require('../utils/logger');

/**
 * Parse CSV file and return rows
 */
const parseCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        logger.info(`Parsed ${results.length} rows from CSV`);
        resolve(results);
      })
      .on('error', (error) => {
        logger.error(`Error parsing CSV: ${error.message}`);
        reject(error);
      });
  });
};

/**
 * Validate device CSV row
 */
const validateDeviceRow = (row, rowNumber) => {
  const errors = [];
  const requiredFields = ['brand', 'name', 'fullName', 'category'];

  requiredFields.forEach((field) => {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Row ${rowNumber}: Missing required field "${field}"`);
    }
  });

  return errors;
};

/**
 * Transform CSV row to device data
 */
const transformDeviceRow = (row) => {
  return {
    brand: row.brand?.trim() || '',
    name: row.name?.trim() || '',
    fullName: row.fullName?.trim() || '',
    category: row.category?.trim() || '',
    imageUrl: row.imageUrl?.trim() || '',
    isActive: row.isActive === 'true' || row.isActive === '1' || row.isActive === true,
    specifications: {
      screenSize: row.screenSize?.trim() || '',
      processor: row.processor?.trim() || '',
      camera: row.camera?.trim() || '',
      battery: row.battery?.trim() || '',
      releaseYear: row.releaseYear ? parseInt(row.releaseYear) : null,
    },
  };
};

/**
 * Import devices from CSV
 */
const importDevicesFromCSV = async (filePath) => {
  try {
    const rows = await parseCSV(filePath);
    const devices = [];
    const errors = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because CSV is 1-indexed and has header
      const validationErrors = validateDeviceRow(row, rowNumber);

      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        devices.push(transformDeviceRow(row));
      }
    });

    logger.info(`Imported ${devices.length} devices, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      devices,
      errors,
      total: rows.length,
      imported: devices.length,
      failed: errors.length,
    };
  } catch (error) {
    logger.error(`Error importing devices from CSV: ${error.message}`);
    throw error;
  }
};

/**
 * Validate pricing CSV row
 */
const validatePricingRow = (row, rowNumber) => {
  const errors = [];
  const requiredFields = ['deviceName', 'network', 'storage'];

  requiredFields.forEach((field) => {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Row ${rowNumber}: Missing required field "${field}"`);
    }
  });

  // Validate prices are numbers
  const priceFields = ['gradeNew', 'gradeGood', 'gradeBroken'];
  priceFields.forEach((field) => {
    if (row[field] && isNaN(parseFloat(row[field]))) {
      errors.push(`Row ${rowNumber}: Invalid number for "${field}"`);
    }
  });

  return errors;
};

/**
 * Transform CSV row to pricing data
 */
const transformPricingRow = (row) => {
  return {
    deviceName: row.deviceName?.trim() || '',
    network: row.network?.trim() || '',
    storage: row.storage?.trim() || '',
    gradeNew: row.gradeNew ? parseFloat(row.gradeNew) : 0,
    gradeGood: row.gradeGood ? parseFloat(row.gradeGood) : 0,
    gradeBroken: row.gradeBroken ? parseFloat(row.gradeBroken) : 0,
  };
};

/**
 * Import pricing from CSV
 */
const importPricingFromCSV = async (filePath) => {
  try {
    const rows = await parseCSV(filePath);
    const pricing = [];
    const errors = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const validationErrors = validatePricingRow(row, rowNumber);

      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        pricing.push(transformPricingRow(row));
      }
    });

    logger.info(`Imported ${pricing.length} pricing entries, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      pricing,
      errors,
      total: rows.length,
      imported: pricing.length,
      failed: errors.length,
    };
  } catch (error) {
    logger.error(`Error importing pricing from CSV: ${error.message}`);
    throw error;
  }
};

/**
 * Validate order CSV row
 */
const validateOrderRow = (row, rowNumber) => {
  const errors = [];
  const requiredFields = [
    'customerName',
    'customerPhone',
    'customerAddress',
    'deviceName',
    'network',
    'deviceGrade',
    'storage',
    'offeredPrice',
    'postageMethod',
  ];

  requiredFields.forEach((field) => {
    if (!row[field] || row[field].trim() === '') {
      errors.push(`Row ${rowNumber}: Missing required field "${field}"`);
    }
  });

  return errors;
};

/**
 * Transform CSV row to order data
 */
const transformOrderRow = (row) => {
  return {
    customerName: row.customerName?.trim() || '',
    customerPhone: row.customerPhone?.trim() || '',
    customerEmail: row.customerEmail?.trim() || '',
    customerAddress: row.customerAddress?.trim() || '',
    deviceName: row.deviceName?.trim() || '',
    network: row.network?.trim() || '',
    deviceGrade: row.deviceGrade?.trim().toUpperCase() || '',
    storage: row.storage?.trim() || '',
    offeredPrice: row.offeredPrice ? parseFloat(row.offeredPrice) : 0,
    postageMethod: row.postageMethod?.trim().toLowerCase() || 'label',
    source: 'CSV_IMPORT',
  };
};

/**
 * Import orders from CSV
 */
const importOrdersFromCSV = async (filePath) => {
  try {
    const rows = await parseCSV(filePath);
    const orders = [];
    const errors = [];

    rows.forEach((row, index) => {
      const rowNumber = index + 2;
      const validationErrors = validateOrderRow(row, rowNumber);

      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        orders.push(transformOrderRow(row));
      }
    });

    logger.info(`Imported ${orders.length} orders, ${errors.length} errors`);

    return {
      success: errors.length === 0,
      orders,
      errors,
      total: rows.length,
      imported: orders.length,
      failed: errors.length,
    };
  } catch (error) {
    logger.error(`Error importing orders from CSV: ${error.message}`);
    throw error;
  }
};

module.exports = {
  parseCSV,
  importDevicesFromCSV,
  importPricingFromCSV,
  importOrdersFromCSV,
};
