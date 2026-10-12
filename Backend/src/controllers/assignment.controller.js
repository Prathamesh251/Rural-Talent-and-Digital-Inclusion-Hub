const { getPool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

async function assignWorker(req, res, next) {
  try {
    const { taskId, workerId, assignedRecordsCount } = req.body;

    if (!taskId || !workerId) {
      return res.status(400).json({ success: false, error: 'taskId and workerId are required' });
    }

    const pool = getPool();

    // Verify task exists and is READY or ASSIGNED
    const [tasks] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    // Verify worker exists and has WORKER role
    const [workers] = await pool.query('SELECT * FROM users WHERE id = ? AND role = "WORKER"', [workerId]);
    if (workers.length === 0) {
      return res.status(400).json({ success: false, error: 'Target user is not a valid worker' });
    }

    // Prevent duplicate active assignment
    const [existingAssignment] = await pool.query(
      'SELECT id FROM assignments WHERE task_id = ? AND worker_id = ?',
      [taskId, workerId]
    );
    if (existingAssignment.length > 0) {
      return res.status(409).json({ success: false, error: 'Worker is already assigned to this task' });
    }

    const task = tasks[0];
    const recordsCount = assignedRecordsCount || task.total_records || 0;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [assignResult] = await connection.query(
        `INSERT INTO assignments (task_id, worker_id, assigned_by, status, assigned_records_count)
         VALUES (?, ?, ?, 'ASSIGNED', ?)`,
        [taskId, workerId, req.user.id, recordsCount]
      );

      // Update task status to ASSIGNED if currently READY or DRAFT
      if (['DRAFT', 'READY'].includes(task.status)) {
        await connection.query('UPDATE tasks SET status = "ASSIGNED" WHERE id = ?', [taskId]);
      }

      await connection.commit();

      const assignmentId = assignResult.insertId;

      await logAudit({
        userId: req.user.id,
        action: 'WORKER_ASSIGNED',
        entityType: 'ASSIGNMENT',
        entityId: assignmentId,
        details: { taskId, workerId, recordsCount },
        ip: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Worker assigned successfully',
        data: {
          assignmentId,
          taskId,
          workerId,
          status: 'ASSIGNED',
        },
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
}

async function getAssignments(req, res, next) {
  try {
    const pool = getPool();

    let query = `
      SELECT a.*, 
             t.title as task_title, t.description as task_description, t.instructions as task_instructions,
             t.deadline as task_deadline, t.budget as task_budget, t.total_records as task_total_records,
             w.full_name as worker_name, w.email as worker_email,
             e.full_name as employer_name
      FROM assignments a
      JOIN tasks t ON a.task_id = t.id
      JOIN users w ON a.worker_id = w.id
      JOIN users e ON t.employer_id = e.id
    `;
    const params = [];

    if (req.user.role === 'WORKER') {
      query += ' WHERE a.worker_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'EMPLOYER') {
      query += ' WHERE t.employer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY a.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

async function getAssignmentById(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT a.*, 
              t.title as task_title, t.description as task_description, t.instructions as task_instructions,
              t.deadline as task_deadline, t.budget as task_budget, t.status as task_status,
              w.full_name as worker_name, w.email as worker_email
       FROM assignments a
       JOIN tasks t ON a.task_id = t.id
       JOIN users w ON a.worker_id = w.id
       WHERE a.id = ?`,
      [assignmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const assignment = rows[0];

    // Access check
    if (req.user.role === 'WORKER' && assignment.worker_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get submissions for this assignment
    const [submissions] = await pool.query(
      `SELECT s.*, q.accuracy_percentage, q.status as qa_status, q.feedback as qa_feedback
       FROM submissions s
       LEFT JOIN qa_reviews q ON q.submission_id = s.id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [assignmentId]
    );

    return res.json({
      success: true,
      data: {
        ...assignment,
        submissions,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function startAssignment(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [assignmentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const assignment = rows[0];
    if (assignment.worker_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await pool.query('UPDATE assignments SET status = "IN_PROGRESS" WHERE id = ?', [assignmentId]);
    await pool.query('UPDATE tasks SET status = "IN_PROGRESS" WHERE id = ?', [assignment.task_id]);

    await logAudit({
      userId: req.user.id,
      action: 'ASSIGNMENT_STARTED',
      entityType: 'ASSIGNMENT',
      entityId: assignmentId,
      details: { taskId: assignment.task_id },
      ip: req.ip,
    });

    return res.json({ success: true, message: 'Assignment started and in progress' });
  } catch (err) {
    next(err);
  }
}

async function submitAssignment(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const { notes } = req.body;
    const pool = getPool();

    const [rows] = await pool.query('SELECT * FROM assignments WHERE id = ?', [assignmentId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Assignment not found' });
    }

    const assignment = rows[0];
    if (assignment.worker_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insert into submissions table
      const [submissionResult] = await connection.query(
        `INSERT INTO submissions (assignment_id, worker_id, notes, status)
         VALUES (?, ?, ?, 'SUBMITTED')`,
        [assignmentId, assignment.worker_id, notes || '']
      );

      // Update assignment and task status to SUBMITTED
      await connection.query('UPDATE assignments SET status = "SUBMITTED" WHERE id = ?', [assignmentId]);
      await connection.query('UPDATE tasks SET status = "SUBMITTED" WHERE id = ?', [assignment.task_id]);

      await connection.commit();

      const submissionId = submissionResult.insertId;

      await logAudit({
        userId: req.user.id,
        action: 'SUBMISSION_CREATED',
        entityType: 'SUBMISSION',
        entityId: submissionId,
        details: { assignmentId, notes },
        ip: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Work submitted successfully for QA review',
        data: {
          submissionId,
          assignmentId,
          status: 'SUBMITTED',
        },
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  assignWorker,
  getAssignments,
  getAssignmentById,
  startAssignment,
  submitAssignment,
};
