const { getPool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

async function recordPayment(req, res, next) {
  try {
    const { taskId, amount, status = 'PAID', paymentReference, notes } = req.body;

    if (!taskId || !amount) {
      return res.status(400).json({ success: false, error: 'taskId and amount are required' });
    }

    const pool = getPool();
    const [tasks] = await pool.query('SELECT employer_id FROM tasks WHERE id = ?', [taskId]);
    if (tasks.length === 0) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    const employerId = tasks[0].employer_id;

    const [result] = await pool.query(
      `INSERT INTO payments (task_id, employer_id, amount, status, payment_date, payment_reference, notes)
       VALUES (?, ?, ?, ?, NOW(), ?, ?)`,
      [taskId, employerId, amount, status, paymentReference || null, notes || '']
    );

    const paymentId = result.insertId;

    await logAudit({
      userId: req.user.id,
      action: 'PAYMENT_RECORDED',
      entityType: 'PAYMENT',
      entityId: paymentId,
      details: { taskId, amount, status, paymentReference },
      ip: req.ip,
    });

    return res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        paymentId,
        taskId,
        amount,
        status,
        paymentReference,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getPayments(req, res, next) {
  try {
    const pool = getPool();
    let query = `
      SELECT p.*, t.title as task_title, u.full_name as employer_name, u.email as employer_email
      FROM payments p
      JOIN tasks t ON p.task_id = t.id
      JOIN users u ON p.employer_id = u.id
    `;
    const params = [];

    if (req.user.role === 'EMPLOYER') {
      query += ' WHERE p.employer_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.query(query, params);
    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recordPayment,
  getPayments,
};
