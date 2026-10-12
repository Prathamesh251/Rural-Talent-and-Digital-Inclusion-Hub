const { getPool } = require('../config/db');
const { parseUploadedFile } = require('../utils/fileParser');
const { logAudit } = require('../utils/auditLogger');

// Valid state machine transitions
const VALID_TRANSITIONS = {
  DRAFT: ['READY', 'CANCELLED'],
  READY: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['SUBMITTED', 'CANCELLED'],
  SUBMITTED: ['QA_REVIEW', 'REWORK_REQUIRED'],
  QA_REVIEW: ['APPROVED', 'REWORK_REQUIRED'],
  REWORK_REQUIRED: ['IN_PROGRESS', 'CANCELLED'],
  APPROVED: ['DELIVERED', 'COMPLETED'],
  DELIVERED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  DISPUTED: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
};

async function createTask(req, res, next) {
  try {
    const { title, description, instructions, budget, deadline, status = 'DRAFT' } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, error: 'Task title is required' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO tasks (employer_id, title, description, instructions, budget, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        title.trim(),
        description || '',
        instructions || '',
        budget || 0.00,
        deadline || null,
        status === 'READY' ? 'READY' : 'DRAFT',
      ]
    );

    const taskId = result.insertId;

    await logAudit({
      userId: req.user.id,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: taskId,
      details: { title, status },
      ip: req.ip,
    });

    const [rows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: rows[0],
    });
  } catch (err) {
    next(err);
  }
}

