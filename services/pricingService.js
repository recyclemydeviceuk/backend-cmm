const Pricing = require('../models/Pricing');
const Device = require('../models/Device');
const logger = require('../utils/logger');

/**
 * Get price quote for device configuration
 */
const getQuote = async (deviceId, network, storage, deviceGrade) => {
  try {
    // Find device first
    const device = await Device.findById(deviceId);
    if (!device) {
      throw new Error('Device not found');
    }

    // Find pricing entry
    const pricing = await Pricing.findOne({
      deviceId,
      network,
      storage,
    });

    if (!pricing) {
      logger.warn(`No pricing found for ${device.name} - ${network} - ${storage}`);
      return {
        found: false,
        device: device.fullName,
        network,
        storage,
        deviceGrade,
        price: 0,
      };
    }

    // Get price based on grade
    let price = 0;
    switch (deviceGrade.toUpperCase()) {
      case 'NEW':
        price = pricing.gradeNew;
        break;
      case 'GOOD':
        price = pricing.gradeGood;
        break;
      case 'BROKEN':
        price = pricing.gradeBroken;
        break;
      default:
        throw new Error(`Invalid device grade: ${deviceGrade}`);
    }

    return {
      found: true,
      device: device.fullName,
      network,
      storage,
      deviceGrade: deviceGrade.toUpperCase(),
      price,
      pricingId: pricing._id,
    };
  } catch (error) {
    logger.error(`Error getting quote: ${error.message}`);
    throw error;
  }
};

/**
 * Get all pricing for a device
 */
const getAllPricingForDevice = async (deviceId) => {
  try {
    const pricing = await Pricing.find({ deviceId }).sort({
      network: 1,
      storage: 1,
    });

    return pricing;
  } catch (error) {
    logger.error(`Error getting pricing for device: ${error.message}`);
    throw error;
  }
};

/**
 * Calculate price adjustment based on percentage
 */
const calculatePriceAdjustment = (currentPrice, adjustmentPercent) => {
  const adjustment = (currentPrice * adjustmentPercent) / 100;
  return Math.round(currentPrice + adjustment);
};

/**
 * Bulk update pricing by percentage
 */
const bulkAdjustPricing = async (filters, adjustmentPercent) => {
  try {
    const query = {};
    if (filters.deviceId) query.deviceId = filters.deviceId;
    if (filters.network) query.network = filters.network;
    if (filters.storage) query.storage = filters.storage;

    const pricingEntries = await Pricing.find(query);

    const updates = pricingEntries.map((entry) => ({
      updateOne: {
        filter: { _id: entry._id },
        update: {
          gradeNew: calculatePriceAdjustment(entry.gradeNew, adjustmentPercent),
          gradeGood: calculatePriceAdjustment(entry.gradeGood, adjustmentPercent),
          gradeBroken: calculatePriceAdjustment(entry.gradeBroken, adjustmentPercent),
          updatedAt: new Date(),
        },
      },
    }));

    const result = await Pricing.bulkWrite(updates);

    logger.info(`Bulk adjusted ${result.modifiedCount} pricing entries by ${adjustmentPercent}%`);

    return {
      matched: result.matchedCount,
      modified: result.modifiedCount,
      adjustmentPercent,
    };
  } catch (error) {
    logger.error(`Error in bulk price adjustment: ${error.message}`);
    throw error;
  }
};

/**
 * Get pricing statistics
 */
const getPricingStatistics = async () => {
  try {
    const [totalEntries, avgPrices, priceRanges, byNetwork] = await Promise.all([
      Pricing.countDocuments(),
      Pricing.aggregate([
        {
          $group: {
            _id: null,
            avgNew: { $avg: '$gradeNew' },
            avgGood: { $avg: '$gradeGood' },
            avgBroken: { $avg: '$gradeBroken' },
          },
        },
      ]),
      Pricing.aggregate([
        {
          $group: {
            _id: null,
            minNew: { $min: '$gradeNew' },
            maxNew: { $max: '$gradeNew' },
            minGood: { $min: '$gradeGood' },
            maxGood: { $max: '$gradeGood' },
            minBroken: { $min: '$gradeBroken' },
            maxBroken: { $max: '$gradeBroken' },
          },
        },
      ]),
      Pricing.aggregate([
        { $group: { _id: '$network', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    return {
      totalEntries,
      averagePrices: avgPrices[0] || {},
      priceRanges: priceRanges[0] || {},
      byNetwork,
    };
  } catch (error) {
    logger.error(`Error getting pricing statistics: ${error.message}`);
    throw error;
  }
};

/**
 * Find pricing gaps (missing combinations)
 */
const findPricingGaps = async (deviceId, expectedNetworks, expectedStorages) => {
  try {
    const existingPricing = await Pricing.find({ deviceId }).select('network storage');

    const existingCombinations = new Set(
      existingPricing.map((p) => `${p.network}-${p.storage}`)
    );

    const gaps = [];
    for (const network of expectedNetworks) {
      for (const storage of expectedStorages) {
        const combo = `${network}-${storage}`;
        if (!existingCombinations.has(combo)) {
          gaps.push({ network, storage });
        }
      }
    }

    return gaps;
  } catch (error) {
    logger.error(`Error finding pricing gaps: ${error.message}`);
    throw error;
  }
};

/**
 * Clone pricing from one device to another
 */
const clonePricing = async (sourceDeviceId, targetDeviceId, priceMultiplier = 1) => {
  try {
    const [sourceDevice, targetDevice, sourcePricing] = await Promise.all([
      Device.findById(sourceDeviceId),
      Device.findById(targetDeviceId),
      Pricing.find({ deviceId: sourceDeviceId }),
    ]);

    if (!sourceDevice || !targetDevice) {
      throw new Error('Source or target device not found');
    }

    // Delete existing pricing for target device
    await Pricing.deleteMany({ deviceId: targetDeviceId });

    // Create new pricing entries
    const newPricing = sourcePricing.map((p) => ({
      deviceId: targetDeviceId,
      deviceName: targetDevice.fullName,
      network: p.network,
      storage: p.storage,
      gradeNew: Math.round(p.gradeNew * priceMultiplier),
      gradeGood: Math.round(p.gradeGood * priceMultiplier),
      gradeBroken: Math.round(p.gradeBroken * priceMultiplier),
    }));

    const created = await Pricing.insertMany(newPricing);

    logger.info(`Cloned ${created.length} pricing entries from ${sourceDevice.name} to ${targetDevice.name}`);

    return {
      source: sourceDevice.fullName,
      target: targetDevice.fullName,
      entriesCloned: created.length,
      priceMultiplier,
    };
  } catch (error) {
    logger.error(`Error cloning pricing: ${error.message}`);
    throw error;
  }
};

/**
 * Get top paying devices
 */
const getTopPayingDevices = async (limit = 10, grade = 'NEW') => {
  try {
    const gradeField = `grade${grade.charAt(0).toUpperCase() + grade.slice(1).toLowerCase()}`;

    const topDevices = await Pricing.aggregate([
      {
        $group: {
          _id: '$deviceName',
          maxPrice: { $max: `$${gradeField}` },
          avgPrice: { $avg: `$${gradeField}` },
          count: { $sum: 1 },
        },
      },
      { $sort: { maxPrice: -1 } },
      { $limit: limit },
    ]);

    return topDevices;
  } catch (error) {
    logger.error(`Error getting top paying devices: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getQuote,
  getAllPricingForDevice,
  calculatePriceAdjustment,
  bulkAdjustPricing,
  getPricingStatistics,
  findPricingGaps,
  clonePricing,
  getTopPayingDevices,
};
