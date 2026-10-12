const { getPool } = require('../config/db');
const { logAudit } = require('../utils/auditLogger');

async function reviewSubmission(req, res, next) {
  try {
    const submissionId = req.params.submissionId;
    const { sampleSize, correctRecords, incorrectRecords, errorCategories, feedback, decision } = req.body;

    if (!sampleSize || correctRecords === undefined || !decision) {
      return res.status(400).json({
        success: false,
        error: 'sampleSize, correctRecords, and decision ("PASS" | "FAIL") are required',
      });
    }

    const accuracy = Number(((correctRecords / sampleSize) * 100).toFixed(2));
    const isPass = decision.toUpperCase() === 'PASS';

    const pool = getPool();
    const [submissions] = await pool.query(
      `SELECT s.*, a.task_id, a.worker_id
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({ success: false, error: 'Submission not found' });
    }

    const submission = submissions[0];
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Insert QA review
      const [qaResult] = await connection.query(
        `INSERT INTO qa_reviews (
          submission_id, reviewer_id, sample_size, correct_records, incorrect_records,
          accuracy_percentage, error_categories, feedback, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          submissionId,
          req.user.id,
          sampleSize,
          correctRecords,
          incorrectRecords || (sampleSize - correctRecords),
          accuracy,
          JSON.stringify(errorCategories || []),
          feedback || '',
          isPass ? 'PASS' : 'FAIL',
        ]
      );

      const newStatus = isPass ? 'APPROVED' : 'REWORK_REQUIRED';

      // Update submission status
      await connection.query('UPDATE submissions SET status = ? WHERE id = ?', [newStatus, submissionId]);

      // Update assignment status
      await connection.query('UPDATE assignments SET status = ? WHERE id = ?', [newStatus, submission.assignment_id]);

      // Update task status
      await connection.query('UPDATE tasks SET status = ? WHERE id = ?', [newStatus, submission.task_id]);

      // If PASS, update worker statistics in worker_profiles
      if (isPass) {
        await connection.query(
          `UPDATE worker_profiles
           SET completed_tasks = completed_tasks + 1,
               quality_score = (quality_score + ?) / 2
           WHERE user_id = ?`,
          [accuracy, submission.worker_id]
        );
      }

      await connection.commit();

      const qaId = qaResult.insertId;

      await logAudit({
        userId: req.user.id,
        action: isPass ? 'TASK_APPROVED' : 'REWORK_REQUESTED',
        entityType: 'QA_REVIEW',
        entityId: qaId,
        details: { submissionId, decision, accuracy },
        ip: req.ip,
      });

      return res.status(201).json({
        success: true,
        message: `QA Review completed with decision: ${decision}`,
        data: {
          qaReviewId: qaId,
          submissionId,
          accuracy,
          decision,
          status: newStatus,
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

async function getQAReviews(req, res, next) {
  try {
    const pool = getPool();
    const [rows] = await pool.query(`
      SELECT q.*, s.assignment_id, s.worker_id, u.full_name as reviewer_name, w.full_name as worker_name, t.title as task_title
      FROM qa_reviews q
      JOIN submissions s ON q.submission_id = s.id
      JOIN assignments a ON s.assignment_id = a.id
      JOIN tasks t ON a.task_id = t.id
      JOIN users u ON q.reviewer_id = u.id
      JOIN users w ON s.worker_id = w.id
      ORDER BY q.created_at DESC
    `);

    return res.json({ success: true, count: rows.length, data: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  reviewSubmission,
  getQAReviews,
};
