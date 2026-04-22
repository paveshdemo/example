import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title } from 'chart.js';
import { getAdminProperties, getPaymentReports } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { FiTrendingUp, FiDollarSign, FiHome, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './SalesAnalytics.css';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend, Title);

const SalesAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesRes, paymentsRes] = await Promise.all([
        getAdminProperties(),
        getPaymentReports()
      ]);

      console.log('Properties Response:', propertiesRes.data);
      console.log('Complete Response Data:', propertiesRes.data.data);
      console.log('Payments Response:', paymentsRes.data);

      const propertiesData = Array.isArray(propertiesRes.data.data) 
        ? propertiesRes.data.data 
        : [];
      const paymentsData = paymentsRes.data?.data?.payments || [];

      console.log('Number of properties fetched:', propertiesData.length);
      console.log('Properties with owner:', propertiesData.filter(p => p.owner).length);
      console.log('Properties with totalPaid:', propertiesData.filter(p => p.totalPaid > 0).length);
      console.log('Processed Properties:', propertiesData);
      console.log('Processed Payments:', paymentsData);

      setProperties(propertiesData);
      setPayments(paymentsData);
    } catch (err) {
      console.error('Error fetching sales data:', err);
      alert('Error fetching sales data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSoldProperties = () => {
    const sold = properties.filter(p => {
      const ownerExists = !!p.owner;
      const isPaid = p.totalPaid >= p.price;
      const qualifies = ownerExists && isPaid;
      
      if (qualifies) {
        console.log(`✓ Sold Property: ${p.title} - Paid: ${p.totalPaid}/${p.price}`);
      }
      return qualifies;
    });
    console.log(`Total Sold Properties: ${sold.length}/${properties.length}`);
    return sold;
  };

  const getPendingPaymentProperties = () => {
    const pending = properties.filter(p => {
      const ownerExists = !!p.owner;
      const isPartialPaid = p.totalPaid > 0 && p.totalPaid < p.price;
      const qualifies = ownerExists && isPartialPaid;
      
      if (qualifies) {
        console.log(`✓ Pending Property: ${p.title} - Paid: ${p.totalPaid}/${p.price}`);
      }
      return qualifies;
    });
    console.log(`Total Pending Properties: ${pending.length}/${properties.length}`);
    return pending;
  };

  const getTotalEarnings = () => {
    const earned = properties.reduce((sum, p) => {
      if (p.owner && p.totalPaid > 0) {
        return sum + p.totalPaid;
      }
      return sum;
    }, 0);
    console.log('Total Earnings:', earned);
    return earned;
  };

  const getTotalPending = () => {
    const toCollect = getPendingPaymentProperties().reduce((sum, p) => {
      const remaining = p.price - p.totalPaid;
      return sum + remaining;
    }, 0);
    console.log('Total Pending:', toCollect);
    return toCollect;
  };

  const getPropertyDetails = (propertyId) => {
    return properties.find(p => p._id === propertyId);
  };

  const getPropertyPayments = (propertyId) => {
    return payments.filter(p => p.property?._id === propertyId);
  };

  const soldProperties = getSoldProperties();
  const pendingProperties = getPendingPaymentProperties();
  const totalEarnings = getTotalEarnings();
  const totalPending = getTotalPending();

  const filteredSoldProperties = soldProperties.filter(p =>
    !search || 
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  // Chart Data
  const statusChartData = {
    labels: ['Completed Sales', 'Pending Payments'],
    datasets: [{
      data: [soldProperties.length, pendingProperties.length],
      backgroundColor: ['#10b981', '#f59e0b'],
      borderColor: ['#047857', '#d97706'],
      borderWidth: 2
    }]
  };

  const earningsChartData = {
    labels: ['Earnings Received', 'Pending Collection'],
    datasets: [{
      data: [totalEarnings, totalPending],
      backgroundColor: ['#3b82f6', '#ef4444'],
      borderColor: ['#1e40af', '#b91c1c'],
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
            if (context.label.includes('Sales') || context.label.includes('Completed')) {
              return context.parsed + ' properties';
            }
            return formatCurrency(context.parsed);
          }
        }
      }
    }
  };

  return (
    <div className="sales-analytics-container">
      {/* Debug Info */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #3b82f6',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '12px',
        color: '#1e40af'
      }}>
        <strong>Debug Info:</strong> Total Properties: {properties.length} | 
        With Owner: {properties.filter(p => p.owner).length} | 
        With Payment: {properties.filter(p => p.totalPaid > 0).length}
        <br />
        Sold: {getSoldProperties().length} | Pending: {getPendingPaymentProperties().length}
      </div>

      <div className="page-header-section">
        <div className="header-content">
          <h1><FiTrendingUp /> Sales Analytics</h1>
          <p>Complete sales performance and revenue overview</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-card primary">
          <div className="stat-icon"><FiHome /></div>
          <div className="stat-content">
            <div className="stat-value">{soldProperties.length}</div>
            <div className="stat-label">Properties Sold</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon"><FiDollarSign /></div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalEarnings)}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon"><FiClock /></div>
          <div className="stat-content">
            <div className="stat-value">{pendingProperties.length}</div>
            <div className="stat-label">Pending Payments</div>
          </div>
        </div>

        <div className="stat-card danger">
          <div className="stat-icon"><FiAlertCircle /></div>
          <div className="stat-content">
            <div className="stat-value">{formatCurrency(totalPending)}</div>
            <div className="stat-label">To Be Collected</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Sales Status</h3>
          <div className="chart-wrapper">
            <Pie data={statusChartData} options={chartOptions} />
          </div>
          <div className="chart-legend">
            <div className="legend-item completed">
              <span className="dot"></span>
              <span>Completed: {soldProperties.length} properties</span>
            </div>
            <div className="legend-item pending">
              <span className="dot"></span>
              <span>Pending: {pendingProperties.length} properties</span>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Revenue Status</h3>
          <div className="chart-wrapper">
            <Pie data={earningsChartData} options={chartOptions} />
          </div>
          <div className="chart-legend">
            <div className="legend-item received">
              <span className="dot"></span>
              <span>Received: {formatCurrency(totalEarnings)}</span>
            </div>
            <div className="legend-item tobecollected">
              <span className="dot"></span>
              <span>Pending: {formatCurrency(totalPending)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Sales Section */}
      <div className="detailed-section">
        <div className="section-header">
          <h2><FiCheckCircle /> Completed Sales</h2>
          <div className="filter-group">
            <div className="filter-item search">
              <input
                type="text"
                placeholder="Search by property, buyer, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <button
                className="btn btn-sm btn-outline"
                onClick={() => setSearch('')}
              >
                Clear Search
              </button>
            )}
          </div>
        </div>

        {filteredSoldProperties.length === 0 ? (
          <div className="empty-state">
            <p>No completed sales found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Buyer</th>
                  <th>Location</th>
                  <th>Property Price</th>
                  <th>Amount Received</th>
                  <th>Completion %</th>
                  <th>Sale Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredSoldProperties.map(property => (
                  <tr key={property._id} className="status-completed">
                    <td>
                      <span className="property-title">{property.title}</span>
                    </td>
                    <td>
                      <span className="buyer-name">{property.owner?.name || 'N/A'}</span>
                      <span className="buyer-email">{property.owner?.email}</span>
                    </td>
                    <td>{property.location?.city || property.location?.address || 'N/A'}</td>
                    <td className="amount-cell">
                      <strong>{formatCurrency(property.price)}</strong>
                    </td>
                    <td className="amount-cell">
                      <strong style={{ color: '#10b981' }}>{formatCurrency(property.totalPaid)}</strong>
                    </td>
                    <td>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '100%' }}>100%</div>
                      </div>
                    </td>
                    <td className="date-cell">
                      {property.createdAt ? formatDate(property.createdAt) : 'N/A'}
                    </td>
                    <td>
                      <span className="badge badge-completed">Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pagination-info">
          Showing {filteredSoldProperties.length} of {soldProperties.length} completed sales
        </div>
      </div>

      {/* Pending Payments Section */}
      {pendingProperties.length > 0 && (
        <div className="detailed-section">
          <div className="section-header">
            <h2><FiClock /> Pending Payments</h2>
          </div>

          <div className="table-wrapper">
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Buyer</th>
                  <th>Location</th>
                  <th>Property Price</th>
                  <th>Received</th>
                  <th>Pending</th>
                  <th>Completion %</th>
                  <th>Payment Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pendingProperties.map(property => {
                  const remaining = property.price - property.totalPaid;
                  const percentage = Math.round((property.totalPaid / property.price) * 100);
                  
                  return (
                    <tr key={property._id} className="status-partial">
                      <td>
                        <span className="property-title">{property.title}</span>
                      </td>
                      <td>
                        <span className="buyer-name">{property.owner?.name || 'N/A'}</span>
                        <span className="buyer-email">{property.owner?.email}</span>
                      </td>
                      <td>{property.location?.city || property.location?.address || 'N/A'}</td>
                      <td className="amount-cell">
                        <strong>{formatCurrency(property.price)}</strong>
                      </td>
                      <td className="amount-cell">
                        <strong style={{ color: '#10b981' }}>{formatCurrency(property.totalPaid)}</strong>
                      </td>
                      <td className="amount-cell">
                        <strong style={{ color: '#ef4444' }}>{formatCurrency(remaining)}</strong>
                      </td>
                      <td>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${percentage}%` }}>
                            {percentage}%
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-plan">
                          {property.paymentPlan || 'Flexible'}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status="partial" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pagination-info">
            Showing {pendingProperties.length} properties with pending payments
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesAnalytics;
