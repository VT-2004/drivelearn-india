const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  createBooking,
  getMyBookings,
  getSchoolBookings,
  cancelBooking,
  getMyCalendar,
} = require('../controllers/bookingController');

router.post('/', authenticate, authorize('learner'), createBooking);
router.get('/my', authenticate, authorize('learner'), getMyBookings);
router.get('/my/calendar', authenticate, authorize('learner'), getMyCalendar);
router.get('/school', authenticate, authorize('school_owner'), getSchoolBookings);
router.patch('/:id/cancel', authenticate, authorize('learner', 'school_owner'), cancelBooking);

module.exports = router;