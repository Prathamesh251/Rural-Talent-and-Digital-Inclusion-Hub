import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import StatusBadge from '../../components/common/StatusBadge';
import { paymentService } from '../../services/paymentService';
import { CreditCard, ArrowDownRight, DollarSign, AlertCircle } from 'lucide-react';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await paymentService.getPayments();
        if (res.success) {
          setPayments(res.data || []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const totalDisbursed = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return (
    <>
      <Navbar 
        title="Escrow & Payments Ledger" 
        subtitle="Transparent settlement records, task payouts & operational compensation" 
      />
      <div className="page-container">
        {/* Metric Cards */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <div className="stat-value">₹{totalDisbursed.toLocaleString('en-IN')}</div>
              <div className="stat-label">Total Volume Settled</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <div className="stat-value">{payments.length}</div>
              <div className="stat-label">Settled Transactions</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="auth-alert error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="data-table-container">
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading payment records...
            </div>
          ) : payments.length === 0 ? (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No settled transactions recorded yet.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction Reference</th>
                  <th>Task</th>
                  <th>Recipient / Worker</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Settled Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: '#fff' }}>
                        TXN-{p.id.toString().padStart(6, '0')}
                      </span>
                    </td>
                    <td>{p.task_title || `Task #${p.task_id}`}</td>
                    <td>{p.worker_name || 'Worker'}</td>
                    <td>
                      <strong style={{ color: '#10b981' }}>₹{Number(p.amount).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className="status-badge ready">{p.payment_method || 'UPI / Bank Transfer'}</span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentsPage;
