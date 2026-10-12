import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { qaService } from '../../services/qaService';
import { 
  ShieldCheck, 
  Check, 
  X, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';

const QAManagementPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReviewId, setActiveReviewId] = useState(null);
  const [score, setScore] = useState(95);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('APPROVED');

  const fetchReviews = async () => {
    try {
      const res = await qaService.getQAReviews();
      if (res.success) {
        setReviews(res.data || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleAuditSubmit = async (submissionId) => {
    try {
      await qaService.reviewSubmission(submissionId, {
        score,
        feedback,
        status,
      });
      setActiveReviewId(null);
      setFeedback('');
      fetchReviews();
    } catch (err) {
      alert('Failed to record QA review: ' + err.message);
    }
  };

  return (
    <>
      <Navbar 
        title="Quality Assurance Reviews" 
        subtitle="Audit worker submissions, enforce accuracy gates & approve deliveries" 
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
              Loading QA queue...
            </div>
          ) : reviews.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <ShieldCheck size={40} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
              <h3>All Submissions Audited</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>No pending tasks awaiting quality review.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task & Submission</th>
                  <th>Worker</th>
                  <th>Submitted At</th>
                  <th>QA Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Audit Action</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((rev) => (
                  <React.Fragment key={rev.id}>
                    <tr>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{rev.task_title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>Submission #{rev.id}</div>
                      </td>
                      <td>{rev.worker_name || 'Worker'}</td>
                      <td>{new Date(rev.created_at).toLocaleDateString()}</td>
                      <td>
                        <strong style={{ color: rev.score >= 90 ? '#10b981' : '#f59e0b' }}>
                          {rev.score ? `${rev.score}%` : 'Pending'}
                        </strong>
                      </td>
                      <td>
                        <StatusBadge status={rev.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                          onClick={() => setActiveReviewId(activeReviewId === rev.id ? null : rev.id)}
                        >
                          <ShieldCheck size={14} /> Audit Work
                        </button>
                      </td>
                    </tr>

                    {/* Inline Review Drawer */}
                    {activeReviewId === rev.id && (
                      <tr>
                        <td colSpan="6" style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1.25rem', alignItems: 'end' }}>
                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">Quality Score (%)</label>
                              <input
                                type="number"
                                min="0"
                                max="100"
                                className="form-input"
                                value={score}
                                onChange={(e) => setScore(Number(e.target.value))}
                              />
                            </div>

                            <div className="form-group" style={{ margin: 0 }}>
                              <label className="form-label">QA Auditor Feedback / Notes</label>
                              <input
                                type="text"
                                placeholder="Good accuracy on product names, no null violations."
                                className="form-input"
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                              />
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                className="btn btn-primary"
                                onClick={() => {
                                  setStatus('APPROVED');
                                  handleAuditSubmit(rev.id);
                                }}
                              >
                                <Check size={16} /> Approve
                              </button>
                              <button
                                className="btn btn-danger"
                                onClick={() => {
                                  setStatus('REJECTED');
                                  handleAuditSubmit(rev.id);
                                }}
                              >
                                <X size={16} /> Reject
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default QAManagementPage;
