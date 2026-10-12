import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import { taskService } from '../../services/taskService';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import './CreateTask.css';

const CreateTaskPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    instructions: '',
    deadline: '',
    budget: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const handleTextChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Task Entity
      const taskRes = await taskService.createTask(taskData);
      const createdTaskId = taskRes.data?.id;

      // 2. Upload dataset file if provided
      if (selectedFile && createdTaskId) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        await taskService.uploadTaskFile(createdTaskId, formData);
      }

      navigate('/employer/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to submit task. Please check requirements.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar 
        title="Submit New Work Batch" 
        subtitle="Specify guidelines, acceptance criteria, and upload structured dataset" 
      />
      <div className="page-container" style={{ maxWidth: '900px' }}>
        {/* Step Indicator */}
        <div className="stepper">
          <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
            <span className="step-num">1</span>
            <span className="step-title">Basic Details</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span className="step-title">Execution Rules</span>
          </div>
          <div className="step-line" />
          <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span className="step-title">Data Source & Review</span>
          </div>
        </div>

        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="glass-panel form-card">
          {/* STEP 1: BASIC DETAILS */}
          {step === 1 && (
            <div className="step-pane">
              <h3 className="section-heading">Step 1 — Task Specification</h3>
              <div className="form-group">
                <label className="form-label">Task Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Catalog Standardization & SKU Verification"
                  className="form-input"
                  value={taskData.title}
                  onChange={handleTextChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Overview / Purpose</label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Briefly describe what this operational work entails..."
                  className="form-textarea"
                  value={taskData.description}
                  onChange={handleTextChange}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Budget (INR ₹)</label>
                  <input
                    type="number"
                    name="budget"
                    placeholder="e.g. 5000"
                    className="form-input"
                    value={taskData.budget}
                    onChange={handleTextChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Completion Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    className="form-input"
                    value={taskData.deadline}
                    onChange={handleTextChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!taskData.title.trim()}
                  onClick={() => setStep(2)}
                >
                  Next: Instructions <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: INSTRUCTIONS */}
          {step === 2 && (
            <div className="step-pane">
              <h3 className="section-heading">Step 2 — Strict Execution Instructions</h3>
              <p className="section-desc">
                Workers follow exact acceptance rules. Provide bulleted standards (spelling, capitalization, null values).
              </p>

              <div className="form-group">
                <label className="form-label">Detailed Guidelines</label>
                <textarea
                  name="instructions"
                  rows="8"
                  placeholder={`1. Correct obvious spelling mistakes in product titles.
2. Standardize categories according to reference values.
3. Do not modify existing alphanumeric SKU tags.
4. Leave unknown fields as blank instead of typing N/A.`}
                  className="form-textarea"
                  value={taskData.instructions}
                  onChange={handleTextChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                >
                  Next: Upload Dataset <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD & REVIEW */}
          {step === 3 && (
            <div className="step-pane">
              <h3 className="section-heading">Step 3 — Dataset Upload & Dispatch</h3>

              <div className="file-drop-area">
                <UploadCloud size={48} className="upload-icon" />
                <h4>Select CSV or XLSX Dataset</h4>
                <p>The system will automatically parse and create verified records for allocation.</p>
                <input
                  type="file"
                  id="task-file-upload"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="task-file-upload" className="btn btn-secondary upload-trigger">
                  Browse File
                </label>
                {selectedFile && (
                  <div className="selected-file-badge">
                    <FileSpreadsheet size={16} className="text-emerald-400" />
                    <span>{selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                  </div>
                )}
              </div>

              <div className="review-summary">
                <h4>Submission Summary</h4>
                <div className="summary-row">
                  <span>Task Title:</span> <strong>{taskData.title}</strong>
                </div>
                <div className="summary-row">
                  <span>Budget:</span> <strong>₹{Number(taskData.budget || 0).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Deadline:</span> <strong>{taskData.deadline || 'Flexible'}</strong>
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  disabled={loading}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Submitting & Parsing...' : 'Confirm & Deploy Task'}
                  <Check size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CreateTaskPage;
