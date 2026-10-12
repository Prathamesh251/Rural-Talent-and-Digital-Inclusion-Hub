import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { taskService } from '../../services/taskService';
import { adminService } from '../../services/adminService';
import { assignmentService } from '../../services/assignmentService';
import { 
  Briefcase, 
  UserPlus, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const TaskAllocationPage = () => {
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Allocation modal/drawer state
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [tasksRes, workersRes] = await Promise.all([
        taskService.getTasks(),
        adminService.listWorkers({ is_verified: 1 }),
      ]);

      if (tasksRes.success) setTasks(tasksRes.data || []);
      if (workersRes.success) setWorkers(workersRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignWorker = async (e) => {
    e.preventDefault();
    if (!selectedTask || !selectedWorkerId) return;

    setSubmitting(true);
    try {
      await assignmentService.assignWorker({
        taskId: selectedTask.id,
        workerId: selectedWorkerId,
      });
      alert(`Worker assigned successfully to "${selectedTask.title}"!`);
      setSelectedTask(null);
      setSelectedWorkerId('');
      fetchData();
    } catch (err) {
      alert('Failed to assign worker: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar 
        title="Task Allocation Hub" 
        subtitle="Match ready operational tasks with verified rural digital operators" 
      />
      <div className="page-container">
        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Allocation Drawer / Modal */}
        {selectedTask && (
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>
              Assign Worker to: <span style={{ color: 'var(--primary)' }}>{selectedTask.title}</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Select a verified worker from the roster below to allocate this dataset batch.
            </p>

            <form onSubmit={handleAssignWorker} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select
                className="form-select"
                required
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                style={{ flex: 1 }}
              >
                <option value="">-- Choose Verified Worker --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.full_name} ({w.location || 'Remote'}) — Accuracy: {w.quality_score || 100}%
                  </option>
                ))}
              </select>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                <Check size={16} /> {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedTask(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="data-table-container">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks available for allocation.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Records</th>
                  <th>Employer</th>
                  <th>Budget</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Allocation</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{task.title}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>ID #{task.id}</div>
                    </td>
                    <td>{task.total_records || 0}</td>
                    <td>{task.employer_name || 'Verified Client'}</td>
                    <td>₹{Number(task.budget).toLocaleString()}</td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                        onClick={() => setSelectedTask(task)}
                      >
                        <UserPlus size={14} /> Assign Operator
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

export default TaskAllocationPage;
