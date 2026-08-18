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
  warnSchool,
  suspendSchool,
  unsuspendSchool,
  updateSchool,
  getSchoolStats,
  cancelSchoolRegistration,
  getSchoolNotifications,
  markNotificationRead,
  getMySchoolReviews,
} = require('../controllers/schoolController');
const { getMyStudents } = require('../controllers/studentController');
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
router.delete('/my-school', authenticate, authorize('school_owner'), cancelSchoolRegistration);
router.get('/stats', authenticate, authorize('school_owner'), getSchoolStats);
router.get('/students', authenticate, authorize('school_owner'), getMyStudents);
router.get('/notifications', authenticate, authorize('school_owner'), getSchoolNotifications);
router.patch('/notifications/:id/read', authenticate, authorize('school_owner'), markNotificationRead);
router.get('/my-reviews', authenticate, authorize('school_owner'), getMySchoolReviews);

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
router.post('/:id/warn', authenticate, authorize('admin'), warnSchool);
router.post('/:id/suspend', authenticate, authorize('admin'), suspendSchool);
router.post('/:id/unsuspend', authenticate, authorize('admin'), unsuspendSchool);

module.exports = router;