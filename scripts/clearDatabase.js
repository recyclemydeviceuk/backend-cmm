require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const connectDB = require('../config/database');

// Import models
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Device = require('../models/Device');
const Pricing = require('../models/Pricing');
const OTP = require('../models/OTP');
const ApiLog = require('../models/ApiLog');
const IpWhitelist = require('../models/IpWhitelist');
const ContactSubmission = require('../models/ContactSubmission');
const StorageOption = require('../models/StorageOption');
const DeviceCondition = require('../models/DeviceCondition');
const Network = require('../models/Network');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const clearDatabase = async () => {
  try {
    console.log('🗑️  Database Cleanup Script');
    console.log('===========================\n');

    // Connect to database
    await connectDB();

    const args = process.argv.slice(2);
    const force = args.includes('--force');
    const clearAll = args.includes('--all') || args.length === 0;

    if (!force) {
      console.log('⚠️  WARNING: This will delete data from your database!');
      console.log('Collections to be cleared:');
      if (clearAll || args.includes('--orders')) console.log('  - Orders');
      if (clearAll || args.includes('--devices')) console.log('  - Devices');
      if (clearAll || args.includes('--pricing')) console.log('  - Pricing');
      if (clearAll || args.includes('--admins')) console.log('  - Admins');
      if (clearAll || args.includes('--utilities')) console.log('  - Utilities (Storage, Conditions, Networks, Brands, Categories)');
      if (clearAll || args.includes('--logs')) console.log('  - API Logs');
      if (clearAll || args.includes('--contact')) console.log('  - Contact Submissions');
      if (clearAll || args.includes('--otps')) console.log('  - OTPs');
      if (clearAll || args.includes('--ips')) console.log('  - IP Whitelist');
      console.log('');

      const confirm = await question('Are you sure you want to continue? (yes/no): ');
      if (confirm.toLowerCase() !== 'yes') {
        console.log('❌ Cleanup cancelled.');
        process.exit(0);
      }
    }

    console.log('\n🧹 Clearing database...\n');

    let deletedCount = 0;

    // Clear orders
    if (clearAll || args.includes('--orders')) {
      const result = await Order.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} orders`);
      deletedCount += result.deletedCount;
    }

    // Clear devices
    if (clearAll || args.includes('--devices')) {
      const result = await Device.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} devices`);
      deletedCount += result.deletedCount;
    }

    // Clear pricing
    if (clearAll || args.includes('--pricing')) {
      const result = await Pricing.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} pricing entries`);
      deletedCount += result.deletedCount;
    }

    // Clear admins
    if (clearAll || args.includes('--admins')) {
      const result = await Admin.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} admins`);
      deletedCount += result.deletedCount;
    }

    // Clear utilities
    if (clearAll || args.includes('--utilities')) {
      const [storage, conditions, networks, brands, categories] = await Promise.all([
        StorageOption.deleteMany({}),
        DeviceCondition.deleteMany({}),
        Network.deleteMany({}),
        Brand.deleteMany({}),
        Category.deleteMany({}),
      ]);
      const utilCount = storage.deletedCount + conditions.deletedCount + networks.deletedCount + brands.deletedCount + categories.deletedCount;
      console.log(`✓ Deleted ${utilCount} utility items`);
      deletedCount += utilCount;
    }

    // Clear API logs
    if (clearAll || args.includes('--logs')) {
      const result = await ApiLog.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} API logs`);
      deletedCount += result.deletedCount;
    }

    // Clear contact submissions
    if (clearAll || args.includes('--contact')) {
      const result = await ContactSubmission.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} contact submissions`);
      deletedCount += result.deletedCount;
    }

    // Clear OTPs
    if (clearAll || args.includes('--otps')) {
      const result = await OTP.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} OTPs`);
      deletedCount += result.deletedCount;
    }

    // Clear IP whitelist
    if (clearAll || args.includes('--ips')) {
      const result = await IpWhitelist.deleteMany({});
      console.log(`✓ Deleted ${result.deletedCount} whitelisted IPs`);
      deletedCount += result.deletedCount;
    }

    console.log(`\n✅ Database cleanup completed! Deleted ${deletedCount} total documents.`);
    console.log('\n📝 Usage:');
    console.log('  --all       : Clear all collections (default)');
    console.log('  --orders    : Clear only orders');
    console.log('  --devices   : Clear only devices');
    console.log('  --pricing   : Clear only pricing');
    console.log('  --admins    : Clear only admins');
    console.log('  --utilities : Clear only utilities');
    console.log('  --logs      : Clear only API logs');
    console.log('  --contact   : Clear only contact submissions');
    console.log('  --otps      : Clear only OTPs');
    console.log('  --ips       : Clear only IP whitelist');
    console.log('  --force     : Skip confirmation prompt');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run the script
clearDatabase();
