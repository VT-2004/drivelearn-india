const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  addAvailability,
  getMyAvailability,
  deleteAvailability,
  getAvailableSlotsForInstructor,
} = require('../controllers/availabilityController');

router.post('/', authenticate, authorize('instructor'), addAvailability);
router.get('/my', authenticate, authorize('instructor'), getMyAvailability);
router.delete('/:id', authenticate, authorize('instructor'), deleteAvailability);

router.get('/instructor/:instructorId', authenticate, getAvailableSlotsForInstructor);

module.exports = router;