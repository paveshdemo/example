import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getPaymentReports, getAllPayments } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { FiBarChart2, FiDownload, FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import './AdminPaymentReports.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminPaymentReports = () => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({});
  const [verifiedPayments, setVerifiedPayments] = useState([]);
  const [allPayments, setAllPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReportData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, verifiedPayments]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [reportsRes, paymentsRes] = await Promise.all([
        getPaymentReports(),
        getAllPayments()
      ]);

      setReports(reportsRes.data);
      // Use verified payments from the reports endpoint for accurate calculations
      const verifiedData = reportsRes.data.data.payments || [];
      setVerifiedPayments(verifiedData);
      setFilteredPayments(verifiedData);
      // Keep all payments for reference and filtering purposes
      setAllPayments(paymentsRes.data.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = verifiedPayments;

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.customer?.name?.toLowerCase().includes(searchLower) ||
        p.property?.title?.toLowerCase().includes(searchLower) ||
        p.transactionReference?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredPayments(filtered);
  };

  const calculatePaymentByStatus = () => {
    const statusData = {
      verified: 0,
      pending: 0,
      rejected: 0
    };

    // Use all payments to show complete status distribution
    allPayments.forEach(p => {
      if (statusData.hasOwnProperty(p.status)) {
        statusData[p.status] += p.amount;
      }
    });

    return statusData;
  };

  if (loading) return <LoadingSpinner />;

  const paymentByStatus = calculatePaymentByStatus();

  const statusChartData = {
    labels: ['Verified', 'Pending', 'Rejected'],
    datasets: [{
      data: [paymentByStatus.verified, paymentByStatus.pending, paymentByStatus.rejected],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderColor: ['#047857', '#d97706', '#dc2626'],
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          font: { size: 12, weight: '600' },
          padding: 20,
          boxPadding: 10
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 12 },
        callbacks: {
          label: function (context) {
            return formatCurrency(context.parsed);
          }
        }
      }
    }
  };

  const verifiedAmount = paymentByStatus.verified;
  const pendingAmount = paymentByStatus.pending;
  const totalAmount = paymentByStatus.verified + paymentByStatus.pending + paymentByStatus.rejected;
  const verificationRate = verifiedPayments.length > 0 ? 100 : 0;

  return (
    <div className="payment-reports-container">
      <div className="page-header-section">
        <div className="header-content">
          <h1><FiBarChart2 /> Payment Reports</h1>
          <p>Comprehensive payment collection and verification analytics</p>
        </div>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <FiDownload /> Export Report
        </button>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-card primary">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(verifiedAmount)}</div>
            <div className="stat-label">Total Verified Payments</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><FiClock /></div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(pendingAmount)}</div>
            <div className="stat-label">Pending Verification</div>
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-icon"><FiCheckCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{verificationRate}%</div>
            <div className="stat-label">Verification Rate</div>
          </div>
        </div>

        <div className="stat-card secondary">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalAmount)}</div>
            <div className="stat-label">Total Collections</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Payment Status Distribution</h3>
          <div className="chart-wrapper">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
          <div className="chart-legend">
            <div className="legend-item verified">
              <span className="dot"></span>
              <span>Verified: {formatCurrency(paymentByStatus.verified)}</span>
            </div>
            <div className="legend-item pending">
              <span className="dot"></span>
              <span>Pending: {formatCurrency(paymentByStatus.pending)}</span>
            </div>
            <div className="legend-item rejected">
              <span className="dot"></span>
              <span>Rejected: {formatCurrency(paymentByStatus.rejected)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Detailed Table */}
      <div className="detailed-section">
        <div className="section-header">
          <h2>Payment Collection Details</h2>
          <div className="filter-group">
            <div className="filter-item search">
              <input
                type="text"
                placeholder="Search by customer, property, or transaction..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => {
                  setSearch('');
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="empty-state">
            <p>No payments found matching your criteria</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Property</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Plan Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.slice().reverse().map(payment => (
                  <tr key={payment._id} className={`status-${payment.status}`}>
                    <td>
                      <span className="customer-name">{payment.customer?.name || 'N/A'}</span>
                      <span className="customer-email">{payment.customer?.email}</span>
                    </td>
                    <td>{payment.property?.title || 'N/A'}</td>
                    <td className="amount-cell">
                      <strong>{formatCurrency(payment.amount)}</strong>
                    </td>
                    <td>
                      <span className="badge badge-method">{payment.paymentMethod}</span>
                    </td>
                    <td>
                      <span className={`badge ${payment.installmentOption === '3x' ? 'badge-installment' : 'badge-full'}`}>
                        {payment.installmentOption === '3x' ? `Term ${payment.installmentTerm}/3` : 'Full'}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="date-cell">
                      {formatDate(payment.createdAt)}
                    </td>
                    <td className="transaction-cell">
                      <code>{payment.transactionReference}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-info">
          Showing {filteredPayments.length} of {verifiedPayments.length} verified payments
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentReports;
