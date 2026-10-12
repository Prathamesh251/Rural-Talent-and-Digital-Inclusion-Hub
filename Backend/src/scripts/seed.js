const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const { initDatabase, getPool } = require('../config/db');

async function seed() {
  console.log('[SEED] Starting database seeding...');
  await initDatabase();
  const pool = getPool();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Admin
  const [adminExists] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@ruraltalent.com']);
  if (adminExists.length === 0) {
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES ('admin@ruraltalent.com', ?, 'System Administrator', '+91 9876543210', 'ADMIN', 'ACTIVE')`,
      [passwordHash]
    );
    console.log('[SEED] Created Admin: admin@ruraltalent.com / password123');
  }

  // 2. Seed Employer
  let employerId;
  const [empExists] = await pool.query('SELECT id FROM users WHERE email = ?', ['employer@demo.com']);
  if (empExists.length === 0) {
    const [empUser] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES ('employer@demo.com', ?, 'Acme Retail Corp', '+91 9876543211', 'EMPLOYER', 'ACTIVE')`,
      [passwordHash]
    );
    employerId = empUser.insertId;
    await pool.query(
      `INSERT INTO employer_profiles (user_id, company_name, industry, is_verified)
       VALUES (?, 'Acme Retail Corp', 'E-Commerce & Retail', true)`,
      [employerId]
    );
    console.log('[SEED] Created Employer: employer@demo.com / password123');
  } else {
    employerId = empExists[0].id;
  }

  // 3. Seed Worker
  const [wrkExists] = await pool.query('SELECT id FROM users WHERE email = ?', ['worker@demo.com']);
  if (wrkExists.length === 0) {
    const [wrkUser] = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES ('worker@demo.com', ?, 'Sunil Sharma', '+91 9876543212', 'WORKER', 'ACTIVE')`,
      [passwordHash]
    );
    const workerId = wrkUser.insertId;
    await pool.query(
      `INSERT INTO worker_profiles (user_id, qualification_status, quality_score, completed_tasks, skills, location)
       VALUES (?, 'VERIFIED', 98.50, 12, ?, 'Nashik, Maharashtra')`,
      [workerId, JSON.stringify(['Data Verification', 'Catalog Cleanup', 'Excel/Sheets'])]
    );
    console.log('[SEED] Created Worker: worker@demo.com / password123');
  }

  // 4. Seed a Sample Demo Task
  const [taskExists] = await pool.query('SELECT id FROM tasks WHERE title = ?', ['Product Catalog Data Cleanup']);
  if (taskExists.length === 0 && employerId) {
    const [taskResult] = await pool.query(
      `INSERT INTO tasks (employer_id, title, description, instructions, status, budget, deadline, total_records, completed_records)
       VALUES (?, 'Product Catalog Data Cleanup', 'Standardize product names, brand tags, and categories',
       '1. Fix typo in Product Name\\n2. Assign standardized Category\\n3. Verify SKU integrity\\n4. Do not delete original ID',
       'READY', 4500.00, DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY), 3, 0)`,
      [employerId]
    );
    const taskId = taskResult.insertId;

    // Seed 3 sample records
    const sampleRecords = [
      { id: 101, raw_title: 'Sammsung Glaxy M14 5G 128gb Dark Blew', price: '12499', category: 'smartphones' },
      { id: 102, raw_title: 'Appel Iphne 15 128GB Black', price: '69999', category: 'mobiles' },
      { id: 103, raw_title: 'Sony Bravia 55 inch 4k Oled Ultra Hd TV', price: '114999', category: 'televisions' }
    ];

    for (let i = 0; i < sampleRecords.length; i++) {
      await pool.query(
        `INSERT INTO task_records (task_id, record_index, original_data, status)
         VALUES (?, ?, ?, 'PENDING')`,
        [taskId, i + 1, JSON.stringify(sampleRecords[i])]
      );
    }
    console.log('[SEED] Created Sample Task with 3 records.');
  }

  console.log('[SEED] Seeding completed successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});
