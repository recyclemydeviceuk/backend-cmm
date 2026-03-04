require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../config/database');
const Device = require('../models/Device');

const exportDeviceImages = async () => {
  try {
    console.log('📤 Exporting Device Names and Images...\n');

    // Connect to database
    await connectDB();

    // Fetch only name and imageUrl fields from all devices
    const devices = await Device.find({}, { name: 1, imageUrl: 1, _id: 0 }).lean();

    console.log(`✅ Found ${devices.length} devices`);

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `device_images_${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(devices, null, 2));

    console.log(`\n💾 Exported to: ${filepath}`);
    console.log(`\n📊 Total devices exported: ${devices.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error exporting device images:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
exportDeviceImages();
