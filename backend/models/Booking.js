const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    charger: { type: mongoose.Schema.Types.ObjectId, ref: 'Charger', required: true },
    date: { type: String, required: true }, // "YYYY-MM-DD"
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },
    estimatedCost: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
