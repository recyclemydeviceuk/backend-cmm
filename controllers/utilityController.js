const StorageOption = require('../models/StorageOption');
const DeviceCondition = require('../models/DeviceCondition');
const Network = require('../models/Network');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const OrderStatus = require('../models/OrderStatus');
const PaymentStatus = require('../models/PaymentStatus');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const logger = require('../utils/logger');

// Generic CRUD operations for utility models
const createUtilityController = (Model, modelName) => ({
  // Get all
  getAll: async (req, res) => {
    try {
      const items = await Model.find().sort({ sortOrder: 1, name: 1 });
      return successResponse(res, { [modelName]: items }, HTTP_STATUS.OK);
    } catch (error) {
      logger.error(`Get all ${modelName} error: ${error.message}`);
      return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // Get by ID
  getById: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return errorResponse(res, `${modelName} not found`, HTTP_STATUS.NOT_FOUND);
      }
      return successResponse(res, { [modelName.slice(0, -1)]: item }, HTTP_STATUS.OK);
    } catch (error) {
      logger.error(`Get ${modelName} by ID error: ${error.message}`);
      return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // Create
  create: async (req, res) => {
    try {
      const item = await Model.create(req.body);
      logger.info(`${modelName} created: ${item.name}`);
      return successResponse(res, { [modelName.slice(0, -1)]: item, message: `${modelName} created successfully` }, HTTP_STATUS.CREATED);
    } catch (error) {
      logger.error(`Create ${modelName} error: ${error.message}`);
      return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // Update
  update: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return errorResponse(res, `${modelName} not found`, HTTP_STATUS.NOT_FOUND);
      }
      Object.assign(item, req.body);
      await item.save();
      logger.info(`${modelName} updated: ${item.name}`);
      return successResponse(res, { [modelName.slice(0, -1)]: item, message: `${modelName} updated successfully` }, HTTP_STATUS.OK);
    } catch (error) {
      logger.error(`Update ${modelName} error: ${error.message}`);
      return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // Delete
  delete: async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return errorResponse(res, `${modelName} not found`, HTTP_STATUS.NOT_FOUND);
      }
      await item.deleteOne();
      logger.info(`${modelName} deleted: ${item.name}`);
      return successResponse(res, { message: `${modelName} deleted successfully` }, HTTP_STATUS.OK);
    } catch (error) {
      logger.error(`Delete ${modelName} error: ${error.message}`);
      return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },

  // Reorder
  reorder: async (req, res) => {
    try {
      const { items } = req.body; // Array of { id, sortOrder }
      
      const bulkOps = items.map((item, index) => ({
        updateOne: {
          filter: { _id: item.id },
          update: { $set: { sortOrder: index + 1 } },
        },
      }));

      await Model.bulkWrite(bulkOps);
      logger.info(`${modelName} reordered`);
      return successResponse(res, { message: `${modelName} reordered successfully` }, HTTP_STATUS.OK);
    } catch (error) {
      logger.error(`Reorder ${modelName} error: ${error.message}`);
      return errorResponse(res, error.message || ERROR_MESSAGES.INTERNAL_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  },
});

// Storage Options
const storageController = createUtilityController(StorageOption, 'storageOptions');
exports.getAllStorageOptions = storageController.getAll;
exports.getStorageOptionById = storageController.getById;
exports.createStorageOption = storageController.create;
exports.updateStorageOption = storageController.update;
exports.deleteStorageOption = storageController.delete;
exports.reorderStorageOptions = storageController.reorder;

// Device Conditions
const conditionController = createUtilityController(DeviceCondition, 'deviceConditions');
exports.getAllDeviceConditions = conditionController.getAll;
exports.getDeviceConditionById = conditionController.getById;
exports.createDeviceCondition = conditionController.create;
exports.updateDeviceCondition = conditionController.update;
exports.deleteDeviceCondition = conditionController.delete;
exports.reorderDeviceConditions = conditionController.reorder;

// Networks
const networkController = createUtilityController(Network, 'networks');
exports.getAllNetworks = networkController.getAll;
exports.getNetworkById = networkController.getById;
exports.createNetwork = networkController.create;
exports.updateNetwork = networkController.update;
exports.deleteNetwork = networkController.delete;
exports.reorderNetworks = networkController.reorder;

// Brands
const brandController = createUtilityController(Brand, 'brands');
exports.getAllBrands = brandController.getAll;
exports.getBrandById = brandController.getById;
exports.createBrand = brandController.create;
exports.updateBrand = brandController.update;
exports.deleteBrand = brandController.delete;
exports.reorderBrands = brandController.reorder;

// Categories
const categoryController = createUtilityController(Category, 'categories');
exports.getAllCategories = categoryController.getAll;
exports.getCategoryById = categoryController.getById;
exports.createCategory = categoryController.create;
exports.updateCategory = categoryController.update;
exports.deleteCategory = categoryController.delete;
exports.reorderCategories = categoryController.reorder;

// Order Statuses
const orderStatusController = createUtilityController(OrderStatus, 'orderStatuses');
exports.getAllOrderStatuses = orderStatusController.getAll;
exports.getOrderStatusById = orderStatusController.getById;
exports.createOrderStatus = orderStatusController.create;
exports.updateOrderStatus = orderStatusController.update;
exports.deleteOrderStatus = orderStatusController.delete;
exports.reorderOrderStatuses = orderStatusController.reorder;

// Payment Statuses
const paymentStatusController = createUtilityController(PaymentStatus, 'paymentStatuses');
exports.getAllPaymentStatuses = paymentStatusController.getAll;
exports.getPaymentStatusById = paymentStatusController.getById;
exports.createPaymentStatus = paymentStatusController.create;
exports.updatePaymentStatus = paymentStatusController.update;
exports.deletePaymentStatus = paymentStatusController.delete;
exports.reorderPaymentStatuses = paymentStatusController.reorder;

/**
 * @desc    Get all utilities in one request
 * @route   GET /api/utilities/all
 * @access  Public
 */
exports.getAllUtilities = async (req, res) => {
  try {
    const [storageOptions, deviceConditions, networks, brands, categories, orderStatuses, paymentStatuses] = await Promise.all([
      StorageOption.find().sort({ sortOrder: 1 }),
      DeviceCondition.find().sort({ sortOrder: 1 }),
      Network.find().sort({ sortOrder: 1 }),
      Brand.find().sort({ sortOrder: 1 }),
      Category.find().sort({ sortOrder: 1 }),
      OrderStatus.find().sort({ sortOrder: 1 }),
      PaymentStatus.find().sort({ sortOrder: 1 }),
    ]);

    return successResponse(
      res,
      {
        storageOptions,
        deviceConditions,
        networks,
        brands,
        categories,
        orderStatuses,
        paymentStatuses,
      },
      HTTP_STATUS.OK
    );
  } catch (error) {
    logger.error(`Get all utilities error: ${error.message}`);
    return errorResponse(
      res,
      error.message || ERROR_MESSAGES.INTERNAL_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
};
