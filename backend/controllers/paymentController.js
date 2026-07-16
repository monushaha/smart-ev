const crypto = require('crypto');
const Razorpay = require('razorpay');
const Booking = require('../models/Booking');
const Charger = require('../models/Charger');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @route POST /api/payments/create-order
// Creates a Razorpay order for a given booking. Called right before the checkout popup opens.
const createOrder = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Booking is already paid' });
    }

    // Razorpay expects amount in paise (smallest currency unit), so multiply by 100
    const order = await razorpay.orders.create({
      amount: Math.round(booking.estimatedCost * 100),
      currency: 'INR',
      receipt: `booking_${booking._id}`,
      notes: { bookingId: booking._id.toString() },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose, it's a public key
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/payments/verify
// Verifies the payment signature Razorpay returns after checkout, then confirms the booking.
const verifyPayment = async (req, res) => {
  try {
    const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Recompute the expected signature server-side — never trust the frontend's word alone
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    booking.paymentId = razorpay_payment_id;
    await booking.save();

    await Charger.findByIdAndUpdate(booking.charger, { isAvailable: false });

    res.json({ message: 'Payment verified', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createOrder, verifyPayment };
