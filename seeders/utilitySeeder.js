const StorageOption = require('../models/StorageOption');
const DeviceCondition = require('../models/DeviceCondition');
const Network = require('../models/Network');
const Brand = require('../models/Brand');
const Category = require('../models/Category');

// Storage options
const storageOptions = [
  { name: '16GB', value: '16GB', sortOrder: 1, isActive: true },
  { name: '32GB', value: '32GB', sortOrder: 2, isActive: true },
  { name: '64GB', value: '64GB', sortOrder: 3, isActive: true },
  { name: '128GB', value: '128GB', sortOrder: 4, isActive: true },
  { name: '256GB', value: '256GB', sortOrder: 5, isActive: true },
  { name: '512GB', value: '512GB', sortOrder: 6, isActive: true },
  { name: '1TB', value: '1TB', sortOrder: 7, isActive: true },
];

// Device conditions
const deviceConditions = [
  {
    name: 'New',
    value: 'NEW',
    description: 'Brand new, unopened device',
    sortOrder: 1,
    isActive: true,
  },
  {
    name: 'Good',
    value: 'GOOD',
    description: 'Used device in good working condition',
    sortOrder: 2,
    isActive: true,
  },
  {
    name: 'Broken',
    value: 'BROKEN',
    description: 'Device with defects or not working',
    sortOrder: 3,
    isActive: true,
  },
];

// Networks
const networks = [
  { name: 'Unlocked', value: 'Unlocked', sortOrder: 1, isActive: true },
  { name: 'EE', value: 'EE', sortOrder: 2, isActive: true },
  { name: 'Vodafone', value: 'Vodafone', sortOrder: 3, isActive: true },
  { name: 'O2', value: 'O2', sortOrder: 4, isActive: true },
  { name: 'Three', value: 'Three', sortOrder: 5, isActive: true },
  { name: 'Virgin Mobile', value: 'Virgin Mobile', sortOrder: 6, isActive: true },
  { name: 'Tesco Mobile', value: 'Tesco Mobile', sortOrder: 7, isActive: true },
  { name: 'Giffgaff', value: 'Giffgaff', sortOrder: 8, isActive: true },
];

// Brands
const brands = [
  { name: 'Apple', sortOrder: 1, isActive: true },
  { name: 'Samsung', sortOrder: 2, isActive: true },
  { name: 'Google', sortOrder: 3, isActive: true },
  { name: 'OnePlus', sortOrder: 4, isActive: true },
  { name: 'Xiaomi', sortOrder: 5, isActive: true },
  { name: 'Huawei', sortOrder: 6, isActive: true },
  { name: 'Sony', sortOrder: 7, isActive: true },
  { name: 'Nokia', sortOrder: 8, isActive: true },
  { name: 'Motorola', sortOrder: 9, isActive: true },
  { name: 'Oppo', sortOrder: 10, isActive: true },
];

// Categories
const categories = [
  { name: 'Smartphone', description: 'Mobile phones', sortOrder: 1, isActive: true },
  { name: 'Tablet', description: 'Tablet devices', sortOrder: 2, isActive: true },
  { name: 'Smartwatch', description: 'Wearable devices', sortOrder: 3, isActive: true },
  { name: 'Laptop', description: 'Laptop computers', sortOrder: 4, isActive: true },
];

const seedUtilities = async (clearFirst = false) => {
  try {
    if (clearFirst) {
      await Promise.all([
        StorageOption.deleteMany({}),
        DeviceCondition.deleteMany({}),
        Network.deleteMany({}),
        Brand.deleteMany({}),
        Category.deleteMany({}),
      ]);
      console.log('  - Cleared existing utilities');
    }

    const [storage, conditions, networksList, brandsList, categoriesList] = await Promise.all([
      StorageOption.insertMany(storageOptions),
      DeviceCondition.insertMany(deviceConditions),
      Network.insertMany(networks),
      Brand.insertMany(brands),
      Category.insertMany(categories),
    ]);

    console.log(`  - Created ${storage.length} storage options`);
    console.log(`  - Created ${conditions.length} device conditions`);
    console.log(`  - Created ${networksList.length} networks`);
    console.log(`  - Created ${brandsList.length} brands`);
    console.log(`  - Created ${categoriesList.length} categories`);

    return { storage, conditions, networks: networksList, brands: brandsList, categories: categoriesList };
  } catch (error) {
    console.error('Error seeding utilities:', error.message);
    throw error;
  }
};

module.exports = seedUtilities;
