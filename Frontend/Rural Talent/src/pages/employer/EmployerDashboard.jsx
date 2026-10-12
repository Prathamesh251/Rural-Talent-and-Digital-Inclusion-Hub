import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { taskService } from '../../services/taskService';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  CreditCard, 
  Plus, 
  ArrowRight,
  Upload,
  AlertCircle
} from 'lucide-react';

const EmployerDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await taskService.getTasks();
        if (res.success) {
          setTasks(res.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Aggregated Operational Metrics
  const activeCount = tasks.filter(t => ['READY', 'ASSIGNED', 'IN_PROGRESS'].includes(t.status)).length;
  const awaitingQACount = tasks.filter(t => ['SUBMITTED', 'QA_REVIEW'].includes(t.status)).length;
  const completedCount = tasks.filter(t => ['APPROVED', 'COMPLETED'].includes(t.status)).length;
  const totalBudget = tasks.reduce((sum, t) => sum + Number(t.budget || 0), 0);

  return (
    <>
      <Navbar 
        title="Employer Control Center" 
        subtitle="Manage operations batches, structured workflows & deliverables" 
      />
      <div className="page-container">
        {/* Metric Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Briefcase size={24} />
            </div>
            <div>
              <div className="stat-value">{activeCount}</div>
              <div className="stat-label">Active Tasks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(244, 114, 182, 0.15)', color: '#f472b6' }}>
              <Clock size={24} />
            </div>
            <div>
              <div className="stat-value">{awaitingQACount}</div>
              <div className="stat-label">Awaiting QA</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed Tasks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <div className="stat-value">₹{totalBudget.toLocaleString('en-IN')}</div>
              <div className="stat-label">Allocated Budget</div>
            </div>
          </div>
        </div>

        {/* Action Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>Operations Batches</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Real-time execution status of your submitted projects</p>
          </div>
          <Link to="/employer/create-task" className="btn btn-primary">
            <Plus size={18} />
            <span>Create New Task</span>
          </Link>
        </div>

        {/* Task Table */}
        <div className="data-table-container">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading task status...
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center' }}>
              <AlertCircle size={40} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: '#fff' }}>No Tasks Created Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0.5rem auto 1.5rem auto' }}>
                Upload your structured dataset (CSV/XLSX) to deploy it to verified remote specialists.
              </p>
              <Link to="/employer/create-task" className="btn btn-primary">
                <Plus size={18} /> Submit First Task
              </Link>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Records</th>
                  <th>Budget</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{task.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td>{task.total_records || 0} items</td>
                    <td>₹{Number(task.budget).toLocaleString('en-IN')}</td>
                    <td>{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Link
                        to={`/employer/tasks/${task.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Details <ArrowRight size={14} />
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

export default EmployerDashboard;
