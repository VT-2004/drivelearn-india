const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getMyAssignedBookings,
  markAttendance,
  getBookingAttendance,
  markBookingComplete,
} = require('../controllers/instructorPortalController');

router.get('/bookings', authenticate, authorize('instructor'), getMyAssignedBookings);
router.post('/attendance', authenticate, authorize('instructor'), markAttendance);
router.get('/attendance/:bookingId', authenticate, authorize('instructor', 'learner'), getBookingAttendance);
router.patch('/bookings/:id/complete', authenticate, authorize('instructor'), markBookingComplete);

module.exports = router;
