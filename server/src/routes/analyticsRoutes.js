const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getAdminAnalytics, getSchoolAnalytics } = require('../controllers/analyticsController');

router.get('/admin', authenticate, authorize('admin'), getAdminAnalytics);
router.get('/school', authenticate, authorize('school_owner'), getSchoolAnalytics);

module.exports = router;
