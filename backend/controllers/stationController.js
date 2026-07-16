const Station = require('../models/Station');
const Charger = require('../models/Charger');

// @route GET /api/stations/nearby?lat=..&lng=..&radius=5000
const getNearbyStations = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: 'lat and lng are required' });
    }

    const stations = await Station.find({
      status: 'active',
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    });

    res.json(stations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/stations/:id  (station details + its chargers)
const getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });

    const chargers = await Charger.find({ station: station._id });
    res.json({ station, chargers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/stations  (admin only)
const createStation = async (req, res) => {
  try {
    const station = await Station.create(req.body);
    res.status(201).json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PUT /api/stations/:id  (admin only)
const updateStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json(station);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route DELETE /api/stations/:id  (admin only)
const deleteStation = async (req, res) => {
  try {
    const station = await Station.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    res.json({ message: 'Station deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNearbyStations, getStationById, createStation, updateStation, deleteStation };