async function uploadTaskFile(req, res, next) {
  try {
    const taskId = req.params.id;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const pool = getPool();

    // Verify task ownership or admin
    const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (taskRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const task = taskRows[0];
    if (req.user.role === 'EMPLOYER' && task.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied: not your task' });
    }

    // Parse file records
    let parsedRows = [];
    try {
      parsedRows = await parseUploadedFile(req.file.path, req.file.mimetype, req.file.originalname);
    } catch (parseErr) {
      return res.status(400).json({ success: false, error: `File parsing error: ${parseErr.message}` });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Record task file
      const [fileResult] = await connection.query(
        `INSERT INTO task_files (task_id, uploaded_by, file_path, original_filename, mime_type, size_bytes)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [taskId, req.user.id, req.file.path, req.file.originalname, req.file.mimetype, req.file.size]
      );

      // Insert parsed task_records
      if (parsedRows.length > 0) {
        const recordValues = parsedRows.map((row, idx) => [
          taskId,
          idx + 1,
          JSON.stringify(row),
          null,
          'PENDING',
        ]);

        await connection.query(
          `INSERT INTO task_records (task_id, record_index, original_data, edited_data, status)
           VALUES ?`,
          [recordValues]
        );

        // Update task total records count
        await connection.query(
          `UPDATE tasks SET total_records = total_records + ? WHERE id = ?`,
          [parsedRows.length, taskId]
        );
      }

      await connection.commit();

      await logAudit({
        userId: req.user.id,
        action: 'FILE_UPLOADED',
        entityType: 'TASK',
        entityId: taskId,
        details: { filename: req.file.originalname, recordCount: parsedRows.length },
        ip: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'File processed and records imported successfully',
        data: {
          fileId: fileResult.insertId,
          filename: req.file.originalname,
          totalRecords: parsedRows.length,
          preview: parsedRows.slice(0, 5),
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

async function getTasks(req, res, next) {
  try {
    const pool = getPool();
    const { status } = req.query;

    let query = `
      SELECT t.*, u.full_name as employer_name, u.email as employer_email
      FROM tasks t
      JOIN users u ON t.employer_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (req.user.role === 'EMPLOYER') {
      conditions.push('t.employer_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'WORKER') {
      // Workers only see tasks assigned to them, or READY/ASSIGNED tasks
      query = `
        SELECT DISTINCT t.*, u.full_name as employer_name, a.id as assignment_id, a.status as assignment_status
        FROM tasks t
        JOIN users u ON t.employer_id = u.id
        LEFT JOIN assignments a ON a.task_id = t.id AND a.worker_id = ?
      `;
      conditions.push('a.worker_id = ?');
      params.push(req.user.id, req.user.id);
    }

    if (status) {
      conditions.push('t.status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

async function getTaskById(req, res, next) {
  try {
    const taskId = req.params.id;
    const pool = getPool();

    const [taskRows] = await pool.query(
      `SELECT t.*, u.full_name as employer_name, u.email as employer_email
       FROM tasks t
       JOIN users u ON t.employer_id = u.id
       WHERE t.id = ?`,
      [taskId]
    );

    if (taskRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const task = taskRows[0];

    // Check permissions
    if (req.user.role === 'EMPLOYER' && task.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get files
    const [files] = await pool.query('SELECT * FROM task_files WHERE task_id = ?', [taskId]);

    // Get assignments
    const [assignments] = await pool.query(
      `SELECT a.*, w.full_name as worker_name, w.email as worker_email
       FROM assignments a
       JOIN users w ON a.worker_id = w.id
       WHERE a.task_id = ?`,
      [taskId]
    );

    return res.json({
      success: true,
      data: {
        ...task,
        files,
        assignments,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function updateTask(req, res, next) {
  try {
    const taskId = req.params.id;
    const { title, description, instructions, budget, deadline, status } = req.body;
    const pool = getPool();

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const task = existing[0];
    if (req.user.role === 'EMPLOYER' && task.employer_id !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Status transition validation
    if (status && status !== task.status) {
      if (req.user.role !== 'ADMIN') {
        const allowed = VALID_TRANSITIONS[task.status] || [];
        if (!allowed.includes(status)) {
          return res.status(400).json({
            success: false,
            error: `Invalid status transition from '${task.status}' to '${status}'. Allowed: ${allowed.join(', ')}`,
          });
        }
      }
    }

    await pool.query(
      `UPDATE tasks
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           instructions = COALESCE(?, instructions),
           budget = COALESCE(?, budget),
           deadline = COALESCE(?, deadline),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [title, description, instructions, budget, deadline, status, taskId]
    );

    await logAudit({
      userId: req.user.id,
      action: 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: taskId,
      details: { updatedFields: req.body },
      ip: req.ip,
    });

    const [updated] = await pool.query('SELECT * FROM tasks WHERE id = ?', [taskId]);
    return res.json({ success: true, message: 'Task updated successfully', data: updated[0] });
  } catch (err) {
    next(err);
  }
}

async function getTaskRecords(req, res, next) {
  try {
    const taskId = req.params.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;

    const pool = getPool();
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM task_records WHERE task_id = ?', [taskId]);
    const totalRecords = countResult[0].total;

    const [records] = await pool.query(
      `SELECT * FROM task_records WHERE task_id = ? ORDER BY record_index ASC LIMIT ? OFFSET ?`,
      [taskId, limit, offset]
    );

    return res.json({
      success: true,
      page,
      limit,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      data: records,
    });
  } catch (err) {
    next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const recordId = req.params.recordId;
    const { editedData, status = 'COMPLETED' } = req.body;

    const pool = getPool();
    const [records] = await pool.query('SELECT * FROM task_records WHERE id = ?', [recordId]);
    if (records.length === 0) {
      return res.status(404).json({ success: false, error: 'Record not found' });
    }

    const record = records[0];

    await pool.query(
      `UPDATE task_records
       SET edited_data = ?, status = ?
       WHERE id = ?`,
      [JSON.stringify(editedData), status, recordId]
    );

    // Update completed count in task
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as completedCount FROM task_records WHERE task_id = ? AND status = 'COMPLETED'`,
      [record.task_id]
    );
    const completed = countResult[0].completedCount;

    await pool.query('UPDATE tasks SET completed_records = ? WHERE id = ?', [completed, record.task_id]);

    return res.json({
      success: true,
      message: 'Record saved',
      data: {
        id: recordId,
        taskId: record.task_id,
        status,
        editedData,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createTask,
  uploadTaskFile,
  getTasks,
  getTaskById,
  updateTask,
  getTaskRecords,
  updateRecord,
};
