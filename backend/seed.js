// Run with: node seed.js
// Inserts sample charging stations + chargers so you have data to test against.
require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('./models/Station');
const Charger = require('./models/Charger');

const sampleStations = [
  {
    name: 'Bandra EV Hub',
    address: 'Linking Road, Bandra West, Mumbai',
    location: { type: 'Point', coordinates: [72.8296, 19.0596] }, // [lng, lat]
    pricePerKwh: 12,
    openingTime: '06:00',
    closingTime: '23:00',
    totalChargers: 2,
  },
  {
    name: 'Andheri Charge Point',
    address: 'SV Road, Andheri West, Mumbai',
    location: { type: 'Point', coordinates: [72.8467, 19.1197] },
    pricePerKwh: 10,
    openingTime: '00:00',
    closingTime: '23:59',
    totalChargers: 3,
  },
  {
    name: 'Powai Fast Charge Station',
    address: 'Hiranandani Gardens, Powai, Mumbai',
    location: { type: 'Point', coordinates: [72.9051, 19.1176] },
    pricePerKwh: 15,
    openingTime: '05:00',
    closingTime: '22:00',
    totalChargers: 2,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    // Clear existing sample data (safe for repeated runs during testing)
    await Station.deleteMany({});
    await Charger.deleteMany({});

    for (const s of sampleStations) {
      const station = await Station.create(s);

      // Add a couple of chargers per station
      await Charger.create([
        { station: station._id, chargerCode: 'A1', type: 'AC', powerKw: 7, isAvailable: true },
        { station: station._id, chargerCode: 'B1', type: 'DC-CCS', powerKw: 50, isAvailable: true },
      ]);

      console.log(`Created station: ${station.name}`);
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
};

seed();
