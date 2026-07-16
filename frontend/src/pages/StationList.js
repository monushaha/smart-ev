import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function StationList() {
  const [stations, setStations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { data } = await api.get('/stations/nearby', {
            params: { lat: latitude, lng: longitude, radius: 500000 },
          });
          setStations(data);
        } catch (err) {
          setError(err.response?.data?.message || 'Could not map location to regional stations.');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied. Please authorize geolocation permissions to map active terminals near you.');
        setLoading(false);
      }
    );
  }, []);

  return (
    <div className="container">
      {/* List Header Context */}
      <div className="list-header-block">
        <h2>Charging Stations Near You</h2>
        <p className="list-subtext">Select an active terminal anchor below to review charger models and lock slots</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <div className="loading-spinner-simulated">⚡</div>
          <p className="ticket-label" style={{ marginTop: '12px' }}>Querying regional network locations...</p>
        </div>
      ) : error ? (
        <div className="error" style={{ padding: '16px', marginTop: '12px' }}>
          <p style={{ margin: 0 }}>📍 {error}</p>
        </div>
      ) : stations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <h3>Out of Range</h3>
          <p>We couldn't track any active partner charging installations within your regional coordinate radius.</p>
        </div>
      ) : (
        /* Render Grid Feed Layout */
        <div className="stations-grid-feed">
          {stations.map((s) => (
            <Link key={s._id} to={`/stations/${s._id}`} className="modern-station-card">
              
              <div className="station-card-top-row">
                <div className="title-area">
                  <span className="station-geo-marker">⚡</span>
                  <h3>{s.name}</h3>
                </div>
                <span className="grid-price-badge">₹{s.pricePerKwh || '0'}/kWh</span>
              </div>

              <p className="station-card-address-summary">{s.address || 'Address information missing'}</p>

              <div className="station-card-action-bar">
                <span className="station-operation-tag">🕒 Open Hub Terminal</span>
                <span className="btn-view-details-indicator">View Details →</span>
              </div>

            </Link>
          ))}
        </div>
      )}
    </div>
  );
}