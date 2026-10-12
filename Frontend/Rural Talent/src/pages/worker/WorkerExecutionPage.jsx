import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { assignmentService } from '../../services/assignmentService';
import { taskService } from '../../services/taskService';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  CheckCircle2, 
  FileText, 
  Play, 
  Send,
  AlertCircle 
} from 'lucide-react';
import './WorkerExecution.css';

const WorkerExecutionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [records, setRecords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const assignRes = await assignmentService.getAssignmentById(id);
        if (assignRes.success) {
          const assignData = assignRes.data;
          setAssignment(assignData);

          // Fetch records for this task
          const recRes = await taskService.getTaskRecords(assignData.task_id);
          if (recRes.success && recRes.data) {
            setRecords(recRes.data);
            if (recRes.data.length > 0) {
              const currentRec = recRes.data[0];
              setFormData(currentRec.processed_data || currentRec.raw_data || {});
            }
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleStartWork = async () => {
    try {
      await assignmentService.startAssignment(id);
      setAssignment({ ...assignment, status: 'IN_PROGRESS' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveRecord = async () => {
    if (records.length === 0) return;
    const currentRec = records[currentIndex];
    setSaving(true);
    setSuccessMsg('');

    try {
      await taskService.updateRecord(currentRec.id, {
        processed_data: formData,
        status: 'VERIFIED',
      });
      setSuccessMsg('Record saved successfully!');

      // Update in local records state
      const updated = [...records];
      updated[currentIndex] = {
        ...currentRec,
        processed_data: formData,
        status: 'VERIFIED',
      };
      setRecords(updated);

      setTimeout(() => setSuccessMsg(''), 2500);
    } catch (err) {
      setError('Failed to save record: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNextRecord = () => {
    if (currentIndex < records.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextRec = records[nextIdx];
      setFormData(nextRec.processed_data || nextRec.raw_data || {});
    }
  };

  const handlePrevRecord = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevRec = records[prevIdx];
      setFormData(prevRec.processed_data || prevRec.raw_data || {});
    }
  };

  const handleSubmitAll = async () => {
    if (!window.confirm('Are you ready to submit this completed assignment for QA Review?')) {
      return;
    }
    setSubmitting(true);
    try {
      await assignmentService.submitAssignment(id, 'All records checked and formatted according to guidelines.');
      navigate('/worker/dashboard');
    } catch (err) {
      setError('Submission failed: ' + err.message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="Loading Workspace..." />
        <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
          Loading task and dataset records...
        </div>
      </>
    );
  }

  const currentRecord = records[currentIndex];
  const progressPct = records.length > 0 ? Math.round(((currentIndex + 1) / records.length) * 100) : 0;

  return (
    <>
      <Navbar 
        title={assignment?.task_title || 'Work Interface'} 
        subtitle={`Assignment #${assignment?.id} • Execution Workspace`} 
      />
      <div className="page-container" style={{ maxWidth: '1100px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <Link to="/worker/dashboard" className="btn btn-secondary" style={{ padding: '0.4rem 0.85rem' }}>
            <ArrowLeft size={16} /> Exit to Dashboard
          </Link>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <StatusBadge status={assignment?.status} />
            {assignment?.status === 'ASSIGNED' && (
              <button className="btn btn-primary" onClick={handleStartWork}>
                <Play size={16} /> Start Working
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Instructions Collapsible Panel */}
        <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <FileText size={18} className="text-emerald-400" />
            <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Task Instructions:</strong>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {assignment?.instructions || 'Standard verification guidelines apply.'}
          </div>
        </div>

        {/* Record Processing Interface */}
        {records.length > 0 ? (
          <div className="glass-panel execution-panel">
            {/* Progress Header */}
            <div className="execution-header">
              <div className="record-counter">
                <span>Record Item:</span>
                <strong>{currentIndex + 1} of {records.length}</strong>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
              </div>
              <span className="progress-text">{progressPct}%</span>
            </div>

            {successMsg && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: 'var(--radius-md)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> {successMsg}
              </div>
            )}

            {/* Field Editing Form */}
            <div className="field-grid">
              {Object.entries(formData).map(([key, value]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{key.replace(/_/g, ' ')}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={typeof value === 'object' ? JSON.stringify(value) : value || ''}
                    onChange={(e) => handleFieldChange(key, e.target.value)}
                  />
                </div>
              ))}
            </div>

            {/* Bottom Actions Bar */}
            <div className="execution-footer">
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={currentIndex === 0}
                  onClick={handlePrevRecord}
                >
                  <ArrowLeft size={16} /> Previous
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={currentIndex === records.length - 1}
                  onClick={handleNextRecord}
                >
                  Next <ArrowRight size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveRecord}
                  disabled={saving}
                >
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Record'}
                </button>

                {currentIndex === records.length - 1 && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)' }}
                    onClick={handleSubmitAll}
                    disabled={submitting}
                  >
                    <Send size={16} /> {submitting ? 'Submitting...' : 'Submit All Work'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No records associated with this task dataset. Contact your administrator.
          </div>
        )}
      </div>
    </>
  );
};

export default WorkerExecutionPage;
