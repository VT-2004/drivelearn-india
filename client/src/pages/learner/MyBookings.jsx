import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyBookings,
  cancelBooking,
  createBookingOrder,
  confirmBookingWithWallet,
  verifyBookingPayment,
  getBookingAttendance,
  getReviewableSchools,
  createReview,
  getLearnerCalendar,
  postUpdate,
  getUpdates,
  getMe,
  downloadReceipt,
  downloadCertificate,
  getAvailableSlotsForInstructor,
  rescheduleBooking,
} from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpayHelper';
import { useAuth } from '../../context/AuthContext';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import AttendanceCalendar from '../../components/AttendanceCalendar';
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
  const [updateFormFor, setUpdateFormFor] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [updatesMap, setUpdatesMap] = useState({});
  const [walletBalance, setWalletBalance] = useState(0);

  // Reschedule state
  const [rescheduleBookingId, setRescheduleBookingId] = useState(null);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [selectedNewSlotId, setSelectedNewSlotId] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  const { logout, user } = useAuth();

  const load = async () => {
    setLoading(true);
    const res = await getMyBookings();
    setBookings(res.data.bookings);
    const reviewableRes = await getReviewableSchools();
    setReviewable(reviewableRes.data.reviewable);
    const meRes = await getMe();
    setWalletBalance(meRes.data.user.walletBalance);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking? If you have paid for this lesson, the fee will be immediately refunded to your DriveLearn Wallet.')) return;
    try {
      const res = await cancelBooking(id);
      alert(res.data.message || 'Booking cancelled successfully.');
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
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
    if (!updatesMap[bookingId]) {
      const updRes = await getUpdates(bookingId);
      setUpdatesMap({ ...updatesMap, [bookingId]: updRes.data.updates });
    }
    setExpandedId(bookingId);
  };

  const handlePostUpdate = async (bookingId) => {
    if (!updateText.trim()) return;
    try {
      await postUpdate(bookingId, updateText);
      setUpdateText('');
      setUpdateFormFor(null);
      const updRes = await getUpdates(bookingId);
      setUpdatesMap({ ...updatesMap, [bookingId]: updRes.data.updates });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to post update');
    }
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

      // Fully covered by wallet - confirm directly, no Razorpay popup needed
      if (orderData.fullyCoveredByWallet) {
        await confirmBookingWithWallet(booking.id);
        alert(`Booking confirmed using ₹${orderData.walletApplied} from your wallet - no additional payment needed!`);
        load();
        setPayingId(null);
        return;
      }

      await openRazorpayCheckout(orderData, {
        name: 'DriveLearn India',
        description: orderData.walletApplied > 0
          ? `${booking.course.title} (₹${orderData.walletApplied} wallet credit applied)`
          : booking.course.title,
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

  const handleDownloadReceipt = async (bookingId) => {
    try {
      await downloadReceipt(bookingId);
    } catch (err) {
      alert('Failed to download receipt');
    }
  };

  const handleDownloadCertificate = async (bookingId) => {
    try {
      await downloadCertificate(bookingId);
    } catch (err) {
      alert('Failed to download certificate');
    }
  };

  const handleOpenReschedule = async (booking) => {
    if (rescheduleBookingId === booking.id) {
      setRescheduleBookingId(null);
      return;
    }
    setRescheduleBookingId(booking.id);
    setSelectedNewSlotId('');
    setRescheduleError('');
    setLoadingRescheduleSlots(true);
    try {
      const res = await getAvailableSlotsForInstructor(booking.instructorId);
      setRescheduleSlots(res.data.slots);
    } catch (err) {
      setRescheduleError('Failed to load instructor slots');
    } finally {
      setLoadingRescheduleSlots(false);
    }
  };

  const handleConfirmReschedule = async (bookingId) => {
    if (!selectedNewSlotId) {
      setRescheduleError('Please select a new time slot');
      return;
    }
    setRescheduling(true);
    setRescheduleError('');
    try {
      await rescheduleBooking(bookingId, selectedNewSlotId);
      alert('Booking rescheduled successfully!');
      setRescheduleBookingId(null);
      load();
    } catch (err) {
      setRescheduleError(err.response?.data?.error || 'Failed to reschedule booking');
    } finally {
      setRescheduling(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Bookings</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <LiveClock />
          <Link to="/learner" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            Find More Schools
          </Link>
          <AccountMenu walletBalance={walletBalance} />
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
                  {b.startTime && b.endTime && ` · ${b.startTime} – ${b.endTime}`}
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
                    <>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '13px', padding: '6px 14px', color: '#1C1F22', border: '1.5px solid #F2B705', background: '#FFF8E1' }}
                        onClick={() => handleOpenReschedule(b)}
                      >
                        🔄 {rescheduleBookingId === b.id ? 'Close Reschedule' : 'Reschedule Slot'}
                      </button>
                      <button className="action-btn reject-btn" onClick={() => handleCancel(b.id)}>Cancel</button>
                    </>
                  )}
                  {(b.status === 'confirmed' || b.status === 'completed') && (
                    <>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '13px', padding: '6px 14px', color: '#1C1F22', border: '1.5px solid #1C1F22' }}
                        onClick={() => handleDownloadReceipt(b.id)}
                      >
                        🧾 Download Receipt
                      </button>
                      {b.status === 'completed' && (
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '13px', padding: '6px 14px', color: '#1C1F22', border: '1.5px solid #F2B705', background: '#FFF8E1' }}
                          onClick={() => handleDownloadCertificate(b.id)}
                        >
                          🎓 Download Certificate
                        </button>
                      )}
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: '13px', padding: '6px 14px' }}
                        onClick={() => { setUpdateFormFor(updateFormFor === b.id ? null : b.id); setUpdateText(''); }}
                      >
                        💬 Post Update
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '13px', padding: '6px 14px', color: '#1C1F22', border: '1.5px solid #1C1F22' }}
                        onClick={() => toggleProgress(b.id)}
                      >
                        📜 {expandedId === b.id ? 'Hide Details' : 'View Details'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {rescheduleBookingId === b.id && (
              <div style={{ marginTop: '16px', borderTop: '1.5px solid #F2B705', paddingTop: '16px', background: '#FFFDF5', padding: '16px', borderRadius: '6px' }}>
                <h4 style={{ margin: '0 0 8px', color: '#1C1F22' }}>Reschedule with {b.instructor.user.name}</h4>
                <p style={{ fontSize: '13px', color: '#6B7680', margin: '0 0 12px' }}>
                  Pick another open time slot. Your previous slot will be automatically released.
                </p>

                {loadingRescheduleSlots ? (
                  <p style={{ fontSize: '13px', color: '#8B929A' }}>Loading available slots...</p>
                ) : rescheduleSlots.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#B3261E' }}>
                    No other open slots available for this instructor right now.
                  </p>
                ) : (
                  <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #D8D4C9', borderRadius: '4px', marginBottom: '12px', background: 'white' }}>
                    {rescheduleSlots.map((s) => {
                      const [sh, sm] = s.startTime.split(':').map(Number);
                      const [eh, em] = s.endTime.split(':').map(Number);
                      const diff = (eh * 60 + em) - (sh * 60 + sm);
                      const durText = diff === 60 ? '1 hr' : diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff} min`;

                      return (
                        <div
                          key={s.id}
                          onClick={() => setSelectedNewSlotId(s.id)}
                          style={{
                            padding: '10px 12px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            background: selectedNewSlotId === s.id ? '#FFF8E1' : 'white',
                            borderBottom: '1px solid #F0EEE7',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <strong>{new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</strong>
                            <span style={{ marginLeft: '10px' }}>{s.startTime} – {s.endTime}</span>
                          </div>
                          <span style={{ fontSize: '11px', background: '#ECEFF1', color: '#455A64', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            {durText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {rescheduleError && <p style={{ color: '#B3261E', fontSize: '13px', margin: '0 0 10px' }}>{rescheduleError}</p>}

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    className="btn btn-primary"
                    disabled={rescheduling || !selectedNewSlotId}
                    onClick={() => handleConfirmReschedule(b.id)}
                  >
                    {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}
                    onClick={() => setRescheduleBookingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {updateFormFor === b.id && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Post an update about this lesson
                </label>
                <textarea
                  placeholder="e.g. Felt confident with parking today, still nervous about highway merges..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1.5px solid #D8D4C9', borderRadius: '5px', minHeight: '80px', fontFamily: 'inherit', fontSize: '14px' }}
                />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button className="btn btn-primary" onClick={() => handlePostUpdate(b.id)}>Save Update</button>
                  <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => setUpdateFormFor(null)}>Cancel</button>
                </div>
              </div>
            )}

            {expandedId === b.id && (
              <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px' }}>Update History</p>
                {(!updatesMap[b.id] || updatesMap[b.id].length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#8B929A' }}>No updates posted yet.</p>
                ) : (
                  updatesMap[b.id].map((u) => (
                    <div key={u.id} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #F0EEE7' }}>
                      <strong style={{ color: '#1C1F22' }}>{u.author.name}</strong>
                      <span style={{ color: '#8B929A' }}> ({u.authorRole}) — {new Date(u.createdAt).toLocaleString('en-IN')}</span>
                      <p style={{ margin: '4px 0 0' }}>{u.message}</p>
                    </div>
                  ))
                )}

                <p style={{ fontSize: '13px', fontWeight: 600, margin: '16px 0 10px' }}>Lesson Progress</p>
                {(!progressMap[b.id] || progressMap[b.id].length === 0) ? (
                  <p style={{ fontSize: '13px', color: '#8B929A' }}>No lessons recorded yet.</p>
                ) : (
                  progressMap[b.id].map((a) => (
                    <div key={a.id} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '6px' }}>
                      {new Date(a.date).toLocaleDateString('en-IN')} —{' '}
                      <span style={{ color: a.status === 'present' ? '#2E7D32' : '#B3261E', fontWeight: 600 }}>
                        {a.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '22px' }}>My Attendance Calendar</h1>
      </div>
      <div className="form-card" style={{ maxWidth: '600px' }}>
        <AttendanceCalendar fetchFn={getLearnerCalendar} />
      </div>
    </div>
  );
};

export default MyBookings;