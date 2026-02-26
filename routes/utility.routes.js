const express = require('express');
const router = express.Router();
const {
  getAllStorageOptions,
  getStorageOptionById,
  createStorageOption,
  updateStorageOption,
  deleteStorageOption,
  reorderStorageOptions,
  getAllDeviceConditions,
  getDeviceConditionById,
  createDeviceCondition,
  updateDeviceCondition,
  deleteDeviceCondition,
  reorderDeviceConditions,
  getAllNetworks,
  getNetworkById,
  createNetwork,
  updateNetwork,
  deleteNetwork,
  reorderNetworks,
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
  reorderBrands,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  getAllOrderStatuses,
  getOrderStatusById,
  createOrderStatus,
  updateOrderStatus,
  deleteOrderStatus,
  reorderOrderStatuses,
  getAllPaymentStatuses,
  getPaymentStatusById,
  createPaymentStatus,
  updatePaymentStatus,
  deletePaymentStatus,
  reorderPaymentStatuses,
  getAllUtilities,
} = require('../controllers/utilityController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { body, param } = require('express-validator');

/**
 * @route   GET /api/utilities/all
 * @desc    Get all utilities in one request
 * @access  Public
 */
router.get('/all', getAllUtilities);

// Storage Options Routes
router.get('/storage', getAllStorageOptions);
router.get('/storage/:id', getStorageOptionById);
router.post(
  '/storage',
  auth,
  [
    body('name').notEmpty().trim().withMessage('Storage name is required'),
    body('value').notEmpty().trim().withMessage('Storage value is required'),
  ],
  validate,
  createStorageOption
);
router.put('/storage/:id', auth, updateStorageOption);
router.delete('/storage/:id', auth, deleteStorageOption);
router.post('/storage/reorder', auth, reorderStorageOptions);

// Device Conditions Routes
router.get('/conditions', getAllDeviceConditions);
router.get('/conditions/:id', getDeviceConditionById);
router.post(
  '/conditions',
  auth,
  [
    body('name').notEmpty().trim().withMessage('Condition name is required'),
    body('value').notEmpty().trim().withMessage('Condition value is required'),
  ],
  validate,
  createDeviceCondition
);
router.put('/conditions/:id', auth, updateDeviceCondition);
router.delete('/conditions/:id', auth, deleteDeviceCondition);
router.post('/conditions/reorder', auth, reorderDeviceConditions);

// Networks Routes
router.get('/networks', getAllNetworks);
router.get('/networks/:id', getNetworkById);
router.post(
  '/networks',
  auth,
  [
    body('name').notEmpty().trim().withMessage('Network name is required'),
    body('value').notEmpty().trim().withMessage('Network value is required'),
  ],
  validate,
  createNetwork
);
router.put('/networks/:id', auth, updateNetwork);
router.delete('/networks/:id', auth, deleteNetwork);
router.post('/networks/reorder', auth, reorderNetworks);

// Brands Routes
router.get('/brands', getAllBrands);
router.get('/brands/:id', getBrandById);
router.post(
  '/brands',
  auth,
  [body('name').notEmpty().trim().withMessage('Brand name is required')],
  validate,
  createBrand
);
router.put('/brands/:id', auth, updateBrand);
router.delete('/brands/:id', auth, deleteBrand);
router.post('/brands/reorder', auth, reorderBrands);

// Categories Routes
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.post(
  '/categories',
  auth,
  [body('name').notEmpty().trim().withMessage('Category name is required')],
  validate,
  createCategory
);
router.put('/categories/:id', auth, updateCategory);
router.delete('/categories/:id', auth, deleteCategory);
router.post('/categories/reorder', auth, reorderCategories);

// Order Statuses Routes
router.get('/order-statuses', getAllOrderStatuses);
router.get('/order-statuses/:id', getOrderStatusById);
router.post(
  '/order-statuses',
  auth,
  [body('name').notEmpty().trim().withMessage('Status name is required'),
   body('value').notEmpty().trim().withMessage('Status value is required')],
  validate,
  createOrderStatus
);
router.put('/order-statuses/:id', auth, updateOrderStatus);
router.delete('/order-statuses/:id', auth, deleteOrderStatus);
router.post('/order-statuses/reorder', auth, reorderOrderStatuses);

// Payment Statuses Routes
router.get('/payment-statuses', getAllPaymentStatuses);
router.get('/payment-statuses/:id', getPaymentStatusById);
router.post(
  '/payment-statuses',
  auth,
  [body('name').notEmpty().trim().withMessage('Status name is required'),
   body('value').notEmpty().trim().withMessage('Status value is required')],
  validate,
  createPaymentStatus
);
router.put('/payment-statuses/:id', auth, updatePaymentStatus);
router.delete('/payment-statuses/:id', auth, deletePaymentStatus);
router.post('/payment-statuses/reorder', auth, reorderPaymentStatuses);

module.exports = router;
