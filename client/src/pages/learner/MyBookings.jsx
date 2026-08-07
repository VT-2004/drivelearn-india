import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, cancelBooking, createBookingOrder, verifyBookingPayment, getBookingAttendance, getReviewableSchools, createReview } from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpayHelper';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const statusClass = {
  pending: 'status-pending',
  confirmed: 'status-verified',
  completed: 'status-verified',
  cancelled: 'status-rejected',
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [reviewable, setReviewable] = useState([]);
  const [reviewFormFor, setReviewFormFor] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewError, setReviewError] = useState('');
  const { logout, user } = useAuth();

  const load = async () => {
    setLoading(true);
    const res = await getMyBookings();
    setBookings(res.data.bookings);
    const reviewableRes = await getReviewableSchools();
    setReviewable(reviewableRes.data.reviewable);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await cancelBooking(id);
    load();
  };

  const toggleProgress = async (bookingId) => {
    if (expandedId === bookingId) {
      setExpandedId(null);
      return;
    }
    if (!progressMap[bookingId]) {
      const res = await getBookingAttendance(bookingId);
      setProgressMap({ ...progressMap, [bookingId]: res.data.attendance });
    }
    setExpandedId(bookingId);
  };

  const handleSubmitReview = async (e, schoolId) => {
    e.preventDefault();
    setReviewError('');
    try {
      await createReview({ schoolId, ...reviewData });
      setReviewFormFor(null);
      setReviewData({ rating: 5, comment: '' });
      load();
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    }
  };

  const handlePayNow = async (booking) => {
    setPayingId(booking.id);
    try {
      const orderRes = await createBookingOrder(booking.id);
      const orderData = orderRes.data;

      await openRazorpayCheckout(orderData, {
        name: 'DriveLearn India',
        description: booking.course.title,
        prefill: { name: user?.name, email: user?.email },
        onSuccess: async (response) => {
          try {
            await verifyBookingPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking.id,
            });
            alert('Payment successful! Your booking is now confirmed.');
            load();
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        onFailure: () => {
          setPayingId(null);
        },
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start payment');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Bookings</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/learner" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            Find More Schools
          </Link>
          <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {reviewable.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {reviewable.map((r) => (
            <div key={r.schoolId} className="form-card" style={{ maxWidth: '700px', marginBottom: '12px', background: '#FFF8E1', border: '1px solid #F2B705' }}>
              {reviewFormFor === r.schoolId ? (
                <form onSubmit={(e) => handleSubmitReview(e, r.schoolId)}>
                  <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Rate your experience with {r.schoolName}</p>
                  <label>Rating</label>
                  <select value={reviewData.rating} onChange={(e) => setReviewData({ ...reviewData, rating: e.target.value })}>
                    <option value={5}>5 - Excellent</option>
                    <option value={4}>4 - Good</option>
                    <option value={3}>3 - Average</option>
                    <option value={2}>2 - Poor</option>
                    <option value={1}>1 - Very Poor</option>
                  </select>
                  <label>Comment (optional)</label>
                  <textarea value={reviewData.comment} onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })} />
                  {reviewError && <p style={{ color: 'red', fontSize: '14px' }}>{reviewError}</p>}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                    <button type="submit" className="btn btn-primary">Submit Review</button>
                    <button type="button" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => setReviewFormFor(null)}>Cancel</button>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>How was your course at <strong>{r.schoolName}</strong>?</span>
                  <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => setReviewFormFor(r.schoolId)}>
                    Leave a Review
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="empty-state">
          No bookings yet. <Link to="/learner">Find a driving school</Link> to get started.
        </div>
      ) : (
        bookings.map((b) => (
          <div className="form-card" key={b.id} style={{ marginBottom: '16px', maxWidth: '700px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ margin: '0 0 6px' }}>{b.course.title}</h3>
                <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>
                  {b.course.school.name} — {b.course.school.city}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                  <strong>Date:</strong> {new Date(b.bookedDate).toLocaleDateString('en-IN')}
                </p>
                <p style={{ margin: '0 0 4px', fontSize: '14px' }}>
                  <strong>Instructor:</strong> {b.instructor.user.name}
                </p>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  <strong>Amount:</strong> <span className="dash-price-tag">₹{Number(b.course.price).toLocaleString('en-IN')}</span>
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`status-badge ${statusClass[b.status]}`}>{b.status}</span>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {b.status === 'pending' && (
                    <button className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }} onClick={() => handlePayNow(b)} disabled={payingId === b.id}>
                      {payingId === b.id ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button className="action-btn reject-btn" onClick={() => handleCancel(b.id)}>Cancel</button>
                  )}
                  {(b.status === 'confirmed' || b.status === 'completed') && (
                    <button
                      className="btn btn-outline"
                      style={{ fontSize: '13px', padding: '6px 14px', color: '#1C1F22', border: '1.5px solid #1C1F22' }}
                      onClick={() => toggleProgress(b.id)}
                    >
                      {expandedId === b.id ? 'Hide Progress' : 'View Progress'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {expandedId === b.id && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Lesson Progress</p>
                {(!progressMap[b.id] || progressMap[b.id].length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#8B929A' }}>No lessons recorded yet.</p>
                ) : (
                  progressMap[b.id].map((a) => (
                    <div key={a.id} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '6px' }}>
                      {new Date(a.date).toLocaleDateString('en-IN')} —{' '}
                      <span style={{ color: a.status === 'present' ? '#2E7D32' : '#B3261E', fontWeight: 600 }}>
                        {a.status}
                      </span>
                      {a.notes && ` — ${a.notes}`}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyBookings;