require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('../models/Admin');
const connectDB = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const createAdmin = async () => {
  try {
    console.log('🚀 Admin Creation Script');
    console.log('========================\n');

    // Connect to database
    await connectDB();

    // Get admin details
    const email = await question('Enter admin email: ');
    const username = await question('Enter admin username: ');
    const roleInput = await question('Enter admin role (super_admin/admin/viewer) [default: admin]: ');
    const role = roleInput.trim() || 'admin';

    // Validate role
    if (!['super_admin', 'admin', 'viewer'].includes(role)) {
      console.error('❌ Invalid role. Must be super_admin, admin, or viewer.');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.error(`❌ Admin with email ${email} already exists.`);
      process.exit(1);
    }

    // Create admin
    const admin = await Admin.create({
      email,
      username,
      role,
      isActive: true,
    });

    console.log('\n✅ Admin created successfully!');
    console.log('================================');
    console.log(`ID: ${admin._id}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Username: ${admin.username}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Active: ${admin.isActive}`);
    console.log('\n💡 Admin can now login using OTP sent to their email.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
};

// Run the script
createAdmin();
