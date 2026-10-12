const { getPool } = require('../config/db');

async function logAudit({ userId = null, action, entityType, entityId = null, details = {}, ip = null }) {
  try {
    const pool = getPool();
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify(details),
        ip,
      ]
    );
  } catch (err) {
    console.error('[AUDIT LOG ERROR]', err.message);
  }
}

module.exports = {
  logAudit,
};
