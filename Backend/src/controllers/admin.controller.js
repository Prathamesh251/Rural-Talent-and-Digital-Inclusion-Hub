const { getPool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

async function getDashboardStats(req, res, next) {
  try {
    const pool = getPool();

    const [[{ totalTasks }]] = await pool.query('SELECT COUNT(*) as totalTasks FROM tasks');
    const [[{ activeTasks }]] = await pool.query(
      'SELECT COUNT(*) as activeTasks FROM tasks WHERE status IN ("ASSIGNED", "IN_PROGRESS", "SUBMITTED", "QA_REVIEW")'
    );
    const [[{ completedTasks }]] = await pool.query('SELECT COUNT(*) as completedTasks FROM tasks WHERE status = "COMPLETED"');
    const [[{ totalWorkers }]] = await pool.query('SELECT COUNT(*) as totalWorkers FROM users WHERE role = "WORKER"');
    const [[{ verifiedWorkers }]] = await pool.query(
      'SELECT COUNT(*) as verifiedWorkers FROM worker_profiles WHERE qualification_status = "VERIFIED"'
    );
    const [[{ totalEmployers }]] = await pool.query('SELECT COUNT(*) as totalEmployers FROM users WHERE role = "EMPLOYER"');
    const [[{ pendingQA }]] = await pool.query('SELECT COUNT(*) as pendingQA FROM submissions WHERE status = "SUBMITTED"');

    return res.json({
      success: true,
      data: {
        totalTasks,
        activeTasks,
        completedTasks,
        totalWorkers,
        verifiedWorkers,
        totalEmployers,
        pendingQA,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function listWorkers(req, res, next) {
  try {
    const pool = getPool();
    const [workers] = await pool.query(`
      SELECT u.id, u.email, u.full_name, u.phone, u.status, u.created_at,
             wp.qualification_status, wp.quality_score, wp.completed_tasks, wp.skills, wp.location
      FROM users u
      LEFT JOIN worker_profiles wp ON u.id = wp.user_id
      WHERE u.role = 'WORKER'
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    next(err);
  }
}

async function verifyWorker(req, res, next) {
  try {
    const workerId = req.params.id;
    const { status } = req.body; // 'VERIFIED' | 'REJECTED' | 'PENDING'

    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid qualification status' });
    }

    const pool = getPool();
    await pool.query('UPDATE worker_profiles SET qualification_status = ? WHERE user_id = ?', [status, workerId]);

    await logAudit({
      userId: req.user.id,
      action: 'WORKER_VERIFICATION_UPDATED',
      entityType: 'WORKER_PROFILE',
      entityId: workerId,
      details: { status },
      ip: req.ip,
    });

    return res.json({ success: true, message: `Worker verification status updated to ${status}` });
  } catch (err) {
    next(err);
  }
}

async function listEmployers(req, res, next) {
  try {
    const pool = getPool();
    const [employers] = await pool.query(`
      SELECT u.id, u.email, u.full_name, u.phone, u.status, u.created_at,
             ep.company_name, ep.industry, ep.is_verified
      FROM users u
      LEFT JOIN employer_profiles ep ON u.id = ep.user_id
      WHERE u.role = 'EMPLOYER'
      ORDER BY u.created_at DESC
    `);

    return res.json({ success: true, count: employers.length, data: employers });
  } catch (err) {
    next(err);
  }
}

async function verifyEmployer(req, res, next) {
  try {
    const employerId = req.params.id;
    const { isVerified } = req.body;

    const pool = getPool();
    await pool.query('UPDATE employer_profiles SET is_verified = ? WHERE user_id = ?', [Boolean(isVerified), employerId]);

    await logAudit({
      userId: req.user.id,
      action: 'EMPLOYER_VERIFICATION_UPDATED',
      entityType: 'EMPLOYER_PROFILE',
      entityId: employerId,
      details: { isVerified },
      ip: req.ip,
    });

    return res.json({ success: true, message: `Employer verification status updated` });
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const pool = getPool();
    const limit = parseInt(req.query.limit, 10) || 100;

    const [logs] = await pool.query(`
      SELECT al.*, u.full_name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ?
    `, [limit]);

    return res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardStats,
  listWorkers,
  verifyWorker,
  listEmployers,
  verifyEmployer,
  getAuditLogs,
};
