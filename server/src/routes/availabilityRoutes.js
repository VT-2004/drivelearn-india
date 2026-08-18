const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  addAvailability,
  generateAvailabilitySlots,
  getMyAvailability,
  deleteAvailability,
  getAvailableSlotsForInstructor,
  getSchoolSchedule,
} = require('../controllers/availabilityController');

router.post('/', authenticate, authorize('instructor'), addAvailability);
router.post('/generate', authenticate, authorize('instructor'), generateAvailabilitySlots);
router.get('/my', authenticate, authorize('instructor'), getMyAvailability);
router.delete('/:id', authenticate, authorize('instructor'), deleteAvailability);

router.get('/school', authenticate, authorize('school_owner'), getSchoolSchedule);
router.get('/instructor/:instructorId', authenticate, getAvailableSlotsForInstructor);

module.exports = router;