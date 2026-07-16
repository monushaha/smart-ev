import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function StationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [chargers, setChargers] = useState([]);
  const [form, setForm] = useState({ chargerId: '', date: '', startTime: '', endTime: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/stations/${id}`)
      .then(({ data }) => {
        setStation(data.station);
        setChargers(data.chargers);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching station profile:", err);
        setLoading(false);
      });
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleBook = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/bookings', { stationId: id, ...form });
      navigate(`/payment/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please look over your slot selection.');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <p className="ticket-label">Loading station layout details...</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="container">
        <div className="error">Station profile data could not be recovered.</div>
        <Link to="/stations" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block' }}>
          Back to Stations
        </Link>
      </div>
    );
  }

  return (
    <div className="container">
      {/* 1. Station Hub Header Hero */}
      <div className="station-detail-hero">
        <Link to="/stations" className="back-link">← Back to Stations</Link>
        <h2>{station.name}</h2>
        <p className="station-hero-address">📍 {station.address}</p>
        
        <div className="station-quick-meta-row">
          <span className="meta-pill price-pill">₹{station.pricePerKwh || '0'} / kWh</span>
          <span className="meta-pill hours-pill">🕒 Open: {station.openingTime || '--'} - {station.closingTime || '--'}</span>
        </div>
      </div>

      {/* 2. Content Layout Grid Partition Split */}
      <div className="station-grid-layout">
        
        {/* Left Hand Column: Chargers Status Inventory */}
        <div className="chargers-inventory-panel">
          <h3>Available Chargers</h3>
          {chargers.length === 0 ? (
            <p className="empty-subtext">No chargers are registered at this terminal.</p>
          ) : (
            <div className="charger-status-list">
              {chargers.map((c) => {
                const available = c.isAvailable;
                return (
                  <div key={c._id} className={`charger-status-card ${available ? 'status-free' : 'status-busy'}`}>
                    <div className="charger-card-meta">
                      <span className="charger-identifier-code">{c.chargerCode || 'Unknown Port'}</span>
                      <span className="charger-power-badge">{c.powerKw || '0'} kW</span>
                    </div>
                    <div className="charger-card-footer">
                      <span className="charger-type-label">{c.type || 'Standard'}</span>
                      <span className={`indicator-bullet-label ${available ? 'bullet-free' : 'bullet-busy'}`}>
                        {available ? '● Online' : '● In Use'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Hand Column: Reservation Panel Form Card */}
        <div className="booking-portal-panel">
          <div className="booking-sticky-card">
            <h3>Reserve a Slot</h3>
            
            {error && <div className="error" style={{ marginBottom: '14px' }}>{error}</div>}
            
            <form onSubmit={handleBook} className="station-booking-form">
              <div className="input-group">
                <label className="input-label" htmlFor="chargerId">Select Charger Port</label>
                <select 
                  id="chargerId"
                  name="chargerId" 
                  onChange={handleChange} 
                  value={form.chargerId}
                  required
                >
                  <option value="">-- Choose an available port --</option>
                  {chargers.filter((c) => c.isAvailable).map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.chargerCode} - {c.type} ({c.powerKw}kW)
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" htmlFor="date">Target Date</label>
                <input 
                  id="date"
                  type="date" 
                  name="date" 
                  onChange={handleChange} 
                  value={form.date}
                  required 
                />
              </div>

              <div className="form-row-grid">
                <div className="input-group">
                  <label className="input-label" htmlFor="startTime">Start Time</label>
                  <input 
                    id="startTime"
                    type="time" 
                    name="startTime" 
                    onChange={handleChange} 
                    value={form.startTime}
                    required 
                  />
                </div>
                <div className="input-group">
                  <label className="input-label" htmlFor="endTime">End Time</label>
                  <input 
                    id="endTime"
                    type="time" 
                    name="endTime" 
                    onChange={handleChange} 
                    value={form.endTime}
                    required 
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary btn-booking-submit">
                Confirm Slot Allocation
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}