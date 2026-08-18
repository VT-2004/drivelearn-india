const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const {
  getSchoolVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
} = require('../controllers/vehicleController');

router.get('/', authenticate, authorize('school_owner'), getSchoolVehicles);
router.post('/', authenticate, authorize('school_owner'), addVehicle);
router.put('/:id', authenticate, authorize('school_owner'), updateVehicle);
router.delete('/:id', authenticate, authorize('school_owner'), deleteVehicle);

module.exports = router;
