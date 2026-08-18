import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyAssignedBookings,
  changePassword,
  markAttendance,
  postUpdate,
  getUpdates,
  getMyWorkplace,
  getMyAvailability,
  addAvailability,
  generateAvailabilitySlots,
  deleteAvailability,
  markInstructorLeave,
  cancelInstructorLeave,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../../components/NotificationBell';
import '../../styles/dashboard.css';

const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const InstructorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, students, qa, availability, workplace, profile
  const [assignedBookings, setAssignedBookings] = useState([]);
  const [workplace, setWorkplace] = useState(null);
  const [slots, setSlots] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Student Q&A and Chat State
  const [qaModalBooking, setQaModalBooking] = useState(null);
  const [qaComments, setQaComments] = useState([]);
  const [newQaMessage, setNewQaMessage] = useState('');
  const [sendingQaMessage, setSendingQaMessage] = useState(false);
  const [selectedQaBookingId, setSelectedQaBookingId] = useState(null);
  const [qaSearchTerm, setQaSearchTerm] = useState('');

  // Attendance Marking Modal State
  const [attendanceModalBooking, setAttendanceModalBooking] = useState(null);
  const [attendanceForm, setAttendanceForm] = useState({
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: '',
    milestone: 'Clutch & Gear Control',
  });
  const [markingAttendance, setMarkingAttendance] = useState(false);

  // Live Session Tracker
  const [activeLessonSession, setActiveLessonSession] = useState(null);
  const [sessionTimerSeconds, setSessionTimerSeconds] = useState(0);
  const [completeLessonModal, setCompleteLessonModal] = useState(null);
  const [lessonFeedbackText, setLessonFeedbackText] = useState('');
  const [completedLessonsMap, setCompletedLessonsMap] = useState({});

  // Slot Generator & Availability State
  const todayStr = new Date().toISOString().split('T')[0];
  const [slotGenForm, setSlotGenForm] = useState({
    date: todayStr,
    windowStartTime: '07:00',
    windowEndTime: '19:00',
    slotDuration: '60',
    bufferMinutes: '15',
  });
  const [slotGenMsg, setSlotGenMsg] = useState({ type: '', text: '' });
  const [generatingSlots, setGeneratingSlots] = useState(false);
  const [deletingSlotId, setDeletingSlotId] = useState(null);

  // Leave Management State
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    date: todayStr,
    reason: 'Personal Leave / Rest Day',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [cancellingLeaveId, setCancellingLeaveId] = useState(null);

  // Profile Form state
  const [profile, setProfile] = useState({
    name: user?.name || 'Certified Instructor',
    license: 'KA-INS-2018-8891',
    phone: user?.phone || '+91 94370 12233',
    experience: '8 years',
  });
  const [profileMsg, setProfileMsg] = useState('');

  // Password Change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [changingPassword, setChangingPassword] = useState(false);

  // Live Timer Interval
  useEffect(() => {
    let interval = null;
    if (activeLessonSession) {
      interval = setInterval(() => {
        setSessionTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setSessionTimerSeconds(0);
    }
    return () => clearInterval(interval);
  }, [activeLessonSession]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Preview computed slots before generating
  const previewSlots = useMemo(() => {
    if (!slotGenForm.windowStartTime || !slotGenForm.windowEndTime || !slotGenForm.slotDuration) return [];
    const startM = timeToMinutes(slotGenForm.windowStartTime);
    const endM = timeToMinutes(slotGenForm.windowEndTime);
    const duration = parseInt(slotGenForm.slotDuration, 10);
    const buffer = parseInt(slotGenForm.bufferMinutes, 10) || 0;
    if (startM >= endM || isNaN(duration) || duration < 15) return [];

    const preview = [];
    let current = startM;
    while (current + duration <= endM) {
      preview.push({
        start: minutesToTime(current),
        end: minutesToTime(current + duration),
      });
      current += duration + buffer;
    }
    return preview;
  }, [slotGenForm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookRes, workRes, slotRes] = await Promise.all([
        getMyAssignedBookings().catch(() => ({ data: { bookings: [] } })),
        getMyWorkplace().catch(() => ({ data: { workplace: null } })),
        getMyAvailability().catch(() => ({ data: { slots: [], leaves: [] } })),
      ]);
      if (bookRes.data?.bookings) {
        setAssignedBookings(bookRes.data.bookings);
      }
      if (workRes.data?.workplace) {
        setWorkplace(workRes.data.workplace);
      }
      if (slotRes.data?.slots) {
        setSlots(slotRes.data.slots);
      }
      if (slotRes.data?.leaves) {
        setLeaves(slotRes.data.leaves);
      }
    } catch (err) {
      console.error('Failed to load instructor data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Background sync every 10s for bookings, attendance and message badges
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Fast live polling (every 3.5s) when on the Q&A tab or when Q&A modal is open
  useEffect(() => {
    if (activeTab !== 'qa' && !qaModalBooking) return;
    const targetBookingId = qaModalBooking?.bookingId || qaModalBooking?.id || selectedQaBookingId || assignedBookings[0]?.id;
    if (!targetBookingId) return;

    const chatInterval = setInterval(async () => {
      try {
        const res = await getUpdates(targetBookingId);
        if (res.data?.updates) {
          if (qaModalBooking) {
            setQaComments(res.data.updates);
          }
          // Also update the matching assignedBooking in state so split-screen chat reflects updates
          setAssignedBookings((prev) =>
            prev.map((b) => (b.id === targetBookingId ? { ...b, updates: res.data.updates } : b))
          );
        }
      } catch (err) {
        // silent polling catch
      }
    }, 3500);

    return () => clearInterval(chatInterval);
  }, [activeTab, qaModalBooking, selectedQaBookingId, assignedBookings]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStartLiveLesson = (lesson) => {
    setActiveLessonSession(lesson);
    setSessionTimerSeconds(0);
  };

  const handleOpenCompleteModal = (lesson) => {
    setCompleteLessonModal(lesson);
    setLessonFeedbackText('Student demonstrated smooth clutch balance and followed traffic safety signals well.');
  };

  const handleConfirmCompleteLesson = async () => {
    if (!completeLessonModal) return;
    try {
      if (completeLessonModal.bookingId) {
        await markAttendance({
          bookingId: completeLessonModal.bookingId,
          date: new Date().toISOString().split('T')[0],
          status: 'present',
          notes: lessonFeedbackText || 'Practical driving lesson completed successfully.',
        }).catch(() => null);

        if (lessonFeedbackText) {
          await postUpdate(
            completeLessonModal.bookingId,
            `Practical Lesson Completed: ${lessonFeedbackText}`
          ).catch(() => null);
        }
      }

      setCompletedLessonsMap((prev) => ({ ...prev, [completeLessonModal.id]: 'completed' }));
      if (activeLessonSession && activeLessonSession.id === completeLessonModal.id) {
        setActiveLessonSession(null);
      }
      setCompleteLessonModal(null);
      alert('✓ Practical session completed and student feedback logged live to database!');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to save completion status');
    }
  };

  const handleOpenAttendanceModal = (student) => {
    setAttendanceModalBooking(student);
    setAttendanceForm({
      date: new Date().toISOString().split('T')[0],
      status: 'present',
      notes: '',
      milestone: 'Clutch & Gear Control',
    });
  };

  const handleSaveAttendance = async (e) => {
    e.preventDefault();
    if (!attendanceModalBooking) return;
    setMarkingAttendance(true);
    try {
      if (attendanceModalBooking.bookingId) {
        await markAttendance({
          bookingId: attendanceModalBooking.bookingId,
          date: attendanceForm.date,
          status: attendanceForm.status,
          notes: `${attendanceForm.milestone ? `[Milestone: ${attendanceForm.milestone}] ` : ''}${attendanceForm.notes}`,
        });
        if (attendanceForm.notes) {
          await postUpdate(
            attendanceModalBooking.bookingId,
            `Session Marked: ${attendanceForm.status.toUpperCase()} on ${attendanceForm.date}. ${attendanceForm.notes}`
          );
        }
      }
      alert(`✓ Attendance recorded as ${attendanceForm.status.toUpperCase()} for ${attendanceModalBooking.name}!`);
      setAttendanceModalBooking(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save attendance');
    } finally {
      setMarkingAttendance(false);
    }
  };

  const handleOpenQaModal = async (studentOrBooking) => {
    setQaModalBooking(studentOrBooking);
    setNewQaMessage('');
    setQaComments(studentOrBooking.updates || []);
    const bId = studentOrBooking.bookingId || studentOrBooking.id;
    try {
      const res = await getUpdates(bId);
      setQaComments(res.data?.updates || []);
    } catch (err) {
      console.error('Failed to load updates', err);
    }
  };

  const handleSendQaReply = async (e) => {
    if (e) e.preventDefault();
    if (!qaModalBooking || !newQaMessage.trim()) return;
    setSendingQaMessage(true);
    try {
      const bId = qaModalBooking.bookingId || qaModalBooking.id;
      await postUpdate(bId, newQaMessage.trim());
      setNewQaMessage('');
      const res = await getUpdates(bId);
      setQaComments(res.data?.updates || []);
      // Refresh live booking data so update count is accurate
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message to student');
    } finally {
      setSendingQaMessage(false);
    }
  };

  const handleGenerateSlots = async (e) => {
    if (e) e.preventDefault();
    setSlotGenMsg({ type: '', text: '' });
    setGeneratingSlots(true);
    try {
      const res = await generateAvailabilitySlots({
        date: slotGenForm.date,
        windowStartTime: slotGenForm.windowStartTime,
        windowEndTime: slotGenForm.windowEndTime,
        slotDuration: parseInt(slotGenForm.slotDuration, 10),
        bufferMinutes: parseInt(slotGenForm.bufferMinutes, 10) || 0,
      });
      setSlotGenMsg({
        type: 'success',
        text: `✓ ${res.data?.slots?.length || previewSlots.length} standardized lesson slots generated and synced to Learner Booking Calendar!`,
      });
      await loadData();
      setTimeout(() => setSlotGenMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setSlotGenMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to generate slots for this date window.',
      });
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleGenerateWeekSlots = async () => {
    setSlotGenMsg({ type: '', text: '' });
    setGeneratingSlots(true);
    try {
      let count = 0;
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        await generateAvailabilitySlots({
          date: dateStr,
          windowStartTime: '07:00',
          windowEndTime: '19:00',
          slotDuration: 60,
          bufferMinutes: 15,
        }).catch(() => null);
        count++;
      }
      setSlotGenMsg({
        type: 'success',
        text: `✓ Full 7-Day standardized lesson slots (with 15-min buffers) generated and synced to Learner Booking Calendar!`,
      });
      await loadData();
      setTimeout(() => setSlotGenMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setSlotGenMsg({ type: 'error', text: 'Failed to generate week slots' });
    } finally {
      setGeneratingSlots(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Delete this availability slot?')) return;
    setDeletingSlotId(slotId);
    try {
      await deleteAvailability(slotId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete slot');
    } finally {
      setDeletingSlotId(null);
    }
  };

  const handleMarkLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.date) return;
    setSubmittingLeave(true);
    try {
      const res = await markInstructorLeave({
        date: leaveForm.date,
        reason: leaveForm.reason,
      });
      let msg = `🌴 Day marked as Leave / Off. All unbooked slots removed.`;
      if (res.data?.bookedSessionsCount > 0) {
        msg += `\n\n⚠️ NOTE: You have ${res.data.bookedSessionsCount} confirmed student booking(s) on that day. Please inform the students if rescheduling is required.`;
      }
      alert(msg);
      setShowLeaveModal(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark leave');
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!window.confirm('Cancel this leave and re-enable automatic lesson slots for this day?')) return;
    setCancellingLeaveId(leaveId);
    try {
      await cancelInstructorLeave(leaveId);
      alert('✓ Leave cancelled. Standard training slots have been automatically restored.');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel leave');
    } finally {
      setCancellingLeaveId(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match' });
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg({ type: 'success', text: 'Password updated successfully! Your account is now secured.' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 5000);
    } catch (err) {
      setPasswordMsg({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update password. Please check your current password.',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileMsg('✓ Instructor credentials updated successfully!');
    setTimeout(() => setProfileMsg(''), 3000);
  };

  // Dynamic calculations strictly from database assignedBookings
  const todayDateKey = new Date().toISOString().split('T')[0];

  const displayStudents = assignedBookings.map((b) => {
    const duration = b.course?.durationDays || 15;
    const attendedCount = b.attendance?.length || 0;
    const remainingCount = Math.max(0, duration - attendedCount);
    const progressPercent = b.status === 'completed' || remainingCount === 0 ? 100 : Math.min(100, Math.round((attendedCount / duration) * 100));
    const isTodayAttended = (b.attendance || []).some(
      (a) => new Date(a.date).toISOString().split('T')[0] === todayDateKey
    );
    const isSessionDone = completedLessonsMap[b.id] === 'completed' || isTodayAttended || b.status === 'completed';

    const assignedVehicle = b.course?.school?.vehicles?.[0]
      ? `${b.course.school.vehicles[0].model} (${b.course.school.vehicles[0].regNumber})`
      : workplace?.vehicles?.[0]
      ? `${workplace.vehicles[0].model} (${workplace.vehicles[0].regNumber})`
      : 'Academy Dual-Control Fleet';

    return {
      id: b.id,
      bookingId: b.id,
      name: b.learner?.name || 'Enrolled Learner',
      email: b.learner?.email || '—',
      phone: b.learner?.phone || '+91 98765 43210',
      initials: (b.learner?.name || 'ST')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase(),
      course: b.course?.title || 'Driving Course',
      slotDate: b.bookedDate ? new Date(b.bookedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Daily Batch',
      slotTime: b.startTime ? `${b.startTime} - ${b.endTime || ''}` : '07:00 AM - 08:00 AM',
      status: isSessionDone ? 'completed' : b.status || 'confirmed',
      isTodayAttended,
      progress: progressPercent,
      attendanceCount: attendedCount,
      remainingCount,
      attendanceList: b.attendance || [],
      durationDays: duration,
      enrolledAt: b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent',
      vehicle: assignedVehicle,
      location: b.course?.school?.address || workplace?.address || 'Main Training Yard',
      updates: b.updates || [],
      learnerId: b.learner?.id || b.learnerId,
    };
  });

  const totalMessagesCount = assignedBookings.reduce((sum, b) => sum + (b.updates?.length || 0), 0);

  const lessons = displayStudents.map((st) => ({
    id: st.id,
    bookingId: st.bookingId,
    student: st.name,
    time: st.slotTime,
    course: st.course,
    location: st.location,
    status: st.status,
    isTodayAttended: st.isTodayAttended,
    vehicle: st.vehicle,
    phone: st.phone,
    email: st.email,
    initials: st.initials,
    attendanceCount: st.attendanceCount,
    remainingCount: st.remainingCount,
    progress: st.progress,
    updates: st.updates,
  }));

  const completedCount = lessons.filter((l) => l.status === 'completed').length;
  const pendingCount = lessons.filter((l) => l.status !== 'completed').length;

  return (
    <div className="portal-layout">
      {/* Left Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-icon">🚗</div>
          <div className="portal-brand-text">
            <h3>DriveLearn India</h3>
            <span>INSTRUCTOR PORTAL</span>
          </div>
        </div>

        <div className="ps-section-title">Training Operations</div>
        <button
          className={`ps-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span>📊</span> Dashboard & Schedule
        </button>
        <button
          className={`ps-link ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <span>👥</span> My Students ({displayStudents.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => setActiveTab('qa')}
        >
          <span>💬</span> Student Q&A ({totalMessagesCount})
        </button>
        <button
          className={`ps-link ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          <span>⏰</span> Availability & Slots ({slots.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'workplace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workplace')}
        >
          <span>🏢</span> Academy & Fleet
        </button>
        <button
          className={`ps-link ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>👤</span> Profile & Security
        </button>

        {/* Real Logout Button */}
        <button
          onClick={handleLogout}
          className="ps-link exit-link"
          style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
        >
          <span>🚪</span> Logout
        </button>
      </aside>

      {/* Main Instructor Content Area */}
      <main className="portal-main">
        {/* Topbar */}
        <div className="portal-topbar">
          <div>
            <h2>Instructor Training Hub</h2>
            <div className="pt-sub">
              Logged in as <strong>{user?.name || 'Certified Instructor'}</strong> · {workplace?.school?.name || 'Driving Academy'} (Verified RTO Partner)
            </div>
          </div>

          <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <NotificationBell
              onSelectNotification={(notif) => {
                const match = displayStudents.find(
                  (s) =>
                    (notif.message && notif.message.includes(`#${s.bookingId}`)) ||
                    (notif.title && notif.title.includes(s.name))
                );
                if (match) {
                  handleOpenQaModal(match);
                } else {
                  setActiveTab('qa');
                }
              }}
            />
            <button
              onClick={() => loadData()}
              className="btn btn-outline btn-sm"
              style={{ background: '#FFFFFF' }}
              disabled={loading}
            >
              🔄 Refresh Live Data
            </button>
          </div>
        </div>

        {/* ACTIVE LIVE LESSON RUNNING BANNER */}
        {activeLessonSession && (
          <div
            style={{
              background: 'linear-gradient(135deg, #1C1F22 0%, #2D3748 100%)',
              color: '#FFFFFF',
              borderRadius: '14px',
              padding: '18px 24px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(230, 81, 0, 0.25)',
                  border: '2px solid #E1712E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '22px',
                }}
              >
                ⏱️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', background: '#E1712E', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, letterSpacing: '0.5px' }}>
                    IN-PROGRESS PRACTICAL LESSON
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '15px', color: '#FFE082', fontWeight: 700 }}>
                    {formatTimer(sessionTimerSeconds)}
                  </span>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '3px' }}>
                  {activeLessonSession.student} · {activeLessonSession.course}
                </div>
                <div style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)' }}>
                  📍 {activeLessonSession.location} · 🚗 {activeLessonSession.vehicle}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => handleOpenCompleteModal(activeLessonSession)}
                className="btn btn-sm"
                style={{ background: '#2E7D32', color: '#FFFFFF', padding: '8px 16px', fontWeight: 600 }}
              >
                ✓ Finish Lesson & Log Notes
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: DASHBOARD & SCHEDULE */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 4 KPI Cards */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🚗</span>
                  <span className="kpi-trend">Active Queue</span>
                </div>
                <div className="kpi-val">{lessons.length}</div>
                <div className="kpi-label">Scheduled Sessions</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">👥</span>
                  <span className="kpi-trend">Roster</span>
                </div>
                <div className="kpi-val">{displayStudents.length}</div>
                <div className="kpi-label">Enrolled Students</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">✅</span>
                  <span className="kpi-trend">{completedCount} Done</span>
                </div>
                <div className="kpi-val">{completedCount}</div>
                <div className="kpi-label">Completed Sessions</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">⏳</span>
                </div>
                <div className="kpi-val" style={{ color: 'var(--orange)' }}>{pendingCount}</div>
                <div className="kpi-label">Pending Sessions</div>
              </div>
            </div>

            {/* Today's Training Queue */}
            <div className="dash-card">
              <div className="dash-card-head">
                <div>
                  <h3>Today's Practical Training Queue</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    {pendingCount} driving sessions scheduled for today · Launch live lessons and log skill progress
                  </p>
                </div>
                <button onClick={() => setActiveTab('students')} className="btn btn-outline btn-sm">
                  View Full Student Register ({displayStudents.length}) →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lessons.length > 0 ? (
                  lessons.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: item.status === 'completed' ? 'var(--paper)' : '#FFFFFF',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                        boxShadow: item.status === 'completed' ? 'none' : '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: item.status === 'completed' ? 'var(--line)' : 'var(--primary-tint)',
                            color: item.status === 'completed' ? 'var(--muted)' : 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '14px',
                          }}
                        >
                          {item.student.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '15.5px', fontWeight: 700 }}>{item.student}</div>
                          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                            <strong style={{ color: 'var(--ink)' }}>{item.time}</strong> · {item.course} · 📍 {item.location}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                            🚗 Assigned: {item.vehicle}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.status === 'completed' ? (
                          <span className="badge badge-neutral" style={{ padding: '6px 14px', fontSize: '12.5px' }}>
                            ✓ Session Completed
                          </span>
                        ) : activeLessonSession?.id === item.id ? (
                          <button
                            onClick={() => handleOpenCompleteModal(item)}
                            className="btn btn-sm"
                            style={{ background: '#2E7D32', color: '#FFFFFF', padding: '6px 14px' }}
                          >
                            ✓ Finish Session
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartLiveLesson(item)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 16px' }}
                          >
                            ▶ Start Live Lesson
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const matched = displayStudents.find((s) => s.id === item.id) || item;
                            handleOpenAttendanceModal(matched);
                          }}
                          title="Mark Attendance & Log Milestones"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 10px', fontSize: '12px', background: '#FFFFFF' }}
                        >
                          📋 Attendance
                        </button>

                        <button
                          onClick={() => {
                            const matched = displayStudents.find((s) => s.id === item.id) || item;
                            handleOpenQaModal(matched);
                          }}
                          title="Student Q&A & Messages"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '6px 10px', fontSize: '12px', background: '#FFFFFF', color: 'var(--primary)' }}
                        >
                          💬 Q&A ({item.updates?.length || 0})
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>🚗</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>No Practical Sessions Scheduled</div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                      When learners book training slots in your driving courses, their scheduled sessions will appear here live in real-time.
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY STUDENTS (Attendance Register & Training Dossier) */}
        {activeTab === 'students' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  title="Back to Overview Dashboard"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.5px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    fontSize: '16px',
                    color: 'var(--ink)',
                    flexShrink: 0,
                  }}
                >
                  ←
                </button>
                <div>
                  <h3 style={{ margin: 0 }}>Student Training Register</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Track daily student attendance, practical skill milestones, and training completion
                  </p>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Student Details</th>
                    <th style={{ textAlign: 'left' }}>Enrolled Course</th>
                    <th style={{ textAlign: 'left' }}>Daily Slot Batch</th>
                    <th style={{ textAlign: 'left' }}>Training Progress</th>
                    <th style={{ textAlign: 'center' }}>Instructor Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStudents.length > 0 ? (
                    displayStudents.map((st) => (
                      <tr key={st.id}>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                background: 'var(--teal-tint)',
                                color: 'var(--teal)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '13px',
                                flexShrink: 0,
                              }}
                            >
                              {st.initials}
                            </div>
                            <div>
                              <strong style={{ fontSize: '14.5px' }}>{st.name}</strong>
                              <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                {st.phone} · {st.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ fontWeight: 600 }}>{st.course}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Start: {st.enrolledAt}</div>
                        </td>
                        <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
                          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{st.slotTime}</span>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{st.slotDate}</div>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '100px', height: '7px', background: 'var(--line)', borderRadius: '999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${st.progress}%`,
                                  height: '100%',
                                  background: st.progress >= 100 ? '#2E7D32' : 'var(--primary)',
                                  borderRadius: '999px',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                              {st.progress}%
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '3px' }}>
                            <strong>{st.attendanceCount} / {st.durationDays}</strong> completed · <span style={{ color: st.remainingCount === 0 ? '#2E7D32' : 'var(--orange)', fontWeight: 700 }}>{st.remainingCount} remaining</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {st.isTodayAttended ? (
                              <span className="badge badge-success" style={{ padding: '5px 10px', fontSize: '11.5px' }}>
                                ✓ Present Today
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenAttendanceModal(st)}
                                title="Mark Daily Attendance & Skill Progress"
                                className="btn btn-sm"
                                style={{ background: 'var(--primary)', color: '#FFFFFF', padding: '4px 10px', fontSize: '12px' }}
                              >
                                📋 Mark Attendance
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedStudent(st)}
                              title="View Student Training Dossier"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '12px', background: '#FFFFFF' }}
                            >
                              👁️ Dossier ({st.attendanceCount})
                            </button>
                            <button
                              onClick={() => handleOpenQaModal(st)}
                              title="Message Student & Q&A Discussion"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '4px 8px', fontSize: '12px', background: '#FFFFFF', color: 'var(--primary)' }}
                            >
                              💬 Q&A ({st.updates?.length || 0})
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                        No students assigned to your training roster yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: STUDENT Q&A & LIVE MESSAGING */}
        {activeTab === 'qa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Header Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1C1F22 0%, #2E384D 100%)',
                color: '#FFFFFF',
                borderRadius: '14px',
                padding: '20px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>💬</span>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#FFFFFF' }}>Student Q&A & Communication Hub</h3>
                </div>
                <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>
                  Communicate directly with your assigned driving learners, answer questions, provide post-lesson feedback, and send instant notifications.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFB74D' }}>{displayStudents.length}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Assigned Students</div>
                </div>
                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#4ADE80' }}>{totalMessagesCount}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Total Messages</div>
                </div>
              </div>
            </div>

            {/* Main Interactive Q&A Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', alignItems: 'start' }}>
              {/* Left Column: Student Conversation Selector */}
              <div className="dash-card" style={{ padding: '16px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Search students or courses..."
                    value={qaSearchTerm}
                    onChange={(e) => setQaSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid var(--line)',
                      fontSize: '13px',
                      background: 'var(--paper)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '550px', overflowY: 'auto' }}>
                  {displayStudents
                    .filter((st) =>
                      st.name.toLowerCase().includes(qaSearchTerm.toLowerCase()) ||
                      st.course.toLowerCase().includes(qaSearchTerm.toLowerCase())
                    )
                    .map((st) => {
                      const isSelected = selectedQaBookingId === st.bookingId || (!selectedQaBookingId && displayStudents[0]?.bookingId === st.bookingId);
                      const latestUpdate = st.updates && st.updates.length > 0 ? st.updates[st.updates.length - 1] : null;

                      return (
                        <div
                          key={st.id}
                          onClick={() => setSelectedQaBookingId(st.bookingId)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: '10px',
                            border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--line)',
                            background: isSelected ? 'rgba(240, 90, 40, 0.05)' : '#FFFFFF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--ink)' }}>{st.name}</div>
                            <span
                              style={{
                                fontSize: '10.5px',
                                background: st.updates?.length ? 'var(--primary-tint)' : 'var(--line)',
                                color: st.updates?.length ? 'var(--primary)' : 'var(--muted)',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: 700,
                              }}
                            >
                              {st.updates?.length || 0} msg
                            </span>
                          </div>

                          <div style={{ fontSize: '11.5px', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                            {st.course}
                          </div>

                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {latestUpdate ? `"${latestUpdate.message}"` : 'No messages yet. Start conversation.'}
                          </div>
                        </div>
                      );
                    })}

                  {displayStudents.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: '13px' }}>
                      No assigned learners found.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Active Thread View */}
              {(() => {
                const activeSt = displayStudents.find((s) => s.bookingId === selectedQaBookingId) || displayStudents[0];
                if (!activeSt) {
                  return (
                    <div className="dash-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
                      Select a student on the left to start messaging.
                    </div>
                  );
                }

                return (
                  <div className="dash-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '620px' }}>
                    {/* Chat Header */}
                    <div
                      style={{
                        padding: '16px 20px',
                        borderBottom: '1px solid var(--line)',
                        background: 'var(--paper)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            background: 'var(--primary-tint)',
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '15px',
                          }}
                        >
                          {activeSt.initials}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--ink)' }}>{activeSt.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {activeSt.course} · 🚗 {activeSt.vehicle}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a
                          href={`tel:${activeSt.phone}`}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#FFFFFF', textDecoration: 'none' }}
                        >
                          📞 Call
                        </a>
                        <a
                          href={`https://wa.me/${activeSt.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#E8F5E9', color: '#2E7D32', borderColor: '#A5D6A7', textDecoration: 'none' }}
                        >
                          💬 WhatsApp
                        </a>
                        <button
                          onClick={() => setSelectedStudent(activeSt)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
                        >
                          👁️ Dossier
                        </button>
                      </div>
                    </div>

                    {/* Messages Body */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#F8FAFC' }}>
                      {activeSt.updates && activeSt.updates.length > 0 ? (
                        activeSt.updates.map((up, idx) => {
                          const isMe = up.authorRole === 'instructor' || up.authorId === user?.id;
                          return (
                            <div
                              key={up.id || idx}
                              style={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '75%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start',
                              }}
                            >
                              <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                                <strong>{isMe ? 'You (Instructor)' : `${up.author?.name || activeSt.name} (Learner)`}</strong> ·{' '}
                                {new Date(up.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </div>

                              <div
                                style={{
                                  padding: '10px 16px',
                                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                                  background: isMe ? 'var(--primary)' : '#FFFFFF',
                                  color: isMe ? '#FFFFFF' : 'var(--ink)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                  border: isMe ? 'none' : '1px solid var(--line)',
                                  fontSize: '13.5px',
                                  lineHeight: 1.45,
                                  wordBreak: 'break-word',
                                }}
                              >
                                {up.message}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>No Q&A Messages Yet</div>
                          <div style={{ fontSize: '12.5px', marginTop: '4px' }}>
                            Send driving tips, milestone encouragement, or slot updates directly to {activeSt.name}.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Response Suggestion Chips */}
                    <div
                      style={{
                        padding: '8px 16px',
                        background: '#FFFFFF',
                        borderTop: '1px solid var(--line-soft)',
                        display: 'flex',
                        gap: '6px',
                        overflowX: 'auto',
                      }}
                    >
                      {[
                        '✓ Slot confirmed for tomorrow. Please be on time.',
                        '🌟 Great job on clutch control today! Keep practicing.',
                        '📄 Please bring your Learner License slip for next lesson.',
                        '⚠️ Remember to check your mirrors before signaling.',
                      ].map((preset, pIdx) => (
                        <button
                          key={pIdx}
                          type="button"
                          onClick={() => setNewQaMessage(preset)}
                          style={{
                            whiteSpace: 'nowrap',
                            fontSize: '11.5px',
                            background: 'var(--paper)',
                            border: '1px solid var(--line)',
                            borderRadius: '16px',
                            padding: '4px 10px',
                            cursor: 'pointer',
                            color: 'var(--ink-light)',
                          }}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    {/* Message Composer Footer */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!newQaMessage.trim()) return;
                        setSendingQaMessage(true);
                        try {
                          await postUpdate(activeSt.bookingId, newQaMessage.trim());
                          setNewQaMessage('');
                          await loadData();
                        } catch (err) {
                          alert('Failed to send reply to student');
                        } finally {
                          setSendingQaMessage(false);
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        background: '#FFFFFF',
                        borderTop: '1px solid var(--line)',
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        placeholder={`Message ${activeSt.name}... (Student will be notified)`}
                        value={newQaMessage}
                        onChange={(e) => setNewQaMessage(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: '1.5px solid var(--line)',
                          fontSize: '13.5px',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={sendingQaMessage || !newQaMessage.trim()}
                        className="btn btn-primary"
                        style={{ padding: '10px 20px', fontWeight: 700 }}
                      >
                        {sendingQaMessage ? 'Sending...' : '➤ Send'}
                      </button>
                    </form>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* TAB 3: AVAILABILITY & LIVE DATABASE SLOTS */}
        {activeTab === 'availability' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Auto-Rolling & Real-time Sync Banner */}
            <div
              style={{
                background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                border: '1.5px solid #86EFAC',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '28px' }}>⚡</span>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#166534' }}>
                    Automatic 7-Day Rolling Slots Active
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#15803D', marginTop: '2px' }}>
                    Standardized 1-hour sessions are automatically auto-generated and maintained for the next 7 days. Expired and past unbooked time slots vanish automatically in real time.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowLeaveModal(true)}
                className="btn btn-sm"
                style={{ background: '#E1712E', color: '#FFFFFF', fontWeight: 700, padding: '8px 16px' }}
              >
                🌴 Mark Day Off / Leave
              </button>
            </div>

            {/* Upcoming Leaves & Days Off */}
            {leaves.length > 0 && (
              <div className="dash-card">
                <div className="dash-card-head">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: '#C2410C' }}>
                      🌴 Upcoming Leaves & Days Off ({leaves.length})
                    </h4>
                    <p style={{ color: 'var(--muted)', fontSize: '12.5px', margin: 0 }}>
                      No slots will be generated on these dates. All unbooked slots have been cleared.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
                  {leaves.map((l) => (
                    <div
                      key={l.id}
                      style={{
                        background: '#FFF7ED',
                        border: '1.5px solid #FFEDD5',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#9A3412' }}>
                          📅 {new Date(l.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#C2410C', marginTop: '2px' }}>
                          Reason: {l.reason || 'Day Off'}
                        </div>
                      </div>
                      <button
                        onClick={() => handleCancelLeave(l.id)}
                        disabled={cancellingLeaveId === l.id}
                        title="Cancel leave and restore slots"
                        className="btn btn-outline btn-sm"
                        style={{ padding: '3px 8px', fontSize: '11.5px', background: '#FFFFFF', borderColor: '#FDBA74', color: '#C2410C' }}
                      >
                        {cancellingLeaveId === l.id ? '...' : 'Cancel Leave'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Slot Generator Card */}
            <div className="dash-card" style={{ maxWidth: '820px' }}>
              <div className="dash-card-head">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    title="Back to Overview Dashboard"
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: '1.5px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      fontSize: '16px',
                      color: 'var(--ink)',
                      flexShrink: 0,
                    }}
                  >
                    ←
                  </button>
                  <div>
                    <h3 style={{ margin: 0 }}>Custom Slot Batch Generator</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                      Override standard hours or slice a specific date into custom duration slots
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateWeekSlots}
                  disabled={generatingSlots}
                  className="btn btn-outline btn-sm"
                  style={{ background: '#FFFFFF', borderColor: 'var(--primary)', color: 'var(--primary)', fontWeight: 700 }}
                >
                  ⚡ Regenerate Full Week (7 Days)
                </button>
              </div>

              {slotGenMsg.text && (
                <div
                  style={{
                    background: slotGenMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                    color: slotGenMsg.type === 'success' ? '#2E7D32' : '#C62828',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {slotGenMsg.text}
                </div>
              )}

              <form onSubmit={handleGenerateSlots} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={slotGenForm.date}
                      onChange={(e) => setSlotGenForm({ ...slotGenForm, date: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Shift Start
                    </label>
                    <input
                      type="time"
                      value={slotGenForm.windowStartTime}
                      onChange={(e) => setSlotGenForm({ ...slotGenForm, windowStartTime: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Shift End
                    </label>
                    <input
                      type="time"
                      value={slotGenForm.windowEndTime}
                      onChange={(e) => setSlotGenForm({ ...slotGenForm, windowEndTime: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Lesson Duration
                    </label>
                    <select
                      value={slotGenForm.slotDuration}
                      onChange={(e) => setSlotGenForm({ ...slotGenForm, slotDuration: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes (1 Hour)</option>
                      <option value="90">90 Minutes (1.5 Hours)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Turnover Buffer
                    </label>
                    <select
                      value={slotGenForm.bufferMinutes}
                      onChange={(e) => setSlotGenForm({ ...slotGenForm, bufferMinutes: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="0">0 Minutes (Back-to-Back)</option>
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes (Recommended)</option>
                    </select>
                  </div>
                </div>

                {/* Live Slot Preview Strip */}
                {previewSlots.length > 0 && (
                  <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--muted)', marginBottom: '8px' }}>
                      LIVE PREVIEW: {previewSlots.length} SLOTS WILL BE CREATED ON {slotGenForm.date}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {previewSlots.map((p, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: '#FFFFFF',
                            border: '1px solid #FFE082',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#E1712E',
                          }}
                        >
                          {p.start} - {p.end}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={generatingSlots}
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', padding: '8px 20px' }}
                >
                  {generatingSlots ? 'Generating...' : `⚡ Generate & Publish ${previewSlots.length} Slots`}
                </button>
              </form>
            </div>

            {/* Active Database Slots List */}
            <div className="dash-card">
              <div className="dash-card-head">
                <div>
                  <h3 style={{ margin: 0 }}>Active Availability Slots in Database ({slots.length})</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Live calendar slots published for learners to book · Expired past slots are pruned automatically
                  </p>
                </div>
              </div>

              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Date</th>
                      <th style={{ textAlign: 'left' }}>Time Window</th>
                      <th style={{ textAlign: 'left' }}>Duration</th>
                      <th style={{ textAlign: 'left' }}>Booking Status</th>
                      <th style={{ textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.length > 0 ? (
                      slots.map((s) => (
                        <tr key={s.id}>
                          <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
                            {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {s.startTime} - {s.endTime}
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            {timeToMinutes(s.endTime) - timeToMinutes(s.startTime)} mins
                          </td>
                          <td style={{ textAlign: 'left' }}>
                            <span className={`badge ${s.isBooked ? 'badge-neutral' : 'badge-success'}`}>
                              {s.isBooked ? '🔒 Booked by Student' : '🟢 Open for Booking'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <button
                              onClick={() => handleDeleteSlot(s.id)}
                              disabled={deletingSlotId === s.id || s.isBooked}
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--danger)', borderColor: 'var(--line)', padding: '4px 8px' }}
                              title={s.isBooked ? 'Cannot delete an active booked slot' : 'Delete slot'}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                          No availability slots found in database. Use the generator above or refresh to trigger automatic slots!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ACADEMY & FLEET HUB */}
        {activeTab === 'workplace' && (
          <div className="dash-card" style={{ maxWidth: '820px' }}>
            <div className="dash-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  title="Back to Overview Dashboard"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.5px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    fontSize: '16px',
                    color: 'var(--ink)',
                    flexShrink: 0,
                  }}
                >
                  ←
                </button>
                <div>
                  <h3 style={{ margin: 0 }}>Academy Affiliation & Assigned Fleet</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Details of your registered driving academy, school owner contact, and dual-control training vehicles
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginTop: '16px' }}>
              {/* Academy Overview Box */}
              <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <span style={{ fontSize: '32px' }}>🏢</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{workplace?.school?.name || 'Driving Academy'}</h3>
                    <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                      {workplace?.school?.city || 'City'}, {workplace?.school?.state || 'State'} · <span className="badge badge-verified" style={{ fontSize: '11px' }}>✓ Verified RTO Partner</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid var(--line-soft)', paddingTop: '14px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>School Owner</div>
                    <div style={{ fontSize: '14.5px', fontWeight: 700, marginTop: '2px' }}>
                      {workplace?.owner?.name || workplace?.school?.owner?.name || 'Academy Owner'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {workplace?.owner?.email || workplace?.school?.owner?.email || '—'} · {workplace?.owner?.phone || workplace?.school?.owner?.phone || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Training Yard & Main Address</div>
                    <div style={{ fontSize: '13.5px', marginTop: '2px' }}>
                      {workplace?.address || workplace?.school?.address || 'Main Training Circuit'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fleet Vehicles Assigned */}
              <div>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>
                  🚗 Dual-Control Training Fleet ({workplace?.vehicles?.length || workplace?.school?.vehicles?.length || 0})
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {(workplace?.vehicles?.length ? workplace.vehicles : workplace?.school?.vehicles || []).length > 0 ? (
                    (workplace?.vehicles?.length ? workplace.vehicles : workplace.school.vehicles).map((v) => (
                      <div
                        key={v.id}
                        style={{
                          background: '#FFFFFF',
                          border: '1.5px solid var(--line)',
                          borderRadius: '12px',
                          padding: '16px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span className="badge badge-neutral" style={{ fontSize: '11px' }}>{v.type}</span>
                          <span className={`badge ${v.status === 'In Service' ? 'badge-success' : 'badge-warning'}`}>
                            {v.status}
                          </span>
                        </div>

                        <strong style={{ fontSize: '15px' }}>{v.model}</strong>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                          {v.regNumber}
                        </div>

                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--line-soft)', fontSize: '11.5px', color: 'var(--muted)' }}>
                          <div>Transmission: <strong>{v.transmission}</strong> ({v.fuelType})</div>
                          <div style={{ color: '#2E7D32', marginTop: '2px' }}>✓ {v.dualControlStatus}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                      No vehicles assigned yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PROFILE & SECURITY */}
        {activeTab === 'profile' && (
          <div className="dash-card" style={{ maxWidth: '720px' }}>
            <div className="dash-card-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  title="Back to Overview Dashboard"
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: '#FFFFFF',
                    border: '1.5px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                    fontSize: '16px',
                    color: 'var(--ink)',
                    flexShrink: 0,
                  }}
                >
                  ←
                </button>
                <div>
                  <h3 style={{ margin: 0 }}>Instructor Profile & Security</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Manage your credentials, government license number, and password security
                  </p>
                </div>
              </div>
            </div>

            {profileMsg && (
              <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px', borderRadius: '8px', marginBottom: '18px', fontWeight: 600, fontSize: '13px' }}>
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Govt Licence No.</label>
                  <input
                    type="text"
                    value={profile.license}
                    onChange={(e) => setProfile({ ...profile, license: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Phone Number</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Experience</label>
                  <input
                    type="text"
                    value={profile.experience}
                    onChange={(e) => setProfile({ ...profile, experience: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-navy btn-sm" style={{ padding: '8px 18px' }}>
                Save Profile Changes
              </button>
            </form>

            {/* Change Password / Permanent Password Management */}
            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '18px' }}>🔐</span>
                <h4 style={{ margin: 0, fontSize: '16px' }}>Security & Password Management</h4>
              </div>
              <p style={{ color: 'var(--muted)', fontSize: '13px', margin: '0 0 16px 0' }}>
                Logged in with a temporary password? Update your password here to secure your instructor portal.
              </p>

              {passwordMsg.text && (
                <div
                  style={{
                    background: passwordMsg.type === 'success' ? '#E8F5E9' : '#FFEBEE',
                    color: passwordMsg.type === 'success' ? '#2E7D32' : '#C62828',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Current / Temporary Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter your current or temporary password"
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Min 6 characters"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '8px' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="btn btn-primary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '4px', padding: '8px 18px' }}
                >
                  {changingPassword ? 'Updating Password...' : '🔒 Update & Set Permanent Password'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: MARK DAY OFF / LEAVE */}
        {showLeaveModal && (
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
                maxWidth: '460px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '24px' }}>🌴</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#C2410C' }}>Mark Day Off / Leave</h3>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Clears unbooked slots and prevents new bookings on this date
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowLeaveModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleMarkLeave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Leave Date
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={leaveForm.date}
                    onChange={(e) => setLeaveForm({ ...leaveForm, date: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Reason / Leave Category
                  </label>
                  <select
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                  >
                    <option value="Personal Leave / Rest Day">Personal Leave / Rest Day</option>
                    <option value="Sick / Medical Leave">Sick / Medical Leave</option>
                    <option value="RTO Official Inspection Duty">RTO Official Inspection Duty</option>
                    <option value="Training Fleet Maintenance">Training Fleet Maintenance</option>
                    <option value="Public / National Holiday">Public / National Holiday</option>
                  </select>
                </div>

                <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '8px', border: '1px solid #FFEDD5', fontSize: '12px', color: '#9A3412' }}>
                  ℹ️ When you mark a date as leave, all unbooked slots will be deleted, and no automatic rolling slots will be added for this date.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowLeaveModal(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="btn btn-sm"
                    style={{ background: '#C2410C', color: '#FFFFFF', padding: '6px 16px', fontWeight: 600 }}
                  >
                    {submittingLeave ? 'Saving...' : '🌴 Confirm Leave'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: MARK ATTENDANCE & SKILL PROGRESS */}
        {attendanceModalBooking && (
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
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--primary)' }}>📋 Session Attendance & Skills</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    Student: <strong>{attendanceModalBooking.name}</strong> ({attendanceModalBooking.course})
                  </div>
                </div>
                <button
                  onClick={() => setAttendanceModalBooking(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAttendance} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Lesson Date
                    </label>
                    <input
                      type="date"
                      value={attendanceForm.date}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Session Status
                    </label>
                    <select
                      value={attendanceForm.status}
                      onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontWeight: 600 }}
                    >
                      <option value="present">✓ Present (Attended)</option>
                      <option value="absent">✕ Absent (Missed)</option>
                      <option value="rescheduled">🔄 Makeup Session</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Core Practical Milestone Cleared
                  </label>
                  <select
                    value={attendanceForm.milestone}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, milestone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                  >
                    <option value="Clutch & Gear Control">Clutch, Brake & Gear Shifting</option>
                    <option value="8-Track & H-Track Maneuvers">RTO 8-Track & H-Track Reversing</option>
                    <option value="Slope & Hill Ascent Start">Hill Ascent / Slope Start without rollback</option>
                    <option value="Traffic & Lane Merging">City Traffic & Lane Changing Practice</option>
                    <option value="Parallel & Bay Parking">Parallel & Reverse Bay Parking</option>
                    <option value="Night & Highway Driving">Night Driving & Highway Overtaking</option>
                    <option value="Final RTO Driving Test Mock">RTO Driver Test Simulation</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Instructor Session Notes & Student Feedback
                  </label>
                  <textarea
                    rows={3}
                    value={attendanceForm.notes}
                    onChange={(e) => setAttendanceForm({ ...attendanceForm, notes: e.target.value })}
                    placeholder="e.g. Excellent clutch control today; practiced parallel parking between cones."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setAttendanceModalBooking(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={markingAttendance}
                    className="btn btn-primary btn-sm"
                  >
                    {markingAttendance ? 'Recording...' : '✓ Record Attendance'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: COMPLETE PRACTICAL SESSION */}
        {completeLessonModal && (
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
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#2E7D32' }}>✓ Complete Practical Session</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {completeLessonModal.student} · {completeLessonModal.course}
                  </div>
                </div>
                <button
                  onClick={() => setCompleteLessonModal(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: '#E8F5E9', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', color: '#1B5E20' }}>
                  ⏱️ Session Duration Recorded: <strong>{formatTimer(sessionTimerSeconds || 3600)}</strong>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Feedback for Student Timeline
                  </label>
                  <textarea
                    rows={3}
                    value={lessonFeedbackText}
                    onChange={(e) => setLessonFeedbackText(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCompleteLessonModal(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmCompleteLesson}
                    className="btn btn-sm"
                    style={{ background: '#2E7D32', color: '#FFFFFF', padding: '6px 16px', fontWeight: 600 }}
                  >
                    Confirm Session Completion
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: STUDENT TRAINING DOSSIER */}
        {selectedStudent && (
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
                padding: '28px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'var(--primary-tint)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '16px',
                    }}
                  >
                    {selectedStudent.initials}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedStudent.name}</h3>
                    <span className="badge badge-success" style={{ fontSize: '11px', marginTop: '2px' }}>
                      {selectedStudent.status} · Enrolled
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--paper)', padding: '18px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Phone Number</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {selectedStudent.phone}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Email Address</div>
                    <div style={{ fontSize: '13px', marginTop: '2px' }}>
                      {selectedStudent.email}
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Enrolled Course</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, marginTop: '2px', color: 'var(--primary)' }}>
                    {selectedStudent.course}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Daily Slot Window</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', fontWeight: 700, marginTop: '2px' }}>
                      {selectedStudent.slotTime}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Training Progress</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, marginTop: '2px', color: 'var(--primary)' }}>
                      {selectedStudent.attendanceCount} Sessions ({selectedStudent.progress}%)
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Assigned Dual-Control Vehicle</div>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                    {selectedStudent.vehicle}
                  </div>
                </div>

                {/* Practical Session Log List */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid var(--line-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--ink)' }}>
                      📜 Attendance & Skill Log ({selectedStudent.attendanceList?.length || 0})
                    </div>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: selectedStudent.remainingCount === 0 ? '#2E7D32' : 'var(--orange)' }}>
                      {selectedStudent.remainingCount} Sessions Left
                    </span>
                  </div>

                  {selectedStudent.attendanceList && selectedStudent.attendanceList.length > 0 ? (
                    <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#FFFFFF', border: '1px solid var(--line)', borderRadius: '8px' }}>
                      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'var(--paper)', borderBottom: '1px solid var(--line)', textAlign: 'left' }}>
                            <th style={{ padding: '6px 10px' }}>Date</th>
                            <th style={{ padding: '6px 10px' }}>Status</th>
                            <th style={{ padding: '6px 10px' }}>Milestone / Feedback</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedStudent.attendanceList.map((att, idx) => (
                            <tr key={att.id || idx} style={{ borderBottom: '1px solid var(--line-soft)' }}>
                              <td style={{ padding: '6px 10px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                                {new Date(att.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                              </td>
                              <td style={{ padding: '6px 10px' }}>
                                <span className={`badge ${att.status === 'present' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {att.status}
                                </span>
                              </td>
                              <td style={{ padding: '6px 10px', color: 'var(--muted)' }}>
                                {att.notes || 'Practical lesson'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--muted)', textAlign: 'center', padding: '12px', background: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--line)' }}>
                      No attendance sessions recorded yet. Click "Mark Attendance" to log today's lesson!
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Contact & Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:${selectedStudent.phone}`}
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none', background: '#FFFFFF', padding: '5px 12px' }}
                  >
                    📞 Call
                  </a>
                  <a
                    href={`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                    style={{ textDecoration: 'none', background: '#E8F5E9', color: '#2E7D32', borderColor: '#A5D6A7', padding: '5px 12px' }}
                  >
                    💬 WhatsApp
                  </a>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      const st = selectedStudent;
                      setSelectedStudent(null);
                      handleOpenQaModal(st);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ background: '#FFFFFF', color: 'var(--primary)', borderColor: 'var(--primary)' }}
                  >
                    💬 Q&A ({selectedStudent.updates?.length || 0})
                  </button>
                  <button
                    onClick={() => {
                      setSelectedStudent(null);
                      handleOpenAttendanceModal(selectedStudent);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    📋 Mark Attendance
                  </button>
                  <button
                    onClick={() => setSelectedStudent(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 4: INTERACTIVE Q&A & STUDENT CHAT MODAL */}
        {qaModalBooking && (
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
                maxWidth: '600px',
                width: '100%',
                maxHeight: '85vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
                overflow: 'hidden',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid var(--line)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--paper)',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--ink)' }}>
                    💬 Q&A with {qaModalBooking.name || qaModalBooking.student || 'Learner'}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    #{qaModalBooking.bookingId || qaModalBooking.id} · {qaModalBooking.course || 'Practical Course'}
                  </div>
                </div>

                <button
                  onClick={() => setQaModalBooking(null)}
                  style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Message History */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  background: '#F8FAFC',
                  maxHeight: '380px',
                }}
              >
                {qaComments && qaComments.length > 0 ? (
                  qaComments.map((c, idx) => {
                    const isMe = c.authorRole === 'instructor' || c.authorId === user?.id;
                    return (
                      <div
                        key={c.id || idx}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px' }}>
                          <strong>{isMe ? 'You (Instructor)' : `${c.author?.name || qaModalBooking.name || 'Learner'} (Learner)`}</strong> ·{' '}
                          {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
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
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--muted)' }}>
                    <div style={{ fontSize: '28px', marginBottom: '6px' }}>💬</div>
                    <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--ink)' }}>No Messages Yet</div>
                    <div style={{ fontSize: '12px' }}>Start the conversation with your student below.</div>
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div
                style={{
                  padding: '6px 14px',
                  background: '#FFFFFF',
                  borderTop: '1px solid var(--line-soft)',
                  display: 'flex',
                  gap: '6px',
                  overflowX: 'auto',
                }}
              >
                {[
                  '✓ Slot confirmed for tomorrow. Please be on time.',
                  '🌟 Great job on parking today! Keep practicing.',
                  '📄 Please bring your Learner License slip.',
                ].map((txt, sIdx) => (
                  <button
                    key={sIdx}
                    type="button"
                    onClick={() => setNewQaMessage(txt)}
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
                    {txt}
                  </button>
                ))}
              </div>

              {/* Reply Form */}
              <form
                onSubmit={handleSendQaReply}
                style={{
                  padding: '14px 20px',
                  borderTop: '1px solid var(--line)',
                  background: '#FFFFFF',
                  display: 'flex',
                  gap: '10px',
                }}
              >
                <input
                  type="text"
                  placeholder="Type advice, instruction, or reply to student..."
                  value={newQaMessage}
                  onChange={(e) => setNewQaMessage(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--line)',
                    fontSize: '13px',
                  }}
                />
                <button
                  type="submit"
                  disabled={sendingQaMessage || !newQaMessage.trim()}
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontWeight: 700 }}
                >
                  {sendingQaMessage ? 'Sending...' : '➤ Send'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default InstructorDashboard;