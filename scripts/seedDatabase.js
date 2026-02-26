require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/database');

// Import seeders
const adminSeeder = require('../seeders/adminSeeder');
const utilitySeeder = require('../seeders/utilitySeeder');
const deviceSeeder = require('../seeders/deviceSeeder');
const pricingSeeder = require('../seeders/pricingSeeder');

const seedDatabase = async () => {
  try {
    console.log('🌱 Database Seeding Script');
    console.log('===========================\n');

    // Connect to database
    await connectDB();

    // Get command line arguments
    const args = process.argv.slice(2);
    const seedAll = args.includes('--all') || args.length === 0;
    const seedAdmins = args.includes('--admins') || seedAll;
    const seedUtilities = args.includes('--utilities') || seedAll;
    const seedDevices = args.includes('--devices') || seedAll;
    const seedPricing = args.includes('--pricing') || seedAll;
    const clearFirst = args.includes('--clear');

    console.log('Seeding options:');
    console.log(`  Admins: ${seedAdmins}`);
    console.log(`  Utilities: ${seedUtilities}`);
    console.log(`  Devices: ${seedDevices}`);
    console.log(`  Pricing: ${seedPricing}`);
    console.log(`  Clear existing data: ${clearFirst}\n`);

    // Seed admins
    if (seedAdmins) {
      console.log('📝 Seeding admins...');
      await adminSeeder(clearFirst);
      console.log('✅ Admins seeded\n');
    }

    // Seed utilities
    if (seedUtilities) {
      console.log('🔧 Seeding utilities...');
      await utilitySeeder(clearFirst);
      console.log('✅ Utilities seeded\n');
    }

    // Seed devices
    if (seedDevices) {
      console.log('📱 Seeding devices...');
      const devices = await deviceSeeder(clearFirst);
      console.log('✅ Devices seeded\n');

      // Seed pricing (requires devices)
      if (seedPricing) {
        console.log('💰 Seeding pricing...');
        await pricingSeeder(clearFirst, devices);
        console.log('✅ Pricing seeded\n');
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('  - Run with --clear to remove existing data before seeding');
    console.log('  - Run with --admins, --utilities, --devices, --pricing to seed specific data');
    console.log('  - Run with --all or no arguments to seed everything');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    console.error(error);
    process.exit(1);
  }
};

// Run the script
seedDatabase();
