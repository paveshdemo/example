import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyFeedback, getMyMeetingRequests, createMeetingRequest } from '../../services/dataService';
import { formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiStar, FiCalendar, FiClock, FiVideo } from 'react-icons/fi';

const CustomerFeedback = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    requestedDate: '',
    preferredTime: 'afternoon'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [feedRes, meetRes] = await Promise.all([
          getMyFeedback(),
          getMyMeetingRequests()
        ]);
        setFeedbacks(feedRes.data.data);
        setMeetings(meetRes.data.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleBookMeeting = async (e) => {
    e.preventDefault();
    if (!meetingForm.title || !meetingForm.requestedDate) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      await createMeetingRequest({
        title: meetingForm.title,
        description: meetingForm.description,
        requestedDate: meetingForm.requestedDate,
        preferredTime: meetingForm.preferredTime
      });
      
      // Refresh meetings
      const res = await getMyMeetingRequests();
      setMeetings(res.data.data);
      
      // Reset form and close modal
      setMeetingForm({ title: '', description: '', requestedDate: '', preferredTime: 'afternoon' });
      setShowMeetingModal(false);
    } catch (err) {
      console.error(err);
      alert('Failed to book meeting');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="customer-feedback-page">
      <style>{`
        .customer-feedback-page {
          padding: 0;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .page-header-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          border-radius: 0 0 20px 0;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2);
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .page-header-section h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .page-content {
          padding: 0 30px;
          margin-bottom: 30px;
        }

        .btn-book-meeting {
          background: white;
          color: #667eea;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-book-meeting:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .section-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin: 30px 0 20px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .feedback-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.2s ease;
        }

        .feedback-card:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }

        .feedback-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .feedback-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .feedback-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .feedback-message {
          color: #4b5563;
          line-height: 1.6;
          margin: 12px 0;
        }

        .feedback-date {
          font-size: 12px;
          color: #9ca3af;
        }

        .admin-response {
          margin-top: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #f0f4ff 0%, #f3e8ff 100%);
          border-left: 4px solid #667eea;
          border-radius: 8px;
        }

        .admin-response strong {
          color: #667eea;
          display: block;
          margin-bottom: 8px;
        }

        .admin-response p {
          margin: 0;
          color: #4b5563;
          line-height: 1.6;
        }

        .meeting-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .meeting-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .meeting-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .meeting-icon.pending {
          background: #fef3c7;
          color: #f59e0b;
        }

        .meeting-icon.scheduled {
          background: #dbeafe;
          color: #3b82f6;
        }

        .meeting-icon.completed {
          background: #d1fae5;
          color: #10b981;
        }

        .meeting-title {
          font-size: 16px;
          font-weight: 700;
          color: #1f2937;
          margin: 0;
        }

        .meeting-status {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .meeting-status.pending {
          background: #fef3c7;
          color: #92400e;
        }

        .meeting-status.scheduled {
          background: #dbeafe;
          color: #1e40af;
        }

        .meeting-status.completed {
          background: #d1fae5;
          color: #065f46;
        }

        .meeting-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin: 16px 0;
        }

        .meeting-detail {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .meeting-detail-icon {
          margin-top: 2px;
          color: #667eea;
          flex-shrink: 0;
        }

        .meeting-detail-text {
          flex: 1;
        }

        .meeting-detail-label {
          font-size: 12px;
          color: #9ca3af;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        .meeting-detail-value {
          color: #1f2937;
          font-weight: 600;
          margin-top: 2px;
        }

        .zoom-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 10px 16px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.2s ease;
          margin-top: 8px;
        }

        .zoom-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .empty-state {
          background: white;
          border: 2px dashed #e5e7eb;
          border-radius: 12px;
          padding: 60px 30px;
          text-align: center;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 16px;
          opacity: 0.6;
        }

        .empty-state h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: #1f2937;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal {
          background: white;
          border-radius: 12px;
          padding: 30px;
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal h2 {
          margin: 0 0 24px 0;
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .form-group.required label::after {
          content: ' *';
          color: #ef4444;
        }

        .form-control {
          width: 100%;
          padding: 10px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .form-control:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 24px;
        }

        .btn-submit {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-cancel {
          flex: 1;
          background: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-cancel:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .page-header-section {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .page-header-section h1 {
            font-size: 24px;
          }

          .page-content {
            padding: 0 20px;
          }

          .meeting-details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page-header-section">
        <h1>📋 My Feedback & Meetings</h1>
        <button className="btn-book-meeting" onClick={() => setShowMeetingModal(true)}>
          <FiCalendar /> Book Meeting
        </button>
      </div>

      <div className="page-content">
        {/* Meetings Section */}
        {meetings.length > 0 && (
          <>
            <h2 className="section-title"><FiVideo /> My Meeting Requests</h2>
            {meetings.map(m => (
              <div key={m._id} className="meeting-card">
                <div className="meeting-header">
                  <div className={`meeting-icon ${m.status}`}>
                    {m.status === 'pending' && '⏳'}
                    {m.status === 'scheduled' && '✓'}
                    {m.status === 'completed' && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p className="meeting-title">{m.title}</p>
                    <span className={`meeting-status ${m.status}`}>{m.status}</span>
                  </div>
                </div>

                {m.description && (
                  <p style={{ color: '#4b5563', margin: '12px 0' }}>{m.description}</p>
                )}

                <div className="meeting-details">
                  <div className="meeting-detail">
                    <FiCalendar className="meeting-detail-icon" />
                    <div className="meeting-detail-text">
                      <div className="meeting-detail-label">Requested Date</div>
                      <div className="meeting-detail-value">{new Date(m.requestedDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="meeting-detail">
                    <FiClock className="meeting-detail-icon" />
                    <div className="meeting-detail-text">
                      <div className="meeting-detail-label">Preferred Time</div>
                      <div className="meeting-detail-value">{m.preferredTime}</div>
                    </div>
                  </div>
                  {m.status === 'scheduled' && (
                    <>
                      <div className="meeting-detail">
                        <FiCalendar className="meeting-detail-icon" />
                        <div className="meeting-detail-text">
                          <div className="meeting-detail-label">Scheduled Date</div>
                          <div className="meeting-detail-value">{new Date(m.scheduledDate).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="meeting-detail">
                        <FiVideo className="meeting-detail-icon" />
                        <div className="meeting-detail-text">
                          <div className="meeting-detail-label">Meeting Type</div>
                          <div className="meeting-detail-value">Zoom Online</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {m.status === 'scheduled' && (
                  <a href={`https://zoom.us/meeting/${m._id}`} target="_blank" rel="noopener noreferrer" className="zoom-link">
                    <FiVideo /> Join Zoom Meeting
                  </a>
                )}

                {m.notes && (
                  <div style={{ marginTop: '16px', padding: '12px', background: '#f9fafb', borderRadius: '8px' }}>
                    <strong style={{ color: '#667eea', display: 'block', marginBottom: '8px' }}>Notes:</strong>
                    <p style={{ margin: 0, color: '#4b5563' }}>{m.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {/* Feedback Section */}
        <h2 className="section-title">💬 My Feedback</h2>
        {feedbacks.length === 0 && meetings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h3>No Activity Yet</h3>
            <p>Book a meeting or submit feedback to get started</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3>No Feedback Submitted</h3>
            <p>Submit your first feedback</p>
          </div>
        ) : (
          <div>
            {feedbacks.map(f => (
              <div key={f._id} className="feedback-card">
                <div className="feedback-header">
                  <h3>{f.title}</h3>
                  <small className="feedback-date">{formatDate(f.createdAt)}</small>
                </div>
                <div className="feedback-badges">
                  <StatusBadge status={f.category} />
                  <StatusBadge status={f.status} />
                  <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} fill={i < f.rating ? '#ffd166' : 'none'} color="#ffd166" size={14} />
                    ))}
                  </span>
                </div>
                <p className="feedback-message">{f.message}</p>
                {f.adminResponse && (
                  <div className="admin-response">
                    <strong>Admin Response</strong>
                    <p>{f.adminResponse}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Book Meeting Modal */}
      {showMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowMeetingModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Book a Meeting</h2>
            <form onSubmit={handleBookMeeting}>
              <div className="form-group required">
                <label>Meeting Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g., Property Discussion, Payment Inquiry"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Tell us what you'd like to discuss..."
                  rows="3"
                  value={meetingForm.description}
                  onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                />
              </div>

              <div className="form-group required">
                <label>Preferred Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={meetingForm.requestedDate}
                  onChange={(e) => setMeetingForm({ ...meetingForm, requestedDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Preferred Time</label>
                <select
                  className="form-control"
                  value={meetingForm.preferredTime}
                  onChange={(e) => setMeetingForm({ ...meetingForm, preferredTime: e.target.value })}
                >
                  <option value="morning">Morning (9 AM - 12 PM)</option>
                  <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                  <option value="evening">Evening (5 PM - 8 PM)</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Booking...' : 'Book Meeting'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowMeetingModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerFeedback;
