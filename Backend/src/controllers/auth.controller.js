const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

const JWT_SECRET = process.env.JWT_SECRET || 'rural_talent_jwt_super_secret_key_2026_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function register(req, res, next) {
  try {
    const { email, password, fullName, role, phone, companyName, industry, skills, location } = req.body;

    if (!email || !password || !fullName || !role) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: email, password, fullName, and role are required',
      });
    }

    const validRoles = ['EMPLOYER', 'WORKER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
      });
    }

    const pool = getPool();

    // Check existing email
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert User
      const [userResult] = await connection.query(
        `INSERT INTO users (email, password_hash, full_name, phone, role, status)
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [email.toLowerCase().trim(), passwordHash, fullName.trim(), phone || null, role]
      );
      const userId = userResult.insertId;

      // Create role profile
      if (role === 'EMPLOYER') {
        await connection.query(
          `INSERT INTO employer_profiles (user_id, company_name, industry)
           VALUES (?, ?, ?)`,
          [userId, companyName || `${fullName}'s Company`, industry || 'General']
        );
      } else if (role === 'WORKER') {
        await connection.query(
          `INSERT INTO worker_profiles (user_id, skills, location)
           VALUES (?, ?, ?)`,
          [userId, JSON.stringify(skills || []), location || '']
        );
      }

      await connection.commit();

      const token = jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

      await logAudit({
        userId,
        action: 'USER_REGISTERED',
        entityType: 'USER',
        entityId: userId,
        details: { email, role },
        ip: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: {
          token,
          user: {
            id: userId,
            email: email.toLowerCase().trim(),
            fullName: fullName.trim(),
            role,
          },
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

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const pool = getPool();
    const [users] = await pool.query(
      `SELECT id, email, password_hash, full_name, role, status, phone FROM users WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, error: 'Account is suspended or inactive' });
    }

    let profile = null;
    if (user.role === 'EMPLOYER') {
      const [emp] = await pool.query('SELECT * FROM employer_profiles WHERE user_id = ?', [user.id]);
      profile = emp[0] || null;
    } else if (user.role === 'WORKER') {
      const [wrk] = await pool.query('SELECT * FROM worker_profiles WHERE user_id = ?', [user.id]);
      profile = wrk[0] || null;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    await logAudit({
      userId: user.id,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      details: { role: user.role },
      ip: req.ip,
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          phone: user.phone,
          profile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const pool = getPool();
    let profile = null;

    if (req.user.role === 'EMPLOYER') {
      const [emp] = await pool.query('SELECT * FROM employer_profiles WHERE user_id = ?', [req.user.id]);
      profile = emp[0] || null;
    } else if (req.user.role === 'WORKER') {
      const [wrk] = await pool.query('SELECT * FROM worker_profiles WHERE user_id = ?', [req.user.id]);
      profile = wrk[0] || null;
    }

    return res.json({
      success: true,
      data: {
        user: {
          ...req.user,
          profile,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
};
