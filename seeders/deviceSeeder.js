const Device = require('../models/Device');

const devices = [
  // ─── Apple iPhones ───────────────────────────────────────────
  {
    brand: 'Apple',
    name: 'iPhone 16 Pro Max',
    fullName: 'Apple iPhone 16 Pro Max',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.9 inch', processor: 'A18 Pro', camera: '48MP + 48MP + 12MP', battery: '4685 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 16 Pro',
    fullName: 'Apple iPhone 16 Pro',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.3 inch', processor: 'A18 Pro', camera: '48MP + 48MP + 12MP', battery: '3582 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 16 Plus',
    fullName: 'Apple iPhone 16 Plus',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A18', camera: '48MP + 12MP', battery: '4674 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 16',
    fullName: 'Apple iPhone 16',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A18', camera: '48MP + 12MP', battery: '3561 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 15 Pro Max',
    fullName: 'Apple iPhone 15 Pro Max',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A17 Pro', camera: '48MP + 12MP + 12MP', battery: '4422 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    fullName: 'Apple iPhone 15 Pro',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A17 Pro', camera: '48MP + 12MP + 12MP', battery: '3274 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 15 Plus',
    fullName: 'Apple iPhone 15 Plus',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A16 Bionic', camera: '48MP + 12MP', battery: '4383 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 15',
    fullName: 'Apple iPhone 15',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A16 Bionic', camera: '48MP + 12MP', battery: '3349 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 14 Pro Max',
    fullName: 'Apple iPhone 14 Pro Max',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A16 Bionic', camera: '48MP + 12MP + 12MP', battery: '4323 mAh', releaseYear: 2022 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 14 Pro',
    fullName: 'Apple iPhone 14 Pro',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A16 Bionic', camera: '48MP + 12MP + 12MP', battery: '3200 mAh', releaseYear: 2022 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 14 Plus',
    fullName: 'Apple iPhone 14 Plus',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A15 Bionic', camera: '12MP + 12MP', battery: '4325 mAh', releaseYear: 2022 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 14',
    fullName: 'Apple iPhone 14',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A15 Bionic', camera: '12MP + 12MP', battery: '3279 mAh', releaseYear: 2022 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 13 Pro Max',
    fullName: 'Apple iPhone 13 Pro Max',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A15 Bionic', camera: '12MP + 12MP + 12MP', battery: '4352 mAh', releaseYear: 2021 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 13 Pro',
    fullName: 'Apple iPhone 13 Pro',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A15 Bionic', camera: '12MP + 12MP + 12MP', battery: '3095 mAh', releaseYear: 2021 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 13',
    fullName: 'Apple iPhone 13',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A15 Bionic', camera: '12MP + 12MP', battery: '3240 mAh', releaseYear: 2021 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 13 Mini',
    fullName: 'Apple iPhone 13 Mini',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '5.4 inch', processor: 'A15 Bionic', camera: '12MP + 12MP', battery: '2438 mAh', releaseYear: 2021 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 12 Pro Max',
    fullName: 'Apple iPhone 12 Pro Max',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'A14 Bionic', camera: '12MP + 12MP + 12MP', battery: '3687 mAh', releaseYear: 2020 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 12',
    fullName: 'Apple iPhone 12',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A14 Bionic', camera: '12MP + 12MP', battery: '2815 mAh', releaseYear: 2020 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 11 Pro Max',
    fullName: 'Apple iPhone 11 Pro Max',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.5 inch', processor: 'A13 Bionic', camera: '12MP + 12MP + 12MP', battery: '3969 mAh', releaseYear: 2019 },
  },
  {
    brand: 'Apple',
    name: 'iPhone 11',
    fullName: 'Apple iPhone 11',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'A13 Bionic', camera: '12MP + 12MP', battery: '3110 mAh', releaseYear: 2019 },
  },

  // ─── Samsung Galaxy ───────────────────────────────────────────
  {
    brand: 'Samsung',
    name: 'Galaxy S25 Ultra',
    fullName: 'Samsung Galaxy S25 Ultra',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.9 inch', processor: 'Snapdragon 8 Elite', camera: '200MP + 50MP + 10MP + 50MP', battery: '5000 mAh', releaseYear: 2025 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S25+',
    fullName: 'Samsung Galaxy S25+',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'Snapdragon 8 Elite', camera: '50MP + 12MP + 10MP', battery: '4900 mAh', releaseYear: 2025 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S25',
    fullName: 'Samsung Galaxy S25',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.2 inch', processor: 'Snapdragon 8 Elite', camera: '50MP + 12MP + 10MP', battery: '4000 mAh', releaseYear: 2025 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra',
    fullName: 'Samsung Galaxy S24 Ultra',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.8 inch', processor: 'Snapdragon 8 Gen 3', camera: '200MP + 50MP + 12MP + 10MP', battery: '5000 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S24+',
    fullName: 'Samsung Galaxy S24+',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'Snapdragon 8 Gen 3', camera: '50MP + 12MP + 10MP', battery: '4900 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S24',
    fullName: 'Samsung Galaxy S24',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.2 inch', processor: 'Snapdragon 8 Gen 3', camera: '50MP + 12MP + 10MP', battery: '4000 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S23 Ultra',
    fullName: 'Samsung Galaxy S23 Ultra',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.8 inch', processor: 'Snapdragon 8 Gen 2', camera: '200MP + 12MP + 10MP + 10MP', battery: '5000 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S23+',
    fullName: 'Samsung Galaxy S23+',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.6 inch', processor: 'Snapdragon 8 Gen 2', camera: '50MP + 12MP + 10MP', battery: '4700 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy S23',
    fullName: 'Samsung Galaxy S23',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.1 inch', processor: 'Snapdragon 8 Gen 2', camera: '50MP + 12MP + 10MP', battery: '3900 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy Z Fold 6',
    fullName: 'Samsung Galaxy Z Fold 6',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '7.6 inch', processor: 'Snapdragon 8 Gen 3', camera: '50MP + 12MP + 10MP', battery: '4400 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy Z Fold 5',
    fullName: 'Samsung Galaxy Z Fold 5',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '7.6 inch', processor: 'Snapdragon 8 Gen 2', camera: '50MP + 12MP + 10MP', battery: '4400 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy Z Flip 6',
    fullName: 'Samsung Galaxy Z Flip 6',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'Snapdragon 8 Gen 3', camera: '50MP + 12MP', battery: '4000 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy Z Flip 5',
    fullName: 'Samsung Galaxy Z Flip 5',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.7 inch', processor: 'Snapdragon 8 Gen 2', camera: '12MP + 12MP', battery: '3700 mAh', releaseYear: 2023 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy A55',
    fullName: 'Samsung Galaxy A55',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.6 inch', processor: 'Exynos 1480', camera: '50MP + 12MP + 5MP', battery: '5000 mAh', releaseYear: 2024 },
  },
  {
    brand: 'Samsung',
    name: 'Galaxy A54',
    fullName: 'Samsung Galaxy A54',
    category: 'Smartphone',
    isActive: true,
    specifications: { screenSize: '6.4 inch', processor: 'Exynos 1380', camera: '50MP + 12MP + 5MP', battery: '5000 mAh', releaseYear: 2023 },
  },
];

const seedDevices = async (clearFirst = false) => {
  try {
    if (clearFirst) {
      await Device.deleteMany({});
      console.log('  - Cleared existing devices');
    }

    const createdDevices = await Device.insertMany(devices);
    console.log(`  - Created ${createdDevices.length} devices`);

    return createdDevices;
  } catch (error) {
    console.error('Error seeding devices:', error.message);
    throw error;
  }
};

module.exports = seedDevices;
