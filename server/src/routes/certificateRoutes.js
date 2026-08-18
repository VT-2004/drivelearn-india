const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { downloadCertificate } = require('../controllers/certificateController');

router.get('/:bookingId', authenticate, authorize('learner'), downloadCertificate);

module.exports = router;