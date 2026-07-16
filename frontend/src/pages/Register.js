import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', vehicleModel: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/stations');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container-layout">
      <div className="auth-card" style={{ maxWidth: '520px' }}> {/* Slightly wider to fit grid inputs nicely */}
        
        {/* Header Branding */}
        <div className="auth-header">
          <div className="auth-logo-badge">🌱</div>
          <h2>Create Account</h2>
          <p>Join the ecosystem to effortlessly search, track, and reserve smart charging slots.</p>
        </div>

        {/* Error Notification */}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input 
              id="name"
              name="name" 
              type="text" 
              placeholder="John Doe" 
              onChange={handleChange} 
              value={form.name}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email" 
              type="email" 
              placeholder="john@example.com" 
              onChange={handleChange} 
              value={form.email}
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Minimum 6 characters" 
              onChange={handleChange} 
              value={form.password}
              required 
              minLength={6} 
            />
          </div>

          {/* Two-Column Form Row for Contact and Vehicle Info */}
          <div className="form-row-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="phone">Phone Number</label>
              <input 
                id="phone"
                name="phone" 
                type="tel" 
                placeholder="98765 43210" 
                onChange={handleChange} 
                value={form.phone}
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="vehicleModel">Vehicle Model</label>
              <input 
                id="vehicleModel"
                name="vehicleModel" 
                type="text" 
                placeholder="e.g. Tata Nexon EV" 
                onChange={handleChange} 
                value={form.vehicleModel}
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" style={{ marginTop: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login" className="auth-link">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}