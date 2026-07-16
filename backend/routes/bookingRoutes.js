const express = require('express');
const router = express.Router();
const {
  createBooking,
  payForBooking,
  getMyBookings,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.post('/:id/pay', protect, payForBooking);
router.get('/my', protect, getMyBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
