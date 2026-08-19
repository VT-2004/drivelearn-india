import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getMyBookings,
  getMyPayments,
  getMe,
  updateProfile,
  changePassword,
  cancelBooking,
  createBookingOrder,
  confirmBookingWithWallet,
  verifyBookingPayment,
  getAvailableSlotsForInstructor,
  rescheduleBooking,
  getBookingAttendance,
  getUpdates,
  postUpdate,
  getReviewableSchools,
  createReview,
  downloadReceipt,
  downloadCertificate,
} from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpayHelper';
import SearchSchools from './SearchSchools';
import NotificationBell from '../../components/NotificationBell';
import '../../styles/dashboard.css';

const STANDARD_14_MILESTONES = [
  { index: 1, title: 'Cockpit & ABC Pedals', days: 'Days 1-2', icon: '🎛️', shortDesc: 'Dual-control orientation, clutch bite point, pedal balance' },
  { index: 2, title: 'Clutch & Bite-Point Control', days: 'Days 3-4', icon: '⚙️', shortDesc: 'Smooth rolling start, anti-stall drills, progressive braking' },
  { index: 3, title: 'Steering Slalom & Deceleration', days: 'Days 5-6', icon: '🔄', shortDesc: 'Push-pull steering, lane centering, downshifting' },
  { index: 4, title: 'Yard Maneuvers & Reversing', days: 'Days 7-8', icon: '📐', shortDesc: 'Straight reverse, mirror alignment, blind spot checks' },
  { index: 5, title: 'RTO 8-Track Forward & Reverse', days: 'Days 9-10', icon: '♾️', shortDesc: 'Figure-8 precision without kerb touching or footdown' },
  { index: 6, title: 'RTO H-Track Bay Parking', days: 'Days 11-12', icon: '🅿️', shortDesc: '90-degree reverse docking inside official RTO yellow bays' },
  { index: 7, title: 'Parallel & Kerb Parking', days: 'Days 13-14', icon: '🚗', shortDesc: 'Tight spot kerb alignment & mall basement angle parking' },
  { index: 8, title: 'Slope Start & Hill Ascent', days: 'Days 15-16', icon: '⛰️', shortDesc: 'Handbrake hill hold, zero rollback on steep flyovers' },
  { index: 9, title: 'Suburban Traffic & Lanes', days: 'Days 17-18', icon: '🛣️', shortDesc: 'Speed regulation, mirror-signal-manoeuvre discipline' },
  { index: 10, title: 'Dense City Rush Hour & Jcts', days: 'Days 19-20', icon: '🚦', shortDesc: 'Heavy traffic creeping, traffic light protocols, pedestrians' },
  { index: 11, title: 'Roundabout & Right-of-Way', days: 'Days 21-22', icon: '🔲', shortDesc: 'Multi-lane roundabout lane choices & right-of-way rules' },
  { index: 12, title: 'Highway Merging & Cruising', days: 'Days 23-24', icon: '🏎️', shortDesc: 'High-speed cruising, safe overtaking distance, toll lanes' },
  { index: 13, title: 'Night Driving & Glare Safety', days: 'Days 25-26', icon: '🌙', shortDesc: 'High-beam hazard mitigation, wet road rain traction' },
  { index: 14, title: 'Emergency Stop & RTO Mock', days: 'Days 27-28', icon: '🏆', shortDesc: 'Panic stop hazard drills & final RTO simulator mock evaluation' },
];

const LearnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Navigation State (8 Core Tabs)
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, bookings, progress, find-schools, payments, certificates, reviews, profile
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviewableSchools, setReviewableSchools] = useState([]);
  const [walletBalance, setWalletBalance] = useState(user?.walletBalance ?? 15);
  const [loading, setLoading] = useState(true);

  // Filter for My Bookings
  const [bookingFilter, setBookingFilter] = useState('All'); // All, Upcoming, Completed, Cancelled

  // Reschedule Modal State
  const [rescheduleBookingTarget, setRescheduleBookingTarget] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  // Lesson Comments / Discussion State
  const [commentModalBooking, setCommentModalBooking] = useState(null);
  const [bookingComments, setBookingComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Review Form Modal State
  const [reviewModalTarget, setReviewModalTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  // Payment Processing State
  const [payingBookingId, setPayingBookingId] = useState(null);
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [downloadingCertId, setDownloadingCertId] = useState(null);

  // Profile & Password Forms
  const [profileForm, setProfileForm] = useState({
    name: user?.name || 'Learner',
    phone: user?.phone || '',
    email: user?.email || '',
  });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookRes, payRes, revRes, meRes] = await Promise.all([
        getMyBookings().catch(() => ({ data: { bookings: [] } })),
        getMyPayments().catch(() => ({ data: { payments: [] } })),
        getReviewableSchools().catch(() => ({ data: { reviewable: [] } })),
        getMe().catch(() => ({ data: { user: null } })),
      ]);

      if (bookRes.data?.bookings) {
        setBookings(bookRes.data.bookings);
      }
      if (payRes.data?.payments) {
        setPayments(payRes.data.payments);
      }
      if (revRes.data?.reviewable) {
        setReviewableSchools(revRes.data.reviewable);
      }
      if (meRes.data?.user) {
        setWalletBalance(meRes.data.user.walletBalance ?? 15);
        setProfileForm((prev) => ({
          ...prev,
          name: meRes.data.user.name || prev.name,
          phone: meRes.data.user.phone || prev.phone,
          email: meRes.data.user.email || prev.email,
        }));
      }
    } catch (err) {
      console.error('Failed to load learner dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Live background polling every 10s for bookings and status changes
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fast polling (every 3s) when Q&A chat modal is open to receive instructor replies in real-time
  useEffect(() => {
    if (!commentModalBooking) return;
    const chatInterval = setInterval(async () => {
      try {
        const res = await getUpdates(commentModalBooking.id);
        if (res.data?.updates) {
          setBookingComments(res.data.updates);
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3500);
    return () => clearInterval(chatInterval);
  }, [commentModalBooking]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Find primary active course and upcoming lesson
  const activeBooking = useMemo(() => {
    return bookings.find((b) => b.status === 'confirmed' || b.status === 'pending') || bookings[0] || null;
  }, [bookings]);

  const upcomingLesson = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const upcoming = bookings.filter((b) => (b.status === 'confirmed' || b.status === 'pending') && (!b.bookedDate || b.bookedDate >= todayStr));
    return upcoming[0] || activeBooking;
  }, [bookings, activeBooking]);

  // Overall attendance and progress calculations from real DB
  const totalCompletedLessons = useMemo(() => {
    return bookings.reduce((acc, b) => acc + (b.attendance?.length || 0), 0);
  }, [bookings]);

  const activeAttendedCount = activeBooking?.attendance?.length || 0;
  const activeCourseDuration = activeBooking?.course?.durationDays || 28;
  const activeRemainingCount = Math.max(0, activeCourseDuration - activeAttendedCount);

  const evaluatedMilestones = useMemo(() => {
    return STANDARD_14_MILESTONES.map((m) => {
      const dbMilestone = (activeBooking?.milestones || []).find(
        (dbM) => dbM.milestoneNumber === m.index || dbM.milestoneIndex === m.index || dbM.title?.toLowerCase().includes(m.title.toLowerCase())
      );
      
      const isDone = activeBooking?.status === 'completed' || dbMilestone?.isCompleted || dbMilestone?.status === 'completed' || (activeAttendedCount >= m.index * 2);
      const isInProgress = !isDone && (dbMilestone?.status === 'in_progress' || activeAttendedCount >= (m.index * 2) - 1);
      
      return {
        ...m,
        isDone,
        isInProgress,
        notes: dbMilestone?.instructorNotes || null,
        completedAt: dbMilestone?.completedAt || null,
      };
    });
  }, [activeBooking, activeAttendedCount]);

  const clearedMilestonesCount = useMemo(() => {
    return evaluatedMilestones.filter((m) => m.isDone).length;
  }, [evaluatedMilestones]);
  const completedMilestonesCount = clearedMilestonesCount;

  const activeProgressPercent = activeBooking?.status === 'completed' || clearedMilestonesCount === 14
    ? 100
    : Math.max(
        Math.round((clearedMilestonesCount / 14) * 100),
        Math.min(100, Math.round((activeAttendedCount / activeCourseDuration) * 100))
      );

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'All') return bookings;
    if (bookingFilter === 'Upcoming') return bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending');
    if (bookingFilter === 'Completed') return bookings.filter((b) => b.status === 'completed');
    if (bookingFilter === 'Cancelled') return bookings.filter((b) => b.status === 'cancelled');
    return bookings;
  }, [bookings, bookingFilter]);

  // Handle Cancellation with Automated Wallet Refund
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this lesson booking? The paid fee will be automatically credited back to your DriveLearn Wallet.')) return;
    try {
      const res = await cancelBooking(bookingId);
      alert(res.data?.message || '✓ Booking cancelled and fee refunded to your wallet.');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  // Handle Reschedule Modal Open & Slot Loading
  const handleOpenRescheduleModal = async (booking) => {
    setRescheduleBookingTarget(booking);
    setSelectedSlotId('');
    setAvailableSlots([]);
    if (!booking.instructorId) {
      alert('No instructor assigned yet to reschedule slots for.');
      return;
    }
    setLoadingSlots(true);
    try {
      const res = await getAvailableSlotsForInstructor(booking.instructorId);
      setAvailableSlots(res.data?.slots || []);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to load open availability slots for instructor');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmReschedule = async (e) => {
    e.preventDefault();
    if (!rescheduleBookingTarget || !selectedSlotId) return;
    setRescheduling(true);
    try {
      await rescheduleBooking(rescheduleBookingTarget.id, selectedSlotId);
      alert('✓ Practical session rescheduled successfully to your chosen time slot!');
      setRescheduleBookingTarget(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reschedule slot');
    } finally {
      setRescheduling(false);
    }
  };

  // Handle Course Payment (Razorpay / Instant Wallet Deduct)
  const handlePayForBooking = async (booking) => {
    setPayingBookingId(booking.id);
    try {
      const orderRes = await createBookingOrder(booking.id);

      if (orderRes.data?.fullyCoveredByWallet) {
        const fee = orderRes.data.walletApplied || booking.course?.price || 0;
        if (window.confirm(`Use ₹${fee} from your DriveLearn Wallet (Current Balance: ₹${walletBalance}) to confirm enrollment in ${booking.course?.title || 'Driving Course'}?`)) {
          await confirmBookingWithWallet(booking.id);
          alert('✓ Booking confirmed successfully using your DriveLearn Wallet balance!');
          await loadData();
          setPayingBookingId(null);
          return;
        } else {
          setPayingBookingId(null);
          return;
        }
      }

      const { orderId, amount, currency, keyId } = orderRes.data;
      if (!orderId) {
        alert('Could not initialize payment order. Please try again.');
        setPayingBookingId(null);
        return;
      }

      await openRazorpayCheckout({
        key: keyId,
        amount: amount,
        currency: currency || 'INR',
        name: 'DriveLearn India',
        description: `Enrollment: ${booking.course?.title || 'Driving Course'}`,
        order_id: orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone,
        },
        onSuccess: async (response) => {
          try {
            await verifyBookingPayment({
              bookingId: booking.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('✓ Payment successful! Your course booking is now confirmed.');
            await loadData();
          } catch (err) {
            alert('Payment verification failed.');
          } finally {
            setPayingBookingId(null);
          }
        },
        onError: () => {
          alert('Payment was cancelled or failed.');
          setPayingBookingId(null);
        },
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to initiate course payment');
      setPayingBookingId(null);
    }
  };

  // Handle Download PDF Receipt
  const handleDownloadReceipt = async (bookingId) => {
    setDownloadingReceiptId(bookingId);
    try {
      await downloadReceipt(bookingId);
    } catch (err) {
      alert('Failed to download invoice receipt.');
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  // Handle Download Certificate
  const handleDownloadCertificate = async (bookingId) => {
    setDownloadingCertId(bookingId);
    try {
      await downloadCertificate(bookingId);
    } catch (err) {
      alert(err.response?.data?.error || 'Certificate is not ready yet. Please complete all practical sessions first.');
    } finally {
      setDownloadingCertId(null);
    }
  };

  // Handle Comments / Lesson Q&A
  const handleOpenCommentsModal = async (booking) => {
    setCommentModalBooking(booking);
    setBookingComments([]);
    setNewCommentText('');
    try {
      const res = await getUpdates(booking.id);
      setBookingComments(res.data?.updates || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentModalBooking || !newCommentText.trim()) return;
    setPostingComment(true);
    try {
      await postUpdate(commentModalBooking.id, newCommentText.trim());
      setNewCommentText('');
      const res = await getUpdates(commentModalBooking.id);
      setBookingComments(res.data?.updates || []);
      await loadData();
    } catch (err) {
      alert('Failed to post message to instructor');
    } finally {
      setPostingComment(false);
    }
  };

  // Handle Review Submission
  const handleOpenReviewModal = (school) => {
    setReviewModalTarget(school);
    setReviewForm({ rating: 5, comment: '' });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModalTarget) return;
    setSubmittingReview(true);
    try {
      await createReview({
        schoolId: reviewModalTarget.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      alert('✓ Thank you! Your verified review and rating have been published.');
      setReviewModalTarget(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    try {
      await updateProfile({ name: profileForm.name, phone: profileForm.phone });
      setProfileMsg({ type: 'success', text: '✓ Profile updated successfully!' });
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });
    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }
    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: 'success', text: '✓ Password updated successfully!' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.error || 'Failed to change password. Check your current password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  const completedCourses = bookings.filter((b) => b.status === 'completed');

  return (
    <div className="portal-layout">
      {/* Left Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-icon">🚗</div>
          <div className="portal-brand-text">
            <h3>DriveLearn India</h3>
            <span>LEARNER PORTAL</span>
          </div>
        </div>

        <div className="ps-section-title">Navigation</div>
        <button
          className={`ps-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span>📊</span> Dashboard
        </button>
        <button
          className={`ps-link ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <span>📅</span> My Bookings ({bookings.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <span>📈</span> Progress & Skills
        </button>
        <button
          className={`ps-link ${activeTab === 'find-schools' ? 'active' : ''}`}
          onClick={() => setActiveTab('find-schools')}
        >
          <span>🔍</span> Find Driving School
        </button>
        <button
          className={`ps-link ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span>💳</span> Payments & Wallet
        </button>
        <button
          className={`ps-link ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          <span>📜</span> Certificates {completedCourses.length > 0 && `(${completedCourses.length})`}
        </button>
        <button
          className={`ps-link ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <span>⭐</span> School Reviews {reviewableSchools.length > 0 && `(${reviewableSchools.length})`}
        </button>
        <button
          className={`ps-link ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>👤</span> Profile & Security
        </button>

        <button
          onClick={handleLogout}
          className="ps-link exit-link"
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="portal-main">
        {/* Topbar */}
        <div className="portal-topbar">
          <div>
            <h2>Welcome back, {(user?.name || 'Learner').split(' ')[0]}</h2>
            <div className="pt-sub">
              {activeBooking ? (
                <>Enrolled in <strong>{activeBooking.course?.title || 'Driving Course'}</strong> at {activeBooking.course?.school?.name || 'Driving Academy'}</>
              ) : (
                'Track your driving lessons, practical progress, and certificates in real time'
              )}
            </div>
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell
              onSelectNotification={(notif) => {
                const match = bookings.find(
                  (b) =>
                    (notif.message && notif.message.includes(`#${b.id}`)) ||
                    (notif.title && b.instructor?.user?.name && notif.title.includes(b.instructor.user.name))
                );
                if (match) {
                  handleOpenCommentsModal(match);
                } else if (bookings.length > 0) {
                  handleOpenCommentsModal(bookings[0]);
                }
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#FFFFFF',
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1.5px solid var(--line)',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              <span>🎁</span> Wallet: <span style={{ color: 'var(--teal)', fontFamily: 'var(--font-mono)' }}>₹{walletBalance}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="btn btn-outline btn-sm"
              style={{ background: '#FFFFFF' }}
              disabled={loading}
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 4 KPI Cards */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🚗</span>
                  <span className="kpi-trend">Active</span>
                </div>
                <div className="kpi-val" style={{ fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeBooking?.course?.title || 'No Course'}
                </div>
                <div className="kpi-label">{activeBooking?.course?.school?.name || 'Enroll in a course'}</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">📅</span>
                  <span className="kpi-trend">{activeProgressPercent}% Done</span>
                </div>
                <div className="kpi-val">{activeAttendedCount} / {activeCourseDuration}</div>
                <div className="kpi-label">Sessions Completed ({activeRemainingCount} Left)</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">⏱️</span>
                  <span className="kpi-trend">1 Hr/Session</span>
                </div>
                <div className="kpi-val">{activeAttendedCount} Hours</div>
                <div className="kpi-label">Practical Driving Time</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🎯</span>
                  <span className="kpi-trend">{activeProgressPercent >= 80 ? 'Test Ready' : 'In Training'}</span>
                </div>
                <div className="kpi-val" style={{ color: activeProgressPercent >= 80 ? '#2E7D32' : 'var(--primary)' }}>
                  {activeProgressPercent >= 80 ? 'RTO Eligible' : `${activeRemainingCount} to Mock Test`}
                </div>
                <div className="kpi-label">RTO License Readiness</div>
              </div>
            </div>

            {/* Upcoming Practical Lesson & 14-Module Curriculum Pipeline (Full Width) */}
            <div className="dash-card" style={{ marginBottom: '24px' }}>
              <div className="dash-card-head">
                <div>
                  <h3 style={{ margin: 0 }}>Upcoming Practical Training Session</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '12.5px', margin: 0 }}>
                    Next scheduled lesson with your certified instructor
                  </p>
                </div>
                {activeBooking && (
                  <button
                    onClick={() => setActiveTab('bookings')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '12px' }}
                  >
                    Manage Bookings →
                  </button>
                )}
              </div>

              {upcomingLesson ? (
                <div
                  style={{
                    background: 'var(--paper)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1.5px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)', fontWeight: 800, fontSize: '17px' }}>
                      📅 {upcomingLesson.bookedDate ? new Date(upcomingLesson.bookedDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Daily Batch'} · ⏰ {upcomingLesson.startTime ? `${upcomingLesson.startTime} - ${upcomingLesson.endTime || ''}` : '07:00 AM - 08:00 AM'}
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
                      {upcomingLesson.course?.title || 'Driving Training Session'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                      👤 Instructor: <strong>{upcomingLesson.instructor?.user?.name || upcomingLesson.course?.school?.instructors?.[0]?.user?.name || 'Assigned Instructor'}</strong> · 🚗 {upcomingLesson.course?.school?.vehicles?.[0]?.model || 'Academy Dual-Control Vehicle'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink)', marginTop: '3px' }}>
                      📍 Yard: {upcomingLesson.course?.school?.address || 'Main Training Facility'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                    <span className={`badge ${upcomingLesson.status === 'confirmed' ? 'badge-success' : upcomingLesson.status === 'completed' ? 'badge-neutral' : 'badge-warning'}`} style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                      ✓ {upcomingLesson.status.toUpperCase()}
                    </span>

                    {upcomingLesson.instructor?.user?.phone && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <a
                          href={`tel:${upcomingLesson.instructor.user.phone}`}
                          className="btn btn-outline btn-sm"
                          style={{ textDecoration: 'none', background: '#FFFFFF', padding: '4px 10px', fontSize: '12px' }}
                        >
                          📞 Call Instructor
                        </a>
                        <a
                          href={`https://wa.me/${upcomingLesson.instructor.user.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ textDecoration: 'none', background: '#E8F5E9', color: '#2E7D32', borderColor: '#A5D6A7', padding: '4px 10px', fontSize: '12px' }}
                        >
                          💬 WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚗</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>No Active Driving Course Enrolled</div>
                  <div style={{ fontSize: '13px', marginTop: '4px', maxWidth: '400px', margin: '4px auto 16px' }}>
                    Explore certified driving schools near you, compare RTO packages, and book your training slots.
                  </div>
                  <button onClick={() => setActiveTab('find-schools')} className="btn btn-primary btn-sm">
                    🔍 Browse Driving Schools →
                  </button>
                </div>
              )}

              {/* 14-Module Standardized Practical Curriculum Pipeline */}
              <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                      🎯 Practical Curriculum Pipeline (14 Modules · 28 Days)
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                      CMVR Form 5 standardized syllabus for complete RTO driving test mastery
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      background: clearedMilestonesCount === 14 ? '#DCFCE7' : 'var(--primary-tint)',
                      color: clearedMilestonesCount === 14 ? '#15803D' : 'var(--primary)',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      border: `1px solid ${clearedMilestonesCount === 14 ? '#86EFAC' : 'var(--primary)'}40`,
                    }}
                  >
                    ✓ {clearedMilestonesCount} of 14 Modules Cleared ({activeProgressPercent}%)
                  </span>
                </div>

                {/* Horizontal Scrollable 14-Step Progress Rail */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    overflowX: 'auto',
                    padding: '12px 4px 16px',
                    WebkitOverflowScrolling: 'touch',
                    marginBottom: '16px',
                  }}
                >
                  {evaluatedMilestones.map((m, mIdx) => (
                    <div key={m.index} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <div
                        title={`${m.title} (${m.days}) - ${m.isDone ? 'Cleared' : m.isInProgress ? 'In Progress' : 'Pending'}`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                        onClick={() => setActiveTab('progress')}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: m.isDone ? '#22C55E' : m.isInProgress ? '#F59E0B' : '#E2E8F0',
                            color: m.isDone || m.isInProgress ? '#FFFFFF' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: m.isDone ? '13px' : '11px',
                            fontWeight: 800,
                            fontFamily: 'var(--font-mono)',
                            boxShadow: m.isInProgress ? '0 0 0 4px rgba(245, 158, 11, 0.25)' : 'none',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {m.isDone ? '✓' : String(m.index).padStart(2, '0')}
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: m.isDone || m.isInProgress ? 700 : 500,
                            color: m.isDone ? '#15803D' : m.isInProgress ? '#B45309' : '#64748B',
                            marginTop: '4px',
                            whiteSpace: 'nowrap',
                            maxWidth: '52px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            textAlign: 'center',
                          }}
                        >
                          M{m.index}
                        </span>
                      </div>

                      {mIdx < evaluatedMilestones.length - 1 && (
                        <div
                          style={{
                            width: '16px',
                            height: '3px',
                            background: m.isDone ? '#22C55E' : '#E2E8F0',
                            margin: '0 2px 14px',
                            borderRadius: '2px',
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* 14-Sub-Course Grid Cards in Pipeline */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
                  {evaluatedMilestones.map((m) => (
                    <div
                      key={m.index}
                      style={{
                        background: m.isDone ? '#F0FDF4' : m.isInProgress ? '#FFFBEB' : '#FFFFFF',
                        border: m.isDone ? '1px solid #86EFAC' : m.isInProgress ? '1px solid #FCD34D' : '1px solid var(--line)',
                        borderRadius: '8px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        <span
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: m.isDone ? '#22C55E' : m.isInProgress ? '#F59E0B' : '#F1F5F9',
                            color: m.isDone || m.isInProgress ? '#FFFFFF' : '#64748B',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: m.isDone ? '12px' : '10.5px',
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {m.isDone ? '✓' : String(m.index).padStart(2, '0')}
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.title}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>
                            {m.days} · {m.shortDesc}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          color: m.isDone ? '#15803D' : m.isInProgress ? '#B45309' : '#64748B',
                          whiteSpace: 'nowrap',
                          flexShrink: 0,
                        }}
                      >
                        {m.isDone ? '✓ Cleared' : m.isInProgress ? '⏳ Active' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    View Full 14-Module Assessment & Feedback →
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom 2 Cards: Attendance Summary & Training Fleet (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Card 1: Attendance Summary */}
              <div className="dash-card" style={{ marginBottom: 0 }}>
                <h3 style={{ fontSize: '15px', marginBottom: '10px' }}>Live Training Attendance</h3>
                <div style={{ background: 'var(--paper)', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#2E7D32' }}>
                      {activeAttendedCount} Days
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Marked Present</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: activeRemainingCount === 0 ? '#2E7D32' : 'var(--orange)' }}>
                      {activeRemainingCount} Days
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Sessions Remaining</div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('progress')}
                  className="btn btn-outline btn-sm"
                  style={{ width: '100%', marginTop: '14px', background: '#FFFFFF' }}
                >
                  View Skill Milestones & Feedback →
                </button>
              </div>

              {/* Card 2: Academy Dual-Control Fleet & Training Circuit */}
              <div
                className="dash-card"
                style={{
                  marginBottom: 0,
                  background: '#FFFFFF',
                  border: '1.5px solid var(--line)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                      ACADEMY TRAINING FLEET
                    </span>
                    <span className="badge badge-verified" style={{ fontSize: '11px' }}>
                      ✓ RTO Dual-Control
                    </span>
                  </div>

                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>
                    {upcomingLesson?.course?.school?.vehicles?.[0]?.model || 'Certified Dual-Control Training Car'}
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '4px' }}>
                    📍 <strong>Training Yard:</strong> {upcomingLesson?.course?.school?.address || 'Certified Academy Circuit, City Center'}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '12px', marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Instructor: <strong style={{ color: 'var(--ink)' }}>{upcomingLesson?.instructor?.user?.name || 'Verified Trainer'}</strong>
                  </div>
                  <button
                    onClick={() => setActiveTab('find-schools')}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '11.5px', padding: '3px 8px' }}
                  >
                    Explore Schools →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY BOOKINGS (Interactive Management) */}
        {activeTab === 'bookings' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3 style={{ margin: 0 }}>All Your Lesson Bookings ({bookings.length})</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Manage lesson schedules, pay enrollment fees, reschedule slots, or cancel with instant wallet refund
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Upcoming', 'Completed', 'Cancelled'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setBookingFilter(f)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid var(--line)',
                      background: bookingFilter === f ? 'var(--primary)' : '#FFFFFF',
                      color: bookingFilter === f ? '#FFFFFF' : 'var(--ink)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Course & School</th>
                    <th style={{ textAlign: 'left' }}>Assigned Instructor</th>
                    <th style={{ textAlign: 'left' }}>Slot Date & Time</th>
                    <th style={{ textAlign: 'left' }}>Status</th>
                    <th style={{ textAlign: 'left' }}>Payment / Fee</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((b) => {
                      const isPaid = (b.payment && (b.payment.status === 'success' || b.payment.status === 'paid')) || b.paymentStatus === 'paid' || b.payment === 'Paid' || b.status === 'confirmed';
                      const isCancelled = b.status === 'cancelled';
                      const isCompleted = b.status === 'completed';

                      return (
                        <tr key={b.id}>
                          <td style={{ textAlign: 'left' }}>
                            <strong style={{ fontSize: '14.5px' }}>{b.course?.title || 'Driving Course'}</strong>
                            <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                              🏢 {b.course?.school?.name || 'Driving Academy'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>
                              {b.instructor?.user?.name || b.course?.school?.instructors?.[0]?.user?.name || 'Assigned Instructor'}
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                              🚗 {b.course?.school?.vehicles?.[0]?.model || 'Dual-Control Vehicle'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                            <span style={{ fontWeight: 700, color: 'var(--ink)' }}>
                              {b.startTime ? `${b.startTime} - ${b.endTime || ''}` : '07:00 AM - 08:00 AM'}
                            </span>
                            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                              {b.bookedDate ? new Date(b.bookedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Daily Batch'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : isCompleted ? 'badge-neutral' : isCancelled ? 'badge-danger' : 'badge-warning'}`}>
                              {b.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              ₹{Number(b.course?.price || 0).toLocaleString('en-IN')}
                            </div>
                            <span className={`badge ${isPaid ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '11px', marginTop: '2px' }}>
                              {isPaid ? '✓ Paid' : '⏳ Pending Payment'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                              {!isPaid && !isCancelled && (
                                <button
                                  onClick={() => handlePayForBooking(b)}
                                  disabled={payingBookingId === b.id}
                                  className="btn btn-sm"
                                  style={{ background: '#2E7D32', color: '#FFFFFF', padding: '4px 10px', fontSize: '12px' }}
                                >
                                  {payingBookingId === b.id ? 'Processing...' : '💳 Pay Now'}
                                </button>
                              )}

                              {!isCancelled && !isCompleted && (
                                <>
                                  <button
                                    onClick={() => handleOpenRescheduleModal(b)}
                                    title="Reschedule to another slot"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 8px', fontSize: '12px', background: '#FFFFFF' }}
                                  >
                                    🔄 Reschedule
                                  </button>
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    title="Cancel booking (instant wallet refund)"
                                    className="btn btn-outline btn-sm"
                                    style={{ color: 'var(--danger)', borderColor: 'var(--line)', padding: '4px 8px', fontSize: '12px' }}
                                  >
                                    ✕ Cancel
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => handleOpenCommentsModal(b)}
                                title="Chat with instructor & view comments"
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '12px', background: '#FFFFFF' }}
                              >
                                💬 Q&A
                              </button>

                              {isPaid && (
                                <button
                                  onClick={() => handleDownloadReceipt(b.id)}
                                  disabled={downloadingReceiptId === b.id}
                                  title="Download GST Invoice"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '12px', background: '#FFFFFF' }}
                                >
                                  📄 Invoice
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                        No bookings found under "{bookingFilter}". Browse schools to book your driving course!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PROGRESS & SKILLS */}
        {activeTab === 'progress' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px' }}>
            <div className="dash-card">
              <div className="dash-card-head">
                <div>
                  <h3 style={{ margin: 0 }}>Practical Driving Skills & Attendance Log</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    {activeBooking ? `${activeBooking.course?.title} · ${activeBooking.course?.school?.name}` : 'Course Progress'}
                  </p>
                </div>
              </div>

              {/* Progress Metrics Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--teal)' }}>{activeProgressPercent}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Overall Progress</div>
                </div>
                <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)' }}>{completedMilestonesCount} / 14</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Modules Cleared</div>
                </div>
                <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>{activeAttendedCount} / {activeCourseDuration}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Days Attended</div>
                </div>
                <div style={{ background: 'var(--paper)', padding: '14px', borderRadius: '10px', textAlign: 'center', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: activeRemainingCount === 0 ? '#2E7D32' : 'var(--orange)' }}>{activeRemainingCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 600 }}>Remaining Days</div>
                </div>
              </div>

              {/* 14-Module 28-Day Practical Curriculum Modules */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h4 style={{ fontSize: '15.5px', fontWeight: 800, margin: 0 }}>
                    🎯 28-Day Practical Curriculum (14 Modules · 2 Days Each)
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    Each sub-course module is evaluated and signed off by your certified instructor.
                  </div>
                </div>
                <span style={{ fontSize: '12px', background: 'var(--primary-tint)', color: 'var(--primary)', padding: '3px 10px', borderRadius: '999px', fontWeight: 700 }}>
                  CMVR Form 5 Compliant
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
                {evaluatedMilestones.map((m) => {
                  return (
                    <div
                      key={m.index}
                      style={{
                        background: m.isDone ? '#F0FDF4' : m.isInProgress ? '#FFFBEB' : '#FFFFFF',
                        border: m.isDone ? '1.5px solid #86EFAC' : m.isInProgress ? '1.5px solid #FCD34D' : '1px solid var(--line)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: m.isDone ? '#22C55E' : m.isInProgress ? '#F59E0B' : 'var(--line)',
                              color: m.isDone || m.isInProgress ? '#FFFFFF' : 'var(--muted)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 800,
                            }}
                          >
                            {m.isDone ? '✓' : String(m.index).padStart(2, '0')}
                          </span>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: m.isDone ? '#15803D' : m.isInProgress ? '#B45309' : 'var(--muted)', textTransform: 'uppercase' }}>
                              Module {String(m.index).padStart(2, '0')} · {m.days}
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)', marginTop: '1px' }}>
                              {m.title}
                            </div>
                          </div>
                        </div>

                        <div>
                          <span
                            className={`badge ${m.isDone ? 'badge-success' : m.isInProgress ? 'badge-warning' : 'badge-neutral'}`}
                            style={{ fontSize: '11px', fontWeight: 700 }}
                          >
                            {m.isDone ? '✓ Cleared' : m.isInProgress ? '⏳ In Progress' : '🔒 Pending'}
                          </span>
                        </div>
                      </div>

                      {m.shortDesc && (
                        <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '8px', paddingLeft: '38px', lineHeight: 1.5 }}>
                          {m.shortDesc}
                        </div>
                      )}

                      {m.notes && (
                        <div
                          style={{
                            marginTop: '8px',
                            marginLeft: '38px',
                            padding: '6px 12px',
                            background: 'rgba(0,0,0,0.03)',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: 'var(--ink)',
                            borderLeft: `3px solid ${m.isDone ? '#22C55E' : '#F59E0B'}`,
                          }}
                        >
                          👨‍🏫 <strong>Instructor Feedback:</strong> {m.notes}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Instructor Notes & Daily Attendance Log */}
            <div className="dash-card">
              <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>📜 Recorded Lesson Attendance Log</h3>
              {activeBooking?.attendance && activeBooking.attendance.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto' }}>
                  {activeBooking.attendance.map((att, idx) => (
                    <div
                      key={att.id || idx}
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        borderRadius: '10px',
                        padding: '14px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', fontFamily: 'var(--font-mono)' }}>
                          📅 {new Date(att.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {att.clockIn && (
                            <span style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              ⏱️ {new Date(att.clockIn).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                          <span className={`badge ${att.status === 'present' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10.5px' }}>
                            ✓ {att.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const noteText = att.notes || 'Practical driving practice successfully logged.';
                        const milestoneMatch = noteText.match(/^\[(?:Milestone:\s*)?([^\]]+)\]\s*(.*)$/);
                        if (milestoneMatch) {
                          const [, milestoneTitle, remainingNotes] = milestoneMatch;
                          return (
                            <div>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'var(--primary-tint)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                                <span>🎯</span> {milestoneTitle}
                              </div>
                              {remainingNotes && (
                                <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                                  {remainingNotes}
                                </div>
                              )}
                            </div>
                          );
                        }
                        return (
                          <div style={{ fontSize: '12.5px', color: 'var(--ink)' }}>
                            {noteText}
                          </div>
                        );
                      })()}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '6px' }}>📝</div>
                  <div>No session notes recorded yet.</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    As your instructor logs daily training sessions, your milestones and feedback will appear here.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FIND DRIVING SCHOOLS */}
        {activeTab === 'find-schools' && (
          <div>
            <SearchSchools />
          </div>
        )}

        {/* TAB 5: PAYMENTS & WALLET */}
        {activeTab === 'payments' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3 style={{ margin: 0 }}>Payments, Invoices & Wallet History</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Live payment records with official GST invoices and wallet discounts
                </p>
              </div>
              <button onClick={() => loadData()} className="btn btn-outline btn-sm" disabled={loading}>
                🔄 Refresh
              </button>
            </div>

            {/* Live Payment Summary Cards */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px' }}>
              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">💳</span></div>
                <div className="kpi-val">
                  ₹{payments.reduce((acc, p) => acc + (p.status === 'success' || p.status === 'paid' ? Number(p.amount) : 0), 0).toLocaleString('en-IN')}
                </div>
                <div className="kpi-label">Total Amount Paid</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">🎁</span></div>
                <div className="kpi-val" style={{ color: 'var(--teal)' }}>
                  ₹{payments.reduce((acc, p) => acc + Number(p.walletUsed || 0), 0).toLocaleString('en-IN')}
                </div>
                <div className="kpi-label">Total Wallet Discount Applied</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">💰</span></div>
                <div className="kpi-val" style={{ color: 'var(--teal)' }}>
                  ₹{walletBalance}
                </div>
                <div className="kpi-label">Active Wallet Balance</div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Order / Transaction</th>
                    <th style={{ textAlign: 'left' }}>Course & School</th>
                    <th style={{ textAlign: 'left' }}>Amount Paid</th>
                    <th style={{ textAlign: 'left' }}>Wallet Discount</th>
                    <th style={{ textAlign: 'left' }}>Date</th>
                    <th style={{ textAlign: 'left' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>GST Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length > 0 ? (
                    payments.map((p) => (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {p.razorpayOrderId ? p.razorpayOrderId.replace('order_', 'ORD-') : `TXN-${p.id.toString().padStart(5, '0')}`}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <strong>{p.booking?.course?.title || 'Driving Course'}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {p.booking?.course?.school?.name || 'Driving School'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          ₹{Number(p.amount).toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          {Number(p.walletUsed || 0) > 0 ? (
                            <span className="badge badge-success">
                              -₹{Number(p.walletUsed)} Wallet
                            </span>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>₹0</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span className={`badge ${p.status === 'success' || p.status === 'paid' ? 'badge-success' : p.status === 'refunded' ? 'badge-neutral' : 'badge-warning'}`}>
                            {p.status === 'success' ? '✓ Paid' : p.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {p.bookingId ? (
                            <button
                              onClick={() => handleDownloadReceipt(p.bookingId)}
                              disabled={downloadingReceiptId === p.bookingId}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
                            >
                              {downloadingReceiptId === p.bookingId ? '⏳ Downloading...' : '📄 Download PDF'}
                            </button>
                          ) : (
                            <span style={{ color: 'var(--muted)', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                        No payment records found. Enroll in a course to make payments with your ₹{walletBalance} wallet discount!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3 style={{ margin: 0 }}>Course Completion Certificates</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Download verified digital certificates of completion signed by RTO-certified driving academies
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {completedCourses.length > 0 ? (
                completedCourses.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #86EFAC',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '16px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          background: '#E8F5E9',
                          color: '#2E7D32',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                        }}
                      >
                        📜
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: 800 }}>
                          Certificate of Completion · {b.course?.title}
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                          🏢 Issued by <strong>{b.course?.school?.name}</strong> · Verified RTO Training Partner
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadCertificate(b.id)}
                      disabled={downloadingCertId === b.id}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '8px 18px', fontWeight: 700 }}
                    >
                      {downloadingCertId === b.id ? 'Generating...' : '📥 Download Official Certificate (PDF)'}
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '50px 24px', background: 'var(--paper)', borderRadius: '14px', border: '1px solid var(--line)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '14px' }}>📜</div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>No Completed Course Certificates Yet</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13.5px', maxWidth: '480px', margin: '8px auto 20px' }}>
                    Complete all practical sessions ({activeRemainingCount > 0 ? `${activeRemainingCount} sessions remaining` : 'upcoming lessons'}) to automatically unlock and download your verified RTO training certificate.
                  </p>
                  <button onClick={() => setActiveTab('progress')} className="btn btn-primary btn-sm">
                    View Course Progress →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: REVIEWS & RATINGS */}
        {activeTab === 'reviews' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3 style={{ margin: 0 }}>Rate & Review Driving Schools</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Share verified reviews of your training academy and instructors to help fellow learners
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {reviewableSchools.length > 0 ? (
                reviewableSchools.map((sch) => (
                  <div
                    key={sch.id}
                    style={{
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: 700 }}>{sch.name}</div>
                      <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                        📍 {sch.city}, {sch.state} · Completed Driving Training Program
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenReviewModal(sch)}
                      className="btn btn-primary btn-sm"
                    >
                      ⭐ Write Verified Review
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>No Pending Reviews</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    Once you complete lessons at a driving school, you will be invited to leave a verified rating here!
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="dash-card" style={{ maxWidth: '720px' }}>
            <div className="dash-card-head">
              <div>
                <h3 style={{ margin: 0 }}>Learner Profile & Security</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Update your contact details and manage your account password
                </p>
              </div>
            </div>

            {profileMsg.text && (
              <div style={{ background: profileMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE', color: profileMsg.type === 'success' ? '#2E7D32' : '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontWeight: 600, fontSize: '13px' }}>
                {profileMsg.text}
              </div>
            )}

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Full Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Phone Number</label>
                  <input
                    type="text"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px', background: 'var(--paper)' }}
                />
              </div>

              <button type="submit" className="btn btn-navy btn-sm" style={{ alignSelf: 'flex-start', padding: '8px 18px' }}>
                Save Profile Changes
              </button>
            </form>

            {/* Password Change Section */}
            <div style={{ marginTop: '28px', paddingTop: '22px', borderTop: '1px solid var(--line)' }}>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '15px' }}>🔐 Update Password</h4>
              <p style={{ color: 'var(--muted)', fontSize: '12.5px', margin: '0 0 14px 0' }}>
                Ensure your account is protected with a secure password
              </p>

              {passwordMsg.text && (
                <div style={{ background: passwordMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE', color: passwordMsg.type === 'success' ? '#2E7D32' : '#C62828', padding: '12px', borderRadius: '8px', marginBottom: '14px', fontWeight: 600, fontSize: '13px' }}>
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Min 6 characters"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter password"
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', padding: '8px 18px', marginTop: '4px' }}
                >
                  {savingPassword ? 'Updating...' : '🔒 Change Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: RESCHEDULE SLOT */}
        {rescheduleBookingTarget && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(16, 24, 32, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '520px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary)' }}>🔄 Reschedule Training Slot</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {rescheduleBookingTarget.course?.title} · Instructor: {rescheduleBookingTarget.instructor?.user?.name || 'Assigned'}
                  </div>
                </div>
                <button
                  onClick={() => setRescheduleBookingTarget(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmReschedule} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>
                    Select Available Open Slot:
                  </label>
                  {loadingSlots ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--muted)' }}>
                      Loading open slots...
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <select
                      value={selectedSlotId}
                      onChange={(e) => setSelectedSlotId(e.target.value)}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13px' }}
                      required
                    >
                      <option value="">-- Choose an open training slot --</option>
                      {availableSlots.map((s) => (
                        <option key={s.id} value={s.id}>
                          {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}: {s.startTime} - {s.endTime}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{ padding: '14px', background: '#FFF7ED', borderRadius: '8px', color: '#C2410C', fontSize: '12.5px' }}>
                      No alternative open slots currently available for this instructor.
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setRescheduleBookingTarget(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={rescheduling || !selectedSlotId}
                    className="btn btn-primary btn-sm"
                  >
                    {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: LESSON COMMENTS / Q&A */}
        {commentModalBooking && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(16, 24, 32, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '520px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>💬 Lesson Discussion & Feedback</h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Direct communication with your instructor for {commentModalBooking.course?.title}
                  </div>
                </div>
                <button
                  onClick={() => setCommentModalBooking(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Comments Feed */}
              <div style={{ maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', padding: '6px', background: '#F8FAFC', borderRadius: '10px' }}>
                {bookingComments.length > 0 ? (
                  bookingComments.map((c) => {
                    const isInstructor = c.authorRole === 'instructor' || c.user?.role === 'instructor';
                    const authorDisplayName = c.author?.name || c.user?.name || (isInstructor ? 'Instructor' : 'You');
                    const isMe = !isInstructor;

                    return (
                      <div
                        key={c.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '82%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                          <strong>{isInstructor ? `👨‍🏫 ${authorDisplayName} (Instructor)` : `🚗 You`}</strong> ·{' '}
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: isMe ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                            background: isMe ? 'var(--primary)' : '#FFFFFF',
                            color: isMe ? '#FFFFFF' : 'var(--ink)',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                            border: isMe ? 'none' : '1px solid var(--line)',
                            fontSize: '13px',
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                          }}
                        >
                          {c.message}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px 10px', fontSize: '13px' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>💬</div>
                    <div style={{ fontWeight: 600, color: 'var(--ink)' }}>No Messages Yet</div>
                    <div>Ask your instructor questions about clutch control, slot timings, or test prep!</div>
                  </div>
                )}
              </div>

              {/* Quick Suggestion Chips */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '12px', paddingBottom: '2px' }}>
                {[
                  'Hi, can we practice reverse parallel parking in next class?',
                  'I have a doubt regarding clutch bite point on inclines.',
                  'Will reach 5 mins early for the practical session!',
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setNewCommentText(chip)}
                    style={{
                      whiteSpace: 'nowrap',
                      fontSize: '11px',
                      background: 'var(--paper)',
                      border: '1px solid var(--line)',
                      borderRadius: '14px',
                      padding: '3px 8px',
                      cursor: 'pointer',
                      color: 'var(--ink-light)',
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Post Comment Form */}
              <form onSubmit={handlePostComment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Type your message... (Instructor will be notified)"
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--line)', borderRadius: '8px', fontSize: '13px' }}
                  required
                />
                <button
                  type="submit"
                  disabled={postingComment || !newCommentText.trim()}
                  className="btn btn-primary btn-sm"
                  style={{ padding: '10px 18px', fontWeight: 700 }}
                >
                  {postingComment ? 'Sending...' : '➤ Send'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: SUBMIT REVIEW */}
        {reviewModalTarget && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(16, 24, 32, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px',
            }}
          >
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                maxWidth: '480px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary)' }}>⭐ Write Verified Review</h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    School: <strong>{reviewModalTarget.name}</strong>
                  </div>
                </div>
                <button
                  onClick={() => setReviewModalTarget(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '6px' }}>Rating</label>
                  <select
                    value={reviewForm.rating}
                    onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars (Excellent Experience)</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                    <option value="3">⭐⭐⭐ 3 Stars (Average)</option>
                    <option value="2">⭐⭐ 2 Stars (Needs Improvement)</option>
                    <option value="1">⭐ 1 Star (Poor)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Your Feedback & Experience</label>
                  <textarea
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Tell other learners about the instructor's patience, vehicle condition, and training experience..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setReviewModalTarget(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn btn-primary btn-sm"
                  >
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default LearnerDashboard;
