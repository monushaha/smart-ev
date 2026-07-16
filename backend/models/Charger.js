const mongoose = require('mongoose');

const chargerSchema = new mongoose.Schema(
  {
    station: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    chargerCode: { type: String, required: true }, // e.g. "A1", "B2"
    type: { type: String, enum: ['AC', 'DC-CCS', 'DC-CHAdeMO', 'Type2'], required: true },
    powerKw: { type: Number, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Charger', chargerSchema);
