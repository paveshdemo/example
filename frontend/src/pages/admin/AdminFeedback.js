import React, { useState, useEffect } from 'react';
import { getAllFeedback, respondToFeedback, getAllMeetingRequests, scheduleMeetingRequest } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiStar, FiMessageSquare, FiCalendar, FiClock, FiCheckCircle, FiVideo } from 'react-icons/fi';

const AdminFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [responding, setResponding] = useState(null);
  const [response, setResponse] = useState('');
  const [schedulingMeeting, setSchedulingMeeting] = useState(null);
  const [schedulingForm, setSchedulingForm] = useState({
    scheduledDate: '',
    meetingLocation: 'zoom'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [feedRes, meetRes] = await Promise.all([
        getAllFeedback(),
        getAllMeetingRequests()
      ]);
      setFeedbacks(feedRes.data.data);
      setMeetings(meetRes.data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRespond = async (id) => {
    try {
      await respondToFeedback(id, { adminResponse: response });
      setResponding(null);
      setResponse('');
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleScheduleMeeting = async (meetingId) => {
    if (!schedulingForm.scheduledDate) {
      alert('Please select a scheduled date');
      return;
    }

    setSubmitting(true);
    try {
      await scheduleMeetingRequest(meetingId, {
        scheduledDate: schedulingForm.scheduledDate,
        meetingLocation: schedulingForm.meetingLocation
      });
      setSchedulingMeeting(null);
      setSchedulingForm({ scheduledDate: '', meetingLocation: 'zoom' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = filter === 'all' ? feedbacks : feedbacks.filter(f => f.status === filter);
  const pendingMeetings = meetings.filter(m => m.status === 'pending');
  const scheduledMeetings = meetings.filter(m => m.status === 'scheduled');

  if (loading) return <LoadingSpinner />;

  return (
    <div style={{ padding: '0 30px 30px 30px' }}>
      <style>{`
        .admin-feedback-page {
          background: #f8f9fa;
          min-height: 100vh;
        }

        .section-header {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 30px 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 12px;
        }

        .meeting-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .meeting-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          margin-right: 8px;
        }

        .meeting-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .meeting-badge.scheduled {
          background: #dbeafe;
          color: #1e40af;
        }

        .meeting-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .meeting-title {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
        }

        .meeting-info {
          display: flex;
          gap: 8px;
          margin: 12px 0;
          flex-wrap: wrap;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #4b5563;
        }

        .schedule-form {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          margin-top: 12px;
        }

        .form-row {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .form-row-item {
          flex: 1;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .form-control {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 13px;
        }

        .form-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .btn-schedule {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-schedule:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-schedule:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-open-schedule {
          background: #e0e7ff;
          color: #667eea;
          border: 1px solid #c7d2fe;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-open-schedule:hover {
          background: #c7d2fe;
        }

        .btn-cancel {
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #d1d5db;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .meeting-details {
          background: #ecfdf5;
          border-left: 4px solid #10b981;
          padding: 12px;
          border-radius: 6px;
          margin-top: 12px;
          font-size: 13px;
        }

        .zoom-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #3b82f6;
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 600;
          margin-top: 8px;
        }

        .zoom-link:hover {
          background: #2563eb;
        }
      `}</style>

      {/* Meeting Requests Section */}
      <h2 className="section-header"><FiCalendar /> Meeting Requests</h2>

      {pendingMeetings.length > 0 && (
        <>
          <h3 style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
            ⏳ Pending Requests ({pendingMeetings.length})
          </h3>
          {pendingMeetings.map(m => (
            <div key={m._id} className="meeting-card">
              <div className="meeting-header">
                <div>
                  <span className="meeting-badge pending">Pending</span>
                  <p className="meeting-title">{m.title}</p>
                </div>
              </div>

              {m.description && (
                <p style={{ color: '#4b5563', margin: '8px 0' }}>{m.description}</p>
              )}

              <div className="meeting-info">
                <span className="info-item"><FiCalendar size={14} /> {new Date(m.requestedDate).toLocaleDateString()}</span>
                <span className="info-item"><FiClock size={14} /> {m.preferredTime}</span>
                <span className="info-item">👤 {m.customer?.name}</span>
              </div>

              {schedulingMeeting === m._id ? (
                <div className="schedule-form">
                  <div className="form-row">
                    <div className="form-row-item">
                      <label className="form-group">Scheduled Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={schedulingForm.scheduledDate}
                        onChange={(e) => setSchedulingForm({ ...schedulingForm, scheduledDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button 
                      className="btn-schedule" 
                      onClick={() => handleScheduleMeeting(m._id)}
                      disabled={submitting}
                    >
                      {submitting ? 'Scheduling...' : 'Confirm & Schedule'}
                    </button>
                    <button 
                      className="btn-cancel"
                      onClick={() => {
                        setSchedulingMeeting(null);
                        setSchedulingForm({ scheduledDate: '', meetingLocation: 'zoom' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button className="btn-open-schedule" onClick={() => setSchedulingMeeting(m._id)}>
                  <FiCheckCircle size={14} /> Schedule Meeting
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {scheduledMeetings.length > 0 && (
        <>
          <h3 style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '600', marginBottom: '12px', marginTop: '20px' }}>
            ✓ Scheduled Meetings ({scheduledMeetings.length})
          </h3>
          {scheduledMeetings.map(m => (
            <div key={m._id} className="meeting-card">
              <div className="meeting-header">
                <div>
                  <span className="meeting-badge scheduled">Scheduled</span>
                  <p className="meeting-title">{m.title}</p>
                </div>
              </div>

              <div className="meeting-info">
                <span className="info-item"><FiVideo size={14} /> Zoom Online</span>
                <span className="info-item"><FiCalendar size={14} /> {new Date(m.scheduledDate).toLocaleDateString()}</span>
                <span className="info-item">👤 {m.customer?.name}</span>
              </div>

              <div className="meeting-details">
                <strong style={{ color: '#10b981' }}>✓ Meeting Confirmed</strong>
                <p style={{ margin: '6px 0 0 0', color: '#047857' }}>
                  The customer has been notified and can join via Zoom at the scheduled time.
                </p>
              </div>

              <a href={`https://zoom.us/meeting/${m._id}`} target="_blank" rel="noopener noreferrer" className="zoom-link">
                <FiVideo size={14} /> Launch Zoom Meeting
              </a>
            </div>
          ))}
        </>
      )}

      {pendingMeetings.length === 0 && scheduledMeetings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <FiCalendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No meeting requests</p>
        </div>
      )}

      {/* Feedback Section */}
      <h2 className="section-header"><FiMessageSquare /> Feedback Management</h2>
      <div style={{ marginBottom: '16px' }}>
        {['all', 'submitted', 'reviewed', 'responded'].map(f => (
          <button 
            key={f} 
            style={{
              background: filter === f ? '#667eea' : '#f3f4f6',
              color: filter === f ? 'white' : '#6b7280',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              marginRight: '8px',
              marginBottom: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
          <FiMessageSquare size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No feedback found</p>
        </div>
      ) : (
        <div>
          {filtered.map(f => (
            <div key={f._id} className="meeting-card">
              <div className="meeting-header">
                <div style={{ flex: 1 }}>
                  <p className="meeting-title">{f.title}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>👤 {f.customer?.name || 'Unknown'}</span>
                    <StatusBadge status={f.category} />
                    <StatusBadge status={f.status} />
                    <span style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <FiStar key={i} fill={i < f.rating ? '#ffd166' : 'none'} color="#ffd166" size={14} />
                      ))}
                    </span>
                  </div>
                </div>
                <small style={{ color: '#9ca3af' }}>{formatDate(f.createdAt)}</small>
              </div>

              <p style={{ color: '#4b5563', margin: '12px 0' }}>{f.message}</p>

              {f.adminResponse && (
                <div style={{ marginTop: '12px', padding: '12px', background: '#ecfdf5', borderLeft: '4px solid #10b981', borderRadius: '6px' }}>
                  <strong style={{ color: '#10b981' }}>Your Response:</strong>
                  <p style={{ margin: '6px 0 0 0', color: '#047857' }}>{f.adminResponse}</p>
                </div>
              )}

              {!f.adminResponse && (
                <div style={{ marginTop: '12px' }}>
                  {responding === f._id ? (
                    <div>
                      <textarea 
                        className="form-control" 
                        value={response} 
                        onChange={(e) => setResponse(e.target.value)} 
                        rows="3" 
                        placeholder="Write your response..."
                        style={{ marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '12px'
                          }}
                          onClick={() => handleRespond(f._id)}
                        >
                          Send Response
                        </button>
                        <button 
                          className="btn-cancel"
                          onClick={() => { setResponding(null); setResponse(''); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn-open-schedule" onClick={() => setResponding(f._id)}>
                      <FiMessageSquare size={14} /> Respond
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
