const Booking = require('../models/Booking');
const Charger = require('../models/Charger');
const Station = require('../models/Station');

// @route POST /api/bookings  (steps 4-5: select slot + confirm booking)
const createBooking = async (req, res) => {
  try {
    const { stationId, chargerId, date, startTime, endTime } = req.body;

    const charger = await Charger.findById(chargerId);
    if (!charger || !charger.isAvailable) {
      return res.status(400).json({ message: 'Charger is not available' });
    }

    // Prevent double-booking the same charger for an overlapping slot
    const clash = await Booking.findOne({
      charger: chargerId,
      date,
      status: { $in: ['pending', 'confirmed'] },
      $or: [{ startTime: { $lt: endTime }, endTime: { $gt: startTime } }],
    });
    if (clash) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }

    const station = await Station.findById(stationId);
    const hours =
      (parseInt(endTime.split(':')[0]) - parseInt(startTime.split(':')[0])) || 1;
    const estimatedCost = hours * charger.powerKw * station.pricePerKwh;

    const booking = await Booking.create({
      user: req.user._id,
      station: stationId,
      charger: chargerId,
      date,
      startTime,
      endTime,
      estimatedCost,
      status: 'pending',
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/bookings/:id/pay  (step 6: online payment)
const payForBooking = async (req, res) => {
  try {
    const { paymentId } = req.body; // comes from payment gateway (e.g. Razorpay/Stripe) on the frontend
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = paymentId;
    await booking.save();

    await Charger.findByIdAndUpdate(booking.charger, { isAvailable: false });

    res.json(booking); // step 7: confirmation returned to frontend
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/bookings/my
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('station', 'name address')
      .populate('charger', 'chargerCode type')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'cancelled';
    await booking.save();
    await Charger.findByIdAndUpdate(booking.charger, { isAvailable: true });

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, payForBooking, getMyBookings, cancelBooking };
