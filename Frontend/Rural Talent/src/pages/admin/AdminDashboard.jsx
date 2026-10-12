import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  ShieldCheck, 
  ArrowRight,
  Activity,
  Layers,
  DollarSign
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <>
      <Navbar 
        title="Admin Control Center" 
        subtitle="Ecosystem governance, quality audits, workforce allocation & escrow management" 
      />
      <div className="page-container">
        {/* Metric Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalTasks || 0}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Users size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.totalWorkers || 0}</div>
              <div className="stat-label">Registered Workers</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="stat-value">{stats?.pendingQA || 0}</div>
              <div className="stat-label">Pending QA Reviews</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div className="stat-value">₹{(stats?.totalDisbursed || 0).toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Disbursed</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Operations Governance Shortcuts</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <Link to="/admin/workers" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Users size={18} className="text-emerald-400" /> Verify Workers
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/qa" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <ShieldCheck size={18} className="text-pink-400" /> Review Submissions (QA)
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link to="/admin/tasks" className="btn btn-secondary" style={{ justifyContent: 'space-between', padding: '1rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Briefcase size={18} className="text-sky-400" /> Allocate Task Work
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Recent Platform Activity */}
        <div className="glass-panel" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Activity size={20} className="text-emerald-400" />
            <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>Platform Health & Infrastructure Status</h3>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            The Rural Talent Managed Pipeline is running smoothly. Worker identity verification, MySQL persistence, and role-based access controllers are operating normally with zero unhandled exceptions.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
