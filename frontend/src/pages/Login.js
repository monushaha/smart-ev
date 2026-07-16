import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/stations');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-container-layout">
      <div className="auth-card">
        {/* Branding & Welcome Subtext */}
        <div className="auth-header">
          <div className="auth-logo-badge">⚡</div>
          <h2>Welcome Back</h2>
          <p>Log in to locate and reserve your smart EV charging slots</p>
        </div>

        {/* Error Notification Alert */}
        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email" 
              type="email" 
              placeholder="name@example.com" 
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
              placeholder="••••••••" 
              onChange={handleChange} 
              value={form.password}
              required 
            />
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          <p>New here? <Link to="/register" className="auth-link">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}