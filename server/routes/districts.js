const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createDistrict,
  getDistricts,
  getDistrict,
  updateDistrict,
  addVisitedHousehold,
  getDistrictStatistics
} = require('../controllers/districtController');

router.route('/')
  .post(protect, authorize('admin'), createDistrict)
  .get(protect, getDistricts);

router.route('/:id')
  .get(protect, getDistrict)
  .put(protect, authorize('admin'), updateDistrict);

router.post('/:id/households', protect, addVisitedHousehold);
router.get('/:id/statistics', protect, getDistrictStatistics);

module.exports = router;
