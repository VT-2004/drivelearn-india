const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getBookingMilestones,
  updateMilestone,
  createCustomMilestone,
  deleteCustomMilestone,
} = require('../controllers/milestoneController');

// GET: Learner or Instructor gets all 14 milestones for a booking
router.get('/:bookingId', authenticate, getBookingMilestones);

// POST: Instructor adds a custom task/milestone to student's curriculum
router.post('/:bookingId', authenticate, authorize('instructor', 'admin'), createCustomMilestone);

// PATCH: Instructor or Admin marks milestone status/notes/edits
router.patch('/:bookingId/:milestoneIndex', authenticate, authorize('instructor', 'admin'), updateMilestone);

// DELETE: Instructor deletes a custom milestone
router.delete('/:bookingId/:milestoneIndex', authenticate, authorize('instructor', 'admin'), deleteCustomMilestone);

module.exports = router;
