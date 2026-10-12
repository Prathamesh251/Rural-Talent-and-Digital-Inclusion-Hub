import React from 'react';

const StatusBadge = ({ status }) => {
  const normalized = (status || 'DRAFT').toLowerCase().replace(/\s+/g, '_');
  
  const labelMap = {
    draft: 'Draft',
    ready: 'Ready',
    assigned: 'Assigned',
    in_progress: 'In Progress',
    submitted: 'Submitted',
    qa_review: 'QA Review',
    approved: 'Approved',
    completed: 'Completed',
    rejected: 'Changes Needed',
  };

  return (
    <span className={`status-badge ${normalized}`}>
      <span className="dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
      {labelMap[normalized] || status}
    </span>
  );
};

export default StatusBadge;
