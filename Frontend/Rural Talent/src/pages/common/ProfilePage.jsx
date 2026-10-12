import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { User, Mail, Phone, MapPin, Building, ShieldCheck, Check, AlertCircle } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    companyName: user?.company_name || '',
    industry: user?.industry || '',
    location: user?.location || '',
    skills: user?.skills || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      await authService.updateProfile(formData);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar 
        title="Account & Identity Settings" 
        subtitle="Manage your profile credentials, verification tier and professional metadata" 
      />
      <div className="page-container" style={{ maxWidth: '800px' }}>
        {message && (
          <div style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Check size={16} /> {message}
          </div>
        )}

        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="user-avatar" style={{ width: 64, height: 64, fontSize: '1.5rem' }}>
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', color: '#fff', fontWeight: 700 }}>{user?.full_name}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.25rem' }}>
                <span className="status-badge approved">Role: {user?.role}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.email}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {user?.role === 'EMPLOYER' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    className="form-input"
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
                    value={formData.industry}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {user?.role === 'WORKER' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Town / Region</label>
                  <input
                    type="text"
                    name="location"
                    className="form-input"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Key Competencies</label>
                  <input
                    type="text"
                    name="skills"
                    className="form-input"
                    value={formData.skills}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                <Check size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
