import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Award, 
  Clock, 
  AlertCircle 
} from 'lucide-react';

const WorkerManagementPage = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkers = async () => {
    try {
      const res = await adminService.listWorkers();
      if (res.success) {
        setWorkers(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleToggleVerification = async (workerId, currentStatus) => {
    try {
      await adminService.verifyWorker(workerId, { is_verified: !currentStatus });
      fetchWorkers();
    } catch (err) {
      alert('Failed to update verification status: ' + err.message);
    }
  };

  return (
    <>
      <Navbar 
        title="Worker Verification & Roster" 
        subtitle="Vetting remote digital talent from small towns and allocating credentials" 
      />
      <div className="page-container">
        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="data-table-container">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading workers...
            </div>
          ) : workers.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No registered workers in system yet.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Worker Name & Email</th>
                  <th>Location</th>
                  <th>Skills</th>
                  <th>Accuracy Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((w) => (
                  <tr key={w.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{w.full_name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{w.email}</div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={14} className="text-emerald-400" /> {w.location || 'Not specified'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {w.skills || 'General Data Entry'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: '#10b981' }}>{w.quality_score ? `${w.quality_score}%` : '100%'}</strong>
                    </td>
                    <td>
                      {w.is_verified ? (
                        <span className="status-badge approved">Verified</span>
                      ) : (
                        <span className="status-badge draft">Unverified</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn ${w.is_verified ? 'btn-danger' : 'btn-primary'}`}
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => handleToggleVerification(w.id, w.is_verified)}
                      >
                        {w.is_verified ? 'Revoke Verification' : 'Verify Talent'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default WorkerManagementPage;
