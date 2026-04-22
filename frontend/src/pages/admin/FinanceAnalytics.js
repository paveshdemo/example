import React, { useState, useEffect } from 'react';
import { getAdminProperties, getPaymentReports, getAllPayments, getProperties } from '../../services/dataService';
import './FinanceAnalytics.css';

const FinanceAnalytics = () => {
  const [properties, setProperties] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Starting fetch finance data...');
      let propertiesData = [];
      let paymentsData = [];
      
      // Fetch Properties
      try {
        console.log('📲 Fetching properties...');
        const propertiesRes = await getAdminProperties();
        console.log('✅ Properties Response:', propertiesRes);
        
        if (propertiesRes?.data) {
          propertiesData = Array.isArray(propertiesRes.data) ? propertiesRes.data : [];
        } else if (Array.isArray(propertiesRes)) {
          propertiesData = propertiesRes;
        }
        
        console.log(`📊 Properties Count: ${propertiesData.length}`);
        
        // If still empty, try public endpoint
        if (propertiesData.length === 0) {
          console.log('⚠️ Trying alternative endpoint...');
          const altRes = await getProperties();
          if (altRes?.data) {
            propertiesData = Array.isArray(altRes.data) ? altRes.data : [];
          } else if (Array.isArray(altRes)) {
            propertiesData = altRes;
          }
          console.log(`📊 Alternative Properties Count: ${propertiesData.length}`);
        }
      } catch (err) {
        console.error('❌ Error fetching properties:', err.message);
      }
      
      // Fetch Payments
      try {
        console.log('💳 Fetching payments...');
        const paymentsRes = await getAllPayments();
        console.log('✅ Payments Response:', paymentsRes);
        
        if (paymentsRes?.data) {
          paymentsData = Array.isArray(paymentsRes.data) ? paymentsRes.data : [];
        } else if (Array.isArray(paymentsRes)) {
          paymentsData = paymentsRes;
        }
        
        console.log(`💰 Payments Count: ${paymentsData.length}`);
      } catch (err) {
        console.error('❌ Error fetching payments:', err.message);
      }

      console.log('Final Properties:', propertiesData);
      console.log('Final Payments:', paymentsData);

      // Set state
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
      setPayments(Array.isArray(paymentsData) ? paymentsData : []);

      // Get recent transactions
      const recent = (Array.isArray(paymentsData) ? paymentsData : [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10);
      setRecentTransactions(recent);
      
      setDebugInfo({
        propertiesCount: propertiesData.length,
        paymentsCount: paymentsData.length,
        timestamp: new Date().toLocaleTimeString()
      });
      
      console.log('✅ Data fetched successfully');
    } catch (err) {
      console.error('❌ Error:', err.message);
      setError(err.message);
      setProperties([]);
      setPayments([]);
      setRecentTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = () => {
    try {
      const propsArray = Array.isArray(properties) ? properties : [];
      const paymentsArray = Array.isArray(payments) ? payments : [];

      console.log('📈 Calculating stats from:', {
        propertiesCount: propsArray.length,
        paymentsCount: paymentsArray.length,
        firstProperty: propsArray[0],
        firstPayment: paymentsArray[0]
      });

      // Total Asset Value: Sum of all property prices
      const totalValue = propsArray.reduce((sum, p) => {
        const price = Number(p?.price) || 0;
        return sum + price;
      }, 0);

      // Total Collected: Sum of all verified payments
      const totalCollected = paymentsArray.reduce((sum, payment) => {
        const amount = Number(payment?.amount) || 0;
        const isVerified = payment?.status === 'verified' || payment?.status === 'completed';
        return isVerified ? sum + amount : sum;
      }, 0);

      // Also include totalPaid from properties
      const propertyCollected = propsArray.reduce((sum, p) => {
        const paid = Number(p?.totalPaid) || 0;
        return sum + paid;
      }, 0);

      // Use the higher value (more accurate)
      const finalCollected = Math.max(totalCollected, propertyCollected);

      // Total Pending: (Total Value - Total Collected)
      const totalPending = Math.max(0, totalValue - finalCollected);

      // Revenue: Verified payments
      const revenue = paymentsArray
        .filter(p => p?.status === 'verified' || p?.status === 'completed')
        .reduce((sum, p) => sum + (Number(p?.amount) || 0), 0);

      const collectionRate = totalValue > 0 ? ((finalCollected / totalValue) * 100).toFixed(1) : 0;

      const stats = {
        totalValue,
        totalCollected: finalCollected,
        totalPending,
        revenue,
        collectionRate
      };

      console.log('✅ Calculated Stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error calculating stats:', error);
      return {
        totalValue: 0,
        totalCollected: 0,
        totalPending: 0,
        revenue: 0,
        collectionRate: 0
      };
    }
  };

  const stats = calculateStats();

  const getTrendPercentage = () => {
    return 12.4; // Mock value - could be calculated from historical data
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionIcon = (type) => {
    const iconMap = {
      'Rental Income': 'home_work',
      'Maintenance': 'apartment',
      'Legal Services': 'corporate_fare',
      'default': 'storefront'
    };
    return iconMap[type] || iconMap['default'];
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'verified': { class: 'badge-verified', label: 'Verified' },
      'pending': { class: 'badge-pending', label: 'Pending' },
      'rejected': { class: 'badge-rejected', label: 'Rejected' }
    };
    return statusMap[status] || statusMap['pending'];
  };

  if (loading) {
    return <div className="finance-analytics"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="finance-analytics">
      {/* Debug Info */}
      <div style={{
        backgroundColor: '#e3f2fd',
        border: '2px solid #2196F3',
        borderRadius: '8px',
        padding: '16px',
        margin: '24px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#1976D2',
        fontFamily: 'monospace'
      }}>
        <div>🔄 <strong>Finance Analytics Debug Info</strong> - {debugInfo.timestamp || 'Loading...'}</div>
        <hr style={{borderColor: '#2196F3', margin: '8px 0'}} />
        <div>📊 Total Properties: {debugInfo.propertiesCount || properties.length}</div>
        <div>💳 Total Payments: {debugInfo.paymentsCount || payments.length}</div>
        <div>💰 Total Asset Value: {formatCurrency(stats.totalValue)}</div>
        <div>✅ Total Collected: {formatCurrency(stats.totalCollected)}</div>
        <div>⏳ Total Pending: {formatCurrency(stats.totalPending)}</div>
        <div>📈 Collection Rate: {stats.collectionRate}%</div>
        {debugInfo.propertiesError && <div style={{color: 'red'}}>❌ Properties Error: {debugInfo.propertiesError}</div>}
        {debugInfo.paymentsError && <div style={{color: 'red'}}>❌ Payments Error: {debugInfo.paymentsError}</div>}
        {debugInfo.fatalError && <div style={{color: 'red'}}>❌ Fatal Error: {debugInfo.fatalError}</div>}
        {error && <div style={{color: 'red'}}>❌ Error: {error}</div>}
      </div>

      {/* Main Content */}
      <div className="finance-container">
        {/* Section 1: Total Managed Asset Value */}
        <section className="asset-value-section">
          <div className="flex-container">
            <div>
              <p className="section-label">Total Managed Asset Value</p>
              <h1 className="main-heading">{formatCurrency(stats.totalValue)}</h1>
            </div>
            <div className="trend-badge">
              <span className="trend-icon">📈</span>
              <span className="trend-text">
                +{getTrendPercentage()}% <span className="trend-subtext">v. last quarter</span>
              </span>
            </div>
          </div>

          {/* Equity Growth Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <h3 className="chart-title">Equity Growth Trajectory</h3>
                <p className="chart-subtitle">Historical performance analysis (Jan - Dec 2024)</p>
              </div>
              <div className="badge-group">
                <span className="badge badge-primary">High Liquidity</span>
                <span className="badge badge-secondary">Premium Assets</span>
              </div>
            </div>
            <svg className="chart-svg" viewBox="0 0 1000 300" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#2a6b2c" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2a6b2c" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d="M0,250 C100,240 200,280 300,200 C400,120 500,220 600,100 C700,0 800,150 1000,50 L1000,300 L0,300 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,250 C100,240 200,280 300,200 C400,120 500,220 600,100 C700,0 800,150 1000,50"
                fill="none"
                stroke="#2a6b2c"
                strokeLinecap="round"
                strokeWidth="4"
              />
            </svg>
          </div>
        </section>

        {/* Section 1.5: Revenue & Pending Overview */}
        <section className="revenue-pending-section">
          <div className="revenue-pending-grid">
            {/* Revenue Card */}
            <div className="revenue-card">
              <div className="card-icon-large">💰</div>
              <p className="metric-label">Total Revenue Collected</p>
              <h2 className="metric-value-large">{formatCurrency(stats.totalCollected)}</h2>
              <p className="metric-subtitle">From {payments.length} verified payments</p>
            </div>

            {/* Pending Card */}
            <div className="pending-card">
              <div className="card-icon-large">⏳</div>
              <p className="metric-label">Pending Amount to Receive</p>
              <h2 className="metric-value-large pending-value">{formatCurrency(stats.totalPending)}</h2>
              <p className="metric-subtitle">From {properties.length} properties</p>
            </div>

            {/* Collection Rate Card */}
            <div className="rate-card">
              <div className="card-icon-large">📊</div>
              <p className="metric-label">Collection Rate</p>
              <h2 className="metric-value-large">{stats.collectionRate}%</h2>
              <p className="metric-subtitle">Of total asset value</p>
            </div>
          </div>
        </section>

        {/* Section 2: Rental Yield & Sales Performance */}
        <section className="dual-card-section">
          {/* Rental Yield Card */}
          <div className="rental-yield-card">
            <div className="card-header-main">
              <span className="card-icon">🏢</span>
              <span className="card-label">Residential Portfolio</span>
            </div>
            <h2 className="card-heading">Collection Efficiency</h2>
            <p className="card-description">
              Overall collection rate across all properties with {stats.collectionRate}% payment completion.
            </p>

            <div className="metrics-container">
              <div className="metric-item">
                <p className="metric-label">Total Collected</p>
                <p className="metric-value">{formatCurrency(stats.totalCollected)}</p>
              </div>
              <div className="metric-item">
                <p className="metric-label">Total Property Value</p>
                <p className="metric-value">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="metric-circle">
                <div className="circle-inner">
                  <span className="circle-value">{stats.collectionRate}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales Conversion Card */}
          <div className="sales-card">
            <div className="sales-card-inner">
              <h2 className="sales-heading">Revenue Status</h2>
              <p className="sales-description">
                Pending collections vs verified receipts overview.
              </p>

              <div className="progress-container">
                <div className="progress-header">
                  <span className="progress-label">Target: {formatCurrency(stats.totalValue)}</span>
                  <span className="progress-value">{stats.collectionRate}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${stats.collectionRate}%` }}
                  ></div>
                </div>
              </div>

              <button className="view-forecast-btn">
                View Detailed Forecast
                <span className="btn-icon">→</span>
              </button>
            </div>
            <div className="sales-bg-icon">📊</div>
          </div>
        </section>

        {/* Section 3: Recent Transactions */}
        <section className="transactions-section">
          <div className="transaction-header">
            <div>
              <h2 className="transactions-heading">Recent Transactions</h2>
              <p className="transactions-subtitle">Unified ledger of all financial movements for this quarter.</p>
            </div>
            <div className="action-buttons">
              <button className="btn btn-secondary">
                <span className="btn-icon-inline">⚙️</span>
                Filter
              </button>
              <button className="btn btn-primary">
                <span className="btn-icon-inline">📥</span>
                Export Ledger
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="table-wrapper">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction, index) => (
                  <tr key={index} className="transaction-row">
                    <td>
                      <div className="asset-cell">
                        <div className="asset-icon">
                          {transaction.property?.title?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <div className="asset-name">{transaction.property?.title || 'Property'}</div>
                          <div className="asset-type">{transaction.method || 'Payment'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="cell-text">{transaction.installmentOption || 'Full Payment'}</span>
                    </td>
                    <td>
                      <span className="cell-text">{formatDate(transaction.createdAt)}</span>
                    </td>
                    <td>
                      <span className="amount-text">
                        {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${transaction.status}`}>
                        {getStatusBadge(transaction.status)?.label || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FinanceAnalytics;
