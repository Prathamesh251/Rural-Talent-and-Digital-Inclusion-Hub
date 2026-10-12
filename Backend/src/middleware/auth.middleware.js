const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'rural_talent_jwt_super_secret_key_2026_dev';

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const pool = getPool();

    const [rows] = await pool.query(
      'SELECT id, email, full_name, role, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, error: 'User not found or token invalid' });
    }

    const user = rows[0];
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: 'User account is not active' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: role '${req.user.role}' is not authorized to access this resource`
      });
    }
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
};
