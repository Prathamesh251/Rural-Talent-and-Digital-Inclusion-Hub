import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Layers, ArrowRight, AlertCircle, Building, UserCheck } from 'lucide-react';
import './Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'WORKER',
    phone: '',
    companyName: '',
    industry: '',
    skills: '',
    location: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await register(formData);
      if (user.role === 'EMPLOYER') navigate('/employer/dashboard');
      else if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else navigate('/worker/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <Layers className="text-emerald-400" size={28} />
          </div>
          <h1>Create an Account</h1>
          <p>Join as an Employer or Verified Digital Worker</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="role-selector">
          <button
            type="button"
            className={`role-tab ${formData.role === 'WORKER' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'WORKER' })}
          >
            <UserCheck size={18} />
            <span>I want to Work</span>
          </button>
          <button
            type="button"
            className={`role-tab ${formData.role === 'EMPLOYER' ? 'active' : ''}`}
            onClick={() => setFormData({ ...formData, role: 'EMPLOYER' })}
          >
            <Building size={18} />
            <span>I want to Hire</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="fullName"
                required
                className="form-input"
                placeholder="Ramesh Kumar"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                required
                className="form-input"
                placeholder="ramesh@example.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                required
                className="form-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phone"
                className="form-input"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {formData.role === 'EMPLOYER' ? (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  className="form-input"
                  placeholder="Apex Retailers"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  className="form-input"
                  placeholder="E-Commerce, Logistics, etc."
                  value={formData.industry}
                  onChange={handleChange}
                />
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Location / Town</label>
                <input
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="Satara, Maharashtra"
                  value={formData.location}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Key Skills</label>
                <input
                  type="text"
                  name="skills"
                  className="form-input"
                  placeholder="Data Entry, Excel, Verification"
                  value={formData.skills}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already registered?{' '}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
