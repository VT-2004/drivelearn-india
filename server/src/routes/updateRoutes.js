const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { postUpdate, getUpdates } = require('../controllers/updateController');

router.post('/', authenticate, authorize('instructor', 'learner'), postUpdate);
router.get('/:bookingId', authenticate, authorize('instructor', 'learner'), getUpdates);

module.exports = router;