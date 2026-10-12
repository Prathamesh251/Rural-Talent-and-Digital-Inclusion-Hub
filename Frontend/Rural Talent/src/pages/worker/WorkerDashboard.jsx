import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { assignmentService } from '../../services/assignmentService';
import { 
  Briefcase, 
  PlayCircle, 
  Award, 
  Clock, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';

const WorkerDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await assignmentService.getAssignments();
        if (res.success) {
          setAssignments(res.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const assignedCount = assignments.filter(a => a.status === 'ASSIGNED').length;
  const inProgressCount = assignments.filter(a => a.status === 'IN_PROGRESS').length;
  const submittedCount = assignments.filter(a => ['SUBMITTED', 'APPROVED'].includes(a.status)).length;

  return (
    <>
      <Navbar 
        title="Worker Execution Hub" 
        subtitle="Execute assigned digital tasks, verification batches & track quality scores" 
      />
      <div className="page-container">
        {/* Metric Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(129, 140, 248, 0.15)', color: '#818cf8' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{assignedCount}</div>
              <div className="stat-label">New Assignments</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <PlayCircle size={24} />
            </div>
            <div>
              <div className="stat-value">{inProgressCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{submittedCount}</div>
              <div className="stat-label">Completed & Submitted</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
              <Award size={24} />
            </div>
            <div>
              <div className="stat-value">98.4%</div>
              <div className="stat-label">QA Accuracy Score</div>
            </div>
          </div>
        </div>

        {/* Assigned Tasks Table */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Your Assigned Work</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Focus on one assignment at a time with strict adherence to instructions.</p>
        </div>

        <div className="data-table-container">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>No Active Assignments</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0.5rem auto' }}>
                You will receive work assignments as soon as an operations administrator allocates tasks to your profile.
              </p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Allocated Records</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Work Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{assignment.task_title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        Assigned on {new Date(assignment.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{assignment.total_records || 0} records</td>
                    <td>{assignment.deadline ? new Date(assignment.deadline).toLocaleDateString() : 'Flexible'}</td>
                    <td>
                      <StatusBadge status={assignment.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/worker/assignments/${assignment.id}`}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.95rem', fontSize: '0.825rem' }}
                      >
                        Open Workspace <ArrowRight size={14} />
                      </Link>
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

export default WorkerDashboard;
