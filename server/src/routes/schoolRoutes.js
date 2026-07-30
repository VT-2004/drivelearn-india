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
  updateSchool,
  getSchoolStats,
} = require('../controllers/schoolController');
const { addBranch, getMyBranches, deleteBranch } = require('../controllers/branchController');
const { addInstructor, getInstructors, deleteInstructor } = require('../controllers/instructorController');

// School Owner routes
router.post(
  '/register',
  authenticate,
  authorize('school_owner'),
  upload.single('document'),
  registerSchool
);
router.get('/my-school', authenticate, authorize('school_owner'), getMySchool);
router.put('/my-school', authenticate, authorize('school_owner'), updateSchool);
router.get('/stats', authenticate, authorize('school_owner'), getSchoolStats);

// Branch routes (School Owner)
router.post('/branches', authenticate, authorize('school_owner'), addBranch);
router.get('/branches', authenticate, authorize('school_owner'), getMyBranches);
router.delete('/branches/:id', authenticate, authorize('school_owner'), deleteBranch);

// Instructor routes (School Owner)
router.post('/instructors', authenticate, authorize('school_owner'), addInstructor);
router.get('/instructors', authenticate, authorize('school_owner'), getInstructors);
router.delete('/instructors/:id', authenticate, authorize('school_owner'), deleteInstructor);

// Admin routes
router.get('/', authenticate, authorize('admin'), getAllSchools);
router.patch('/:id/approve', authenticate, authorize('admin'), approveSchool);
router.patch('/:id/reject', authenticate, authorize('admin'), rejectSchool);

module.exports = router;