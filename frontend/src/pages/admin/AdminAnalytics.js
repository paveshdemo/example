import React, { useState, useEffect } from 'react';
import { getSalesAnalytics } from '../../services/dataService';
// eslint-disable-next-line no-unused-vars
import { formatCurrency } from '../../utils/helpers';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getSalesAnalytics();
        setAnalytics(res.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <LoadingSpinner />;

  const statusData = {
    labels: analytics?.propertyByStatus?.map(s => s._id) || [],
    datasets: [{
      data: analytics?.propertyByStatus?.map(s => s.count) || [],
      backgroundColor: ['#4361ee', '#2ec4b6', '#ff6b6b', '#ffd166', '#6f42c1', '#20c997']
    }]
  };

  const typeData = {
    labels: analytics?.propertyByType?.map(t => t._id) || [],
    datasets: [{
      label: 'Total',
      data: analytics?.propertyByType?.map(t => t.count) || [],
      backgroundColor: '#4361ee'
    }, {
      label: 'Sold',
      data: analytics?.propertyByType?.map(t => t.sold) || [],
      backgroundColor: '#2ec4b6'
    }]
  };

  const salesData = {
    labels: analytics?.salesByMonth?.map(m => m._id) || [],
    datasets: [{
      label: 'Sales',
      data: analytics?.salesByMonth?.map(m => m.count) || [],
      backgroundColor: '#2ec4b6'
    }]
  };

  const totalProperties = analytics?.propertyByStatus?.reduce((s, p) => s + p.count, 0) || 0;
  const soldCount = analytics?.propertyByStatus?.find(s => s._id === 'sold')?.count || 0;

  return (
    <div>
      <div className="page-header"><h1>Sales Analytics</h1></div>

      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card"><div className="stat-value">{totalProperties}</div><div className="stat-label">Total Properties</div></div>
        <div className="stat-card"><div className="stat-value">{soldCount}</div><div className="stat-label">Properties Sold</div></div>
        <div className="stat-card"><div className="stat-value">{analytics?.propertyByType?.length || 0}</div><div className="stat-label">Property Types</div></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="card">
          <h3>Properties by Status</h3>
          <div style={{ maxWidth: '300px', margin: '0 auto' }}>
            <Pie data={statusData} />
          </div>
        </div>
        <div className="card">
          <h3>Properties by Type</h3>
          <Bar data={typeData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
        <h3>Sales by Month</h3>
        <Bar data={salesData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
      </div>
    </div>
  );
};

export default AdminAnalytics;
