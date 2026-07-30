const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  registerSchool,
  getMySchool,
  getAllSchools,
  approveSchool,
  rejectSchool,
} = require('../controllers/schoolController');
const { addBranch, getMyBranches, deleteBranch } = require('../controllers/branchController');

// School Owner routes
router.post(
  '/register',
  authenticate,
  authorize('school_owner'),
  upload.single('document'),
  registerSchool
);
router.get('/my-school', authenticate, authorize('school_owner'), getMySchool);

// Branch routes (School Owner)
router.post('/branches', authenticate, authorize('school_owner'), addBranch);
router.get('/branches', authenticate, authorize('school_owner'), getMyBranches);
router.delete('/branches/:id', authenticate, authorize('school_owner'), deleteBranch);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllSchools);
router.patch('/:id/approve', authenticate, authorize('admin'), approveSchool);
router.patch('/:id/reject', authenticate, authorize('admin'), rejectSchool);

module.exports = router;
