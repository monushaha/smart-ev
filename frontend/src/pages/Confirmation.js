import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/api';

export default function Confirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => {
        setBooking(data.find((b) => b._id === id));
      })
      .catch((err) => console.error("Error fetching booking detail:", err));
  }, [id]);

  if (!booking) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '40px' }}>
        <p className="ticket-label">Loading confirmation...</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  // Human-readable date formatting helper
  const formattedDate = booking.date 
    ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';

  return (
    <div className="container">
      <div className="confirmation-card">
        
        {/* 1. Success Animated/Static Header */}
        <div className="success-header">
          <div className="success-icon">✓</div>
          <h2>Booking Confirmed!</h2>
          <p>Your charging slot has been successfully reserved.</p>
        </div>

        {/* 2. Digital Ticket Graphics Wrapper */}
        <div className="ticket-container">
          <div className="ticket-top">
            <span className="ticket-label">STATION</span>
            <h3>{booking.station?.name || "EV Charging Station"}</h3>
            <p className="ticket-subtext">Status: <strong>{booking.status?.toUpperCase()}</strong></p>
          </div>
          
          <div className="ticket-divider">
            <div className="notch notch-left"></div>
            <div className="notch notch-right"></div>
          </div>
          
          <div className="ticket-bottom">
            <div className="ticket-grid">
              <div>
                <span className="ticket-label">DATE</span>
                <p>{formattedDate}</p>
              </div>
              <div>
                <span className="ticket-label">TIME SLOT</span>
                <p>{booking.startTime || "--:--"} - {booking.endTime || "--:--"}</p>
              </div>
              <div>
                <span className="ticket-label">CHARGER TYPE</span>
                <p>
                  {booking.charger?.chargerCode ? `${booking.charger.chargerCode} ` : ""} 
                  ({booking.charger?.type || "Standard"})
                </p>
              </div>
              <div>
                <span className="ticket-label">BOOKING ID</span>
                <p className="code-text">{booking._id}</p>
              </div>
            </div>
            
            <div className="ticket-price">
              <span className="ticket-label">AMOUNT PAID</span>
              <span className="price-tag">₹{booking.estimatedCost || "0"}</span>
            </div>
          </div>
        </div>

        {/* 3. Next Steps/Workflow Banner */}
        <div className="next-steps">
          <h4>⚡ What to do next:</h4>
          <ol>
            <li>Arrive at the terminal hub 5 minutes before your slot timeline.</li>
            <li>Use the direction navigation routing map link below if you require assistance.</li>
            <li>Connect charger plug layout hook directly into your vehicle.</li>
          </ol>
        </div>

        {/* 4. Action Buttons Layout */}
        <div className="action-buttons">
          <button onClick={handlePrint} className="btn-secondary">
            🖨️ Print Ticket
          </button>
          
          <Link to={`/navigate/${booking.station?._id}`} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            📍 Get Directions
          </Link>
          
          <button onClick={() => navigate('/')} className="btn-secondary">
            Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}