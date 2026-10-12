const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

let pool = null;

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'rural_talent',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function initDatabase() {
  try {
    // 1. Connect without selecting database to ensure DB exists
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.end();

    // 2. Initialize connection pool
    pool = mysql.createPool(dbConfig);

    // 3. Create tables if not exists
    await createTables();

    console.log(`[DB] Successfully connected to MySQL database: ${dbConfig.database}`);
    return pool;
  } catch (error) {
    console.error('[DB] Failed to connect or initialize MySQL:', error.message);
    throw error;
  }
}

async function createTables() {
  // 1. Users Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      role ENUM('EMPLOYER', 'WORKER', 'ADMIN') NOT NULL,
      status ENUM('ACTIVE', 'PENDING', 'SUSPENDED') DEFAULT 'ACTIVE',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_role (role),
      INDEX idx_email (email)
    ) ENGINE=InnoDB;
  `);

  // 2. Worker Profiles Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS worker_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      qualification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
      quality_score DECIMAL(5, 2) DEFAULT 100.00,
      completed_tasks INT DEFAULT 0,
      skills JSON,
      location VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 3. Employer Profiles Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS employer_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      company_name VARCHAR(255) NOT NULL,
      industry VARCHAR(255),
      is_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `);

  // 4. Tasks Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      employer_id INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      instructions TEXT,
      status ENUM(
        'DRAFT',
        'READY',
        'ASSIGNED',
        'IN_PROGRESS',
        'SUBMITTED',
        'QA_REVIEW',
        'REWORK_REQUIRED',
        'APPROVED',
        'DELIVERED',
        'COMPLETED',
        'CANCELLED',
        'DISPUTED'
      ) DEFAULT 'DRAFT',
      budget DECIMAL(10, 2) DEFAULT 0.00,
      deadline DATE,
      total_records INT DEFAULT 0,
      completed_records INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE RESTRICT,
      INDEX idx_status (status)
    ) ENGINE=InnoDB;
  `);

  // 5. Task Files Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS task_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      uploaded_by INT NOT NULL,
      file_path VARCHAR(500) NOT NULL,
      original_filename VARCHAR(255) NOT NULL,
      mime_type VARCHAR(100),
      size_bytes BIGINT,
      checksum VARCHAR(100),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB;
  `);

  // 6. Task Records Table (Rows parsed from CSV/XLSX for data-entry/data-verification)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS task_records (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      record_index INT NOT NULL,
      original_data JSON NOT NULL,
      edited_data JSON,
      status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FLAGGED') DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      INDEX idx_task_record (task_id, record_index)
    ) ENGINE=InnoDB;
  `);

  // 7. Assignments Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS assignments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      worker_id INT NOT NULL,
      assigned_by INT NOT NULL,
      status ENUM('ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REWORK_REQUIRED', 'APPROVED') DEFAULT 'ASSIGNED',
      assigned_records_count INT DEFAULT 0,
      completed_records_count INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE RESTRICT,
      INDEX idx_worker_status (worker_id, status)
    ) ENGINE=InnoDB;
  `);

  // 8. Submissions Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      assignment_id INT NOT NULL,
      worker_id INT NOT NULL,
      notes TEXT,
      status ENUM('SUBMITTED', 'QA_REVIEW', 'REWORK_REQUIRED', 'APPROVED') DEFAULT 'SUBMITTED',
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
      FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB;
  `);

  // 9. QA Reviews Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS qa_reviews (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submission_id INT NOT NULL,
      reviewer_id INT NOT NULL,
      sample_size INT NOT NULL,
      correct_records INT NOT NULL,
      incorrect_records INT NOT NULL,
      accuracy_percentage DECIMAL(5, 2) NOT NULL,
      error_categories JSON,
      feedback TEXT,
      status ENUM('PASS', 'FAIL') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB;
  `);

  // 10. Payments Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      task_id INT NOT NULL,
      employer_id INT NOT NULL,
      amount DECIMAL(10, 2) NOT NULL,
      status ENUM('PENDING', 'PAID', 'REFUNDED') DEFAULT 'PENDING',
      payment_date TIMESTAMP NULL,
      payment_reference VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB;
  `);

  // 11. Audit Logs Table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id INT NULL,
      details JSON,
      ip_address VARCHAR(45),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_action (action),
      INDEX idx_entity (entity_type, entity_id)
    ) ENGINE=InnoDB;
  `);

  console.log('[DB] Database tables verified and ready.');
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

module.exports = {
  initDatabase,
  getPool,
};
