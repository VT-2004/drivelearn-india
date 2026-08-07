const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { createReview, getReviewableSchools } = require('../controllers/reviewController');

router.post('/', authenticate, authorize('learner'), createReview);
router.get('/reviewable', authenticate, authorize('learner'), getReviewableSchools);

module.exports = router;
