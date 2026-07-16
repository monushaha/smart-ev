import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/api';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my')
      .then(({ data }) => {
        setBookings(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard bookings:", err);
        setLoading(false);
      });
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking slot?")) return;
    
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setBookings((prev) => 
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      console.error("Failed to cancel booking:", err);
    }
  };

  // Helper to safely format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h2>My Bookings</h2>
          <p className="dashboard-subtext">Manage your reserved slots and track charging history</p>
        </div>
        {/* Quick action helper to search stations if they have no bookings */}
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', fontSize: '14px', padding: '10px 16px' }}>
          + Book New Slot
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p className="ticket-label">Loading your dashboard data...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚡</div>
          <h3>No bookings found</h3>
          <p>You haven't reserved any charging slots yet. Explore available stations to get started.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((b) => {
            const isConfirmed = b.status === 'confirmed';
            
            return (
              <div key={b._id} className="booking-row-card">
                
                {/* Left Side: Station & Core Info */}
                <div className="booking-main-info">
                  <div className="station-title-row">
                    <h3>{b.station?.name || "EV Charging Station"}</h3>
                    <span className={`status-badge ${isConfirmed ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {b.status || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="booking-meta-grid">
                    <div className="meta-item">
                      <span className="meta-label">📅 Date</span>
                      <span className="meta-value">{formatDate(b.date)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">⏰ Time Window</span>
                      <span className="meta-value">{b.startTime || "--:--"} - {b.endTime || "--:--"}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">💳 Estimated Cost</span>
                      <span className="meta-value cost-value">₹{b.estimatedCost || "0"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Action Context Routing */}
                <div className="booking-actions">
                  {isConfirmed ? (
                    <>
                      <Link to={`/confirmation/${b._id}`} className="btn-view-ticket">
                        🎟️ Ticket
                      </Link>
                      <button 
                        onClick={() => handleCancel(b._id)} 
                        className="btn-cancel"
                        title="Cancel Slot"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <span className="archive-label">Archived</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}