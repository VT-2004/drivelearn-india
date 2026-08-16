const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { signup, login, getMe, googleAuth, updateProfile, changePassword } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

module.exports = router;