const Admin = require('../models/Admin');

const admins = [
  {
    email: 'admin@cashmymobile.com',
    username: 'Super Admin',
    role: 'super_admin',
    isActive: true,
  },
  {
    email: 'manager@cashmymobile.com',
    username: 'Manager',
    role: 'admin',
    isActive: true,
  },
  {
    email: 'viewer@cashmymobile.com',
    username: 'Viewer',
    role: 'viewer',
    isActive: true,
  },
];

const seedAdmins = async (clearFirst = false) => {
  try {
    if (clearFirst) {
      await Admin.deleteMany({});
      console.log('  - Cleared existing admins');
    }

    const createdAdmins = await Admin.insertMany(admins);
    console.log(`  - Created ${createdAdmins.length} admins`);

    return createdAdmins;
  } catch (error) {
    console.error('Error seeding admins:', error.message);
    throw error;
  }
};

module.exports = seedAdmins;
