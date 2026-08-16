const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getMyAssignedBookings,
  markAttendance,
  getBookingAttendance,
  markBookingComplete,
  clockIn,
  clockOut,
  getMyCalendar,
  getMyCourses,
  getCourseStudents,
  getMyWorkplace,
} = require('../controllers/instructorPortalController');

router.get('/bookings', authenticate, authorize('instructor'), getMyAssignedBookings);
router.get('/workplace', authenticate, authorize('instructor'), getMyWorkplace);
router.get('/courses', authenticate, authorize('instructor'), getMyCourses);
router.get('/courses/:courseId/students', authenticate, authorize('instructor'), getCourseStudents);
router.post('/attendance', authenticate, authorize('instructor'), markAttendance);
router.get('/attendance/:bookingId', authenticate, authorize('instructor', 'learner'), getBookingAttendance);
router.patch('/bookings/:id/complete', authenticate, authorize('instructor'), markBookingComplete);
router.post('/clock-in', authenticate, authorize('instructor'), clockIn);
router.post('/clock-out', authenticate, authorize('instructor'), clockOut);
router.get('/calendar', authenticate, authorize('instructor'), getMyCalendar);

module.exports = router;