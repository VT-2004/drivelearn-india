const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { signup, login, getMe } = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', authenticate, getMe);

module.exports = router;