const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { getAdminAnalytics, getSchoolAnalytics, getSchoolDetailForAdmin } = require('../controllers/analyticsController');

router.get('/admin', authenticate, authorize('admin'), getAdminAnalytics);
router.get('/admin/school/:id', authenticate, authorize('admin'), getSchoolDetailForAdmin);
router.get('/school', authenticate, authorize('school_owner'), getSchoolAnalytics);

module.exports = router;