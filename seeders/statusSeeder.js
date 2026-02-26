require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const OrderStatus = require('../models/OrderStatus');
const PaymentStatus = require('../models/PaymentStatus');

async function seed() {
  const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  // Clear existing
  await OrderStatus.deleteMany({});
  await PaymentStatus.deleteMany({});

  const orderStatuses = [
    { name: 'Pending',      value: 'PENDING',      color: 'bg-gray-100 text-gray-700',     sortOrder: 1, isActive: true },
    { name: 'Confirmed',    value: 'CONFIRMED',    color: 'bg-blue-100 text-blue-700',     sortOrder: 2, isActive: true },
    { name: 'Collected',    value: 'COLLECTED',    color: 'bg-purple-100 text-purple-700', sortOrder: 3, isActive: true },
    { name: 'Under Review', value: 'UNDER_REVIEW', color: 'bg-yellow-100 text-yellow-700', sortOrder: 4, isActive: true },
    { name: 'Completed',    value: 'COMPLETED',    color: 'bg-emerald-100 text-emerald-700', sortOrder: 5, isActive: true },
    { name: 'Cancelled',    value: 'CANCELLED',    color: 'bg-red-100 text-red-700',       sortOrder: 6, isActive: true },
  ];

  const paymentStatuses = [
    { name: 'Pending', value: 'PENDING', color: 'bg-amber-100 text-amber-700',   sortOrder: 1, isActive: true },
    { name: 'Paid',    value: 'PAID',    color: 'bg-emerald-100 text-emerald-700', sortOrder: 2, isActive: true },
  ];

  await OrderStatus.insertMany(orderStatuses);
  console.log('Seeded', orderStatuses.length, 'order statuses.');

  await PaymentStatus.insertMany(paymentStatuses);
  console.log('Seeded', paymentStatuses.length, 'payment statuses.');

  await mongoose.disconnect();
  console.log('Done. Disconnected.');
}

seed().catch(err => {
  console.error('Seeder error:', err);
  process.exit(1);
});
