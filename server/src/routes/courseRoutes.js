const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const { addCourse, getMyCourses, updateCourse, deleteCourse } = require('../controllers/courseController');

router.post('/', authenticate, authorize('school_owner'), addCourse);
router.get('/', authenticate, authorize('school_owner'), getMyCourses);
router.put('/:id', authenticate, authorize('school_owner'), updateCourse);
router.delete('/:id', authenticate, authorize('school_owner'), deleteCourse);

module.exports = router;
