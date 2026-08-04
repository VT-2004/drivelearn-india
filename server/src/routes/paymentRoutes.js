const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  createBookingOrder,
  verifyBookingPayment,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getMySubscription,
} = require('../controllers/paymentController');

// Course payment (learner)
router.post('/booking/create-order', authenticate, authorize('learner'), createBookingOrder);
router.post('/booking/verify', authenticate, authorize('learner'), verifyBookingPayment);

// School subscription (school owner)
router.post('/subscription/create-order', authenticate, authorize('school_owner'), createSubscriptionOrder);
router.post('/subscription/verify', authenticate, authorize('school_owner'), verifySubscriptionPayment);
router.get('/subscription/my', authenticate, authorize('school_owner'), getMySubscription);

module.exports = router;
