const Pricing = require('../models/Pricing');

// Storage options to create pricing for
const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];

// Networks to create pricing for
const networks = ['Unlocked', 'EE', 'Vodafone', 'O2', 'Three'];

// Generate pricing for a device
const generatePricingForDevice = (device, storage, network) => {
  // Base prices vary by device brand and model
  let basePrice = 0;

  if (device.brand === 'Apple') {
    if (device.name.includes('16 Pro Max')) basePrice = 980;
    else if (device.name.includes('16 Pro')) basePrice = 870;
    else if (device.name.includes('16 Plus')) basePrice = 720;
    else if (device.name.includes('16')) basePrice = 650;
    else if (device.name.includes('15 Pro Max')) basePrice = 850;
    else if (device.name.includes('15 Pro')) basePrice = 750;
    else if (device.name.includes('15 Plus')) basePrice = 580;
    else if (device.name.includes('15')) basePrice = 520;
    else if (device.name.includes('14 Pro Max')) basePrice = 680;
    else if (device.name.includes('14 Pro')) basePrice = 600;
    else if (device.name.includes('14 Plus')) basePrice = 460;
    else if (device.name.includes('14')) basePrice = 400;
    else if (device.name.includes('13 Pro Max')) basePrice = 420;
    else if (device.name.includes('13 Pro')) basePrice = 370;
    else if (device.name.includes('13 Mini')) basePrice = 260;
    else if (device.name.includes('13')) basePrice = 320;
    else if (device.name.includes('12 Pro Max')) basePrice = 280;
    else if (device.name.includes('12')) basePrice = 220;
    else if (device.name.includes('11 Pro Max')) basePrice = 180;
    else if (device.name.includes('11')) basePrice = 140;
  } else if (device.brand === 'Samsung') {
    if (device.name.includes('S25 Ultra')) basePrice = 950;
    else if (device.name.includes('S25+')) basePrice = 780;
    else if (device.name.includes('S25')) basePrice = 660;
    else if (device.name.includes('S24 Ultra')) basePrice = 820;
    else if (device.name.includes('S24+')) basePrice = 650;
    else if (device.name.includes('S24')) basePrice = 540;
    else if (device.name.includes('S23 Ultra')) basePrice = 620;
    else if (device.name.includes('S23+')) basePrice = 470;
    else if (device.name.includes('S23')) basePrice = 390;
    else if (device.name.includes('Z Fold 6')) basePrice = 1050;
    else if (device.name.includes('Z Fold 5')) basePrice = 880;
    else if (device.name.includes('Z Flip 6')) basePrice = 580;
    else if (device.name.includes('Z Flip 5')) basePrice = 460;
    else if (device.name.includes('A55')) basePrice = 220;
    else if (device.name.includes('A54')) basePrice = 170;
  }

  // Adjust price based on storage
  let storageMultiplier = 1;
  if (storage === '128GB') storageMultiplier = 1.15;
  else if (storage === '256GB') storageMultiplier = 1.3;
  else if (storage === '512GB') storageMultiplier = 1.5;
  else if (storage === '1TB') storageMultiplier = 1.8;

  // Adjust price based on network (unlocked is worth more)
  let networkMultiplier = network === 'Unlocked' ? 1.1 : 1;

  // Calculate final prices for each grade
  const adjustedBase = basePrice * storageMultiplier * networkMultiplier;

  return {
    deviceId: device._id,
    deviceName: device.fullName,
    network,
    storage,
    gradeNew: Math.round(adjustedBase),
    gradeGood: Math.round(adjustedBase * 0.75),
    gradeBroken: Math.round(adjustedBase * 0.3),
  };
};

const seedPricing = async (clearFirst = false, devices = null) => {
  try {
    if (clearFirst) {
      await Pricing.deleteMany({});
      console.log('  - Cleared existing pricing');
    }

    // If no devices provided, fetch them
    if (!devices) {
      const Device = require('../models/Device');
      devices = await Device.find({ isActive: true });
    }

    const pricingData = [];

    // Generate pricing for each device, storage, and network combination
    for (const device of devices) {
      for (const storage of storageOptions) {
        for (const network of networks) {
          pricingData.push(generatePricingForDevice(device, storage, network));
        }
      }
    }

    const createdPricing = await Pricing.insertMany(pricingData);
    console.log(`  - Created ${createdPricing.length} pricing entries`);
    console.log(`  - ${devices.length} devices × ${storageOptions.length} storage × ${networks.length} networks`);

    return createdPricing;
  } catch (error) {
    console.error('Error seeding pricing:', error.message);
    throw error;
  }
};

module.exports = seedPricing;
