const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getBookingMilestones,
  updateMilestone,
} = require('../controllers/milestoneController');

// GET: Learner or Instructor gets all 14 milestones for a booking
router.get('/:bookingId', authenticate, getBookingMilestones);

// PATCH: Instructor or Admin marks milestone status/notes
router.patch('/:bookingId/:milestoneIndex', authenticate, authorize('instructor', 'admin'), updateMilestone);

module.exports = router;
