import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/api';

export default function NavigateToStation() {
  const { id } = useParams();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/stations/${id}`)
      .then(({ data }) => {
        setStation(data.station);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching station coordinates:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <p className="ticket-label">Loading location coordinates...</p>
      </div>
    );
  }

  if (!station || !station.location?.coordinates) {
    return (
      <div className="container">
        <div className="error">Station or location coordinates could not be retrieved.</div>
        <Link to="/dashboard" className="btn-secondary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '10px' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const [lng, lat] = station.location.coordinates;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className="container">
      <div className="navigation-card">
        
        {/* Header Indicator */}
        <div className="navigation-header">
          <div className="map-icon-badge">📍</div>
          <h2>Route Navigation</h2>
          <p>Ready to charge? Let's get you to the station terminal.</p>
        </div>

        {/* Station Details Hub */}
        <div className="destination-summary-box">
          <span className="ticket-label">DESTINATION STATION</span>
          <h3>{station.name}</h3>
          <p className="station-address-text">📌 {station.address || "Address not specified"}</p>
          
          <div className="coordinates-tag">
            <code>GPS: {lat.toFixed(5)}, {lng.toFixed(5)}</code>
          </div>
        </div>

        {/* Pre-arrival Workflow Callout */}
        <div className="arrival-tips-box">
          <h4>💡 Quick Pre-Arrival Check:</h4>
          <ul>
            <li>Ensure your EV charging port cap is cleared for quick plugin hookups.</li>
            <li>Have your Digital Booking Ticket ID handy on your dashboard if requested.</li>
          </ul>
        </div>

        {/* Navigation Launch Buttons */}
        <div className="navigation-actions">
          <a 
            href={mapsUrl} 
            target="_blank" 
            rel="noreferrer" 
            className="btn-primary btn-launch-maps"
          >
            🚀 Open Directions in Google Maps
          </a>
          
          <Link to="/dashboard" className="btn-secondary-link">
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}