import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { taskService } from '../../services/taskService';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckSquare, 
  Layers,
  Upload
} from 'lucide-react';

const TaskDetailsPage = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const [taskRes, recordsRes] = await Promise.all([
          taskService.getTaskById(id),
          taskService.getTaskRecords(id, { limit: 10 }),
        ]);

        if (taskRes.success) setTask(taskRes.data);
        if (recordsRes.success) setRecords(recordsRes.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar title="Task Specifications" />
        <div className="page-container" style={{ textAlign: 'center', padding: '4rem' }}>
          Loading task details...
        </div>
      </>
    );
  }

  if (error || !task) {
    return (
      <>
        <Navbar title="Task Not Found" />
        <div className="page-container">
          <p style={{ color: '#fb7185' }}>{error || 'Task could not be loaded.'}</p>
          <Link to="/employer/dashboard" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar title={task.title} subtitle={`Task ID: #${task.id} • Managed Operations`} />
      <div className="page-container">
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/employer/dashboard" className="btn btn-secondary" style={{ display: 'inline-flex', padding: '0.4rem 0.85rem' }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>

        {/* Top Header Card */}
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>{task.title}</h2>
                <StatusBadge status={task.status} />
              </div>
              <p style={{ color: 'var(--text-muted)', maxWidth: '700px' }}>{task.description || 'No general description provided.'}</p>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.03)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>TOTAL BUDGET</span>
                <strong style={{ fontSize: '1.1rem', color: '#10b981' }}>₹{Number(task.budget).toLocaleString()}</strong>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>TOTAL RECORDS</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{task.total_records || 0}</strong>
              </div>
              <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '1.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'block' }}>DEADLINE</span>
                <strong style={{ fontSize: '1.1rem', color: '#fff' }}>
                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions Pane */}
        <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} className="text-emerald-400" /> Execution Instructions
          </h3>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: 'var(--radius-md)', whiteSpace: 'pre-wrap', color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            {task.instructions || 'No specific instructions logged for this task.'}
          </div>
        </div>

        {/* Sample Task Records Preview */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Parsed Dataset Records Preview</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Displaying sample items allocated to verification pipeline.
          </p>
        </div>

        <div className="data-table-container">
          {records.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No parsed records found. You can upload a dataset file to generate records.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Row #</th>
                  <th>Raw Data Content</th>
                  <th>Record Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((rec) => (
                  <tr key={rec.id}>
                    <td style={{ width: '100px', fontWeight: 600 }}>#{rec.record_index}</td>
                    <td>
                      <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        {JSON.stringify(rec.raw_data, null, 2)}
                      </pre>
                    </td>
                    <td>
                      <StatusBadge status={rec.status} />
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

export default TaskDetailsPage;
