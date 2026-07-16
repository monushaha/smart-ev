const express = require('express');
const router = express.Router();
const {
  getNearbyStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation,
} = require('../controllers/stationController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/nearby', getNearbyStations);
router.get('/:id', getStationById);
router.post('/', protect, adminOnly, createStation);
router.put('/:id', protect, adminOnly, updateStation);
router.delete('/:id', protect, adminOnly, deleteStation);

module.exports = router;
