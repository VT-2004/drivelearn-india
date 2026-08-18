const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { addCourse, getMyCourses, updateCourse, deleteCourse } = require('../controllers/courseController');

router.post('/', authenticate, authorize('school_owner', 'instructor'), addCourse);
router.get('/', authenticate, authorize('school_owner', 'instructor'), getMyCourses);
router.put('/:id', authenticate, authorize('school_owner', 'instructor'), updateCourse);
router.delete('/:id', authenticate, authorize('school_owner', 'instructor'), deleteCourse);

module.exports = router;
