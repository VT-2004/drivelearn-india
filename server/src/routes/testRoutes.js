const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

// Anyone logged in can access this (any role)
router.get('/profile', authenticate, (req, res) => {
  res.json({
    message: 'This is your profile - accessible to any logged-in user',
    user: req.user,
  });
});

// ONLY admin can access this
router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.json({
    message: 'Welcome Admin! This route is restricted to admins only.',
  });
});

// ONLY school_owner can access this
router.get('/school-only', authenticate, authorize('school_owner'), (req, res) => {
  res.json({
    message: 'Welcome School Owner! This route is restricted to school owners only.',
  });
});

// admin OR school_owner can access this
router.get('/admin-or-school', authenticate, authorize('admin', 'school_owner'), (req, res) => {
  res.json({
    message: 'Welcome! You are either an Admin or a School Owner.',
  });
});

module.exports = router;
