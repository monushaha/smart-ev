const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true }, // [longitude, latitude]
    },
    openingTime: { type: String, default: '00:00' },
    closingTime: { type: String, default: '23:59' },
    pricePerKwh: { type: Number, required: true },
    totalChargers: { type: Number, default: 1 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

// Enable geospatial "find nearby" queries
stationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Station', stationSchema);
