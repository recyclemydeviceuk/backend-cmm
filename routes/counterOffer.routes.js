const express = require('express');
const router = express.Router();
const counterOfferController = require('../controllers/counterOfferController');
const { adminAuth } = require('../middleware/adminAuth');
const auth = require('../middleware/auth');

/**
 * @route   POST /api/counter-offers/order/:orderId
 * @desc    Create counter offer for an order (admin only)
 * @access  Private (Admin)
 */
router.post('/order/:orderId', auth, adminAuth(), counterOfferController.createCounterOffer);

/**
 * @route   GET /api/counter-offers/review/:token
 * @desc    Get counter offer by review token (public for customer)
 * @access  Public
 */
router.get('/review/:token', counterOfferController.getCounterOfferByToken);

/**
 * @route   POST /api/counter-offers/accept/:token
 * @desc    Accept counter offer (customer)
 * @access  Public
 */
router.post('/accept/:token', counterOfferController.acceptCounterOffer);

/**
 * @route   POST /api/counter-offers/decline/:token
 * @desc    Decline counter offer (customer)
 * @access  Public
 */
router.post('/decline/:token', counterOfferController.declineCounterOffer);

/**
 * @route   GET /api/counter-offers/order/:orderId/all
 * @desc    Get all counter offers for an order (admin)
 * @access  Private (Admin)
 */
router.get('/order/:orderId/all', auth, adminAuth(), counterOfferController.getOrderCounterOffers);

module.exports = router;
