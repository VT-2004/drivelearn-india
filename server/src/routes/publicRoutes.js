const express = require('express');
const router = express.Router();
const { searchSchools, getSchoolProfile } = require('../controllers/publicController');

// No authentication required - anyone can browse schools
router.get('/schools', searchSchools);
router.get('/schools/:id', getSchoolProfile);

module.exports = router;
