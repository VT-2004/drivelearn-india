import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LocationPicker from '../../components/LocationPicker';
import {
  getMySchool,
  updateSchool,
  getSchoolStats,
  getInstructors,
  addInstructor,
  deleteInstructor,
  getMyCourses,
  addCourse,
  deleteCourse,
  getSchoolBookings,
  cancelBooking,
  getMySubscription,
  createSubscriptionOrder,
  verifySubscriptionPayment,
  getSchoolAnalytics,
  getSchoolSchedule,
  getVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
  getSchoolNotifications,
  markNotificationRead,
  getMySchoolReviews,
} from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpayHelper';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const SchoolDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, students, instructors, vehicles, courses, schedule, payments, subscription, reviews, settings
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subStatus, setSubStatus] = useState('none');
  const [subscribing, setSubscribing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddInstructorModal, setShowAddInstructorModal] = useState(false);
  const [instructorForm, setInstructorForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'DL-Inst@2026',
    specialization: '4-Wheeler (Manual & Automatic)',
    experienceYears: '5',
    licenseNumber: '',
  });

  const handleGenerateTempPassword = () => {
    const pin = Math.floor(1000 + Math.random() * 9000);
    setInstructorForm((prev) => ({ ...prev, password: `DL-Inst@${pin}` }));
  };
  
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', price: '', durationDays: '15', description: '', instructorId: '' });

  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({
    regNumber: '',
    type: '4-Wheeler',
    model: '',
    transmission: 'Manual',
    fuelType: 'Petrol',
    dualControlStatus: 'Certified Dual-Control',
    instructorId: '',
    insuranceValidity: '2027-03-31',
    insurancePolicyNo: '',
    fitnessValidity: '2027-04-15',
    pucValidity: '2026-12-31',
    status: 'In Service',
  });
  const [selectedStudent, setSelectedStudent] = useState(null); // for student info modal
  const [selectedInstructor, setSelectedInstructor] = useState(null); // for instructor info modal
  const [selectedVehicle, setSelectedVehicle] = useState(null); // for vehicle dossier modal
  const [vehicles, setVehicles] = useState([]);

  // Schedule & Bookings Filters & View Mode
  const [bookingFilterStatus, setBookingFilterStatus] = useState('all'); // all, confirmed, pending, cancelled
  const [bookingFilterInstructor, setBookingFilterInstructor] = useState('all');
  const [bookingSearchQuery, setBookingSearchQuery] = useState('');
  const [scheduleViewMode, setScheduleViewMode] = useState('table'); // table, calendar

  // Learner Offers & Packages state (What School Owner publishes for Learners)
  const [learnerOffers, setLearnerOffers] = useState([
    {
      id: 'offer-1',
      title: '2-Wheeler ₹999 Campaign Launch Offer',
      vehicleType: '2-Wheeler',
      price: 999,
      durationDays: 15,
      badge: 'Save 50% · Launch Offer',
      badgeType: 'badge-orange',
      status: 'active',
      description: 'Comprehensive 2-Wheeler scooter & motorcycle balance training, RTO 8-track test preparation, and traffic road confidence.',
    },
    {
      id: 'offer-2',
      title: 'Complete 4-Wheeler License Pass',
      vehicleType: '4-Wheeler',
      price: 3999,
      durationDays: 20,
      badge: 'Most Popular',
      badgeType: 'badge-success',
      status: 'active',
      description: 'Dual-control manual/automatic car driving, slope start, reverse parking, and guaranteed RTO driving test sponsorship.',
    },
    {
      id: 'offer-3',
      title: 'VIP Unlimited Practice Subscription',
      vehicleType: 'All Vehicles',
      price: 1499,
      durationDays: 30,
      badge: 'VIP Membership',
      badgeType: 'badge-primary',
      status: 'active',
      description: 'Flexible weekend practice sessions for licensed drivers looking to master heavy city traffic and night highway overtakes.',
    },
    {
      id: 'offer-4',
      title: 'Highway & Night Pro Intensive',
      vehicleType: '4-Wheeler',
      price: 2499,
      durationDays: 7,
      badge: 'Specialist Pass',
      badgeType: 'badge-neutral',
      status: 'active',
      description: 'Advanced highway express driving, flyover lane switching, and night vision road safety with senior RTO instructors.',
    },
  ]);

  // Edit / Add Offer Modal state
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerForm, setOfferForm] = useState({
    title: '',
    vehicleType: '4-Wheeler',
    price: '',
    durationDays: '15',
    badge: 'Special Offer',
    description: '',
    status: 'active',
  });

  const handleOpenEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title,
      vehicleType: offer.vehicleType,
      price: offer.price,
      durationDays: offer.durationDays,
      badge: offer.badge,
      description: offer.description,
      status: offer.status,
    });
    setOfferModalOpen(true);
  };

  const handleOpenAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({
      title: '',
      vehicleType: '4-Wheeler',
      price: '',
      durationDays: '15',
      badge: 'Special Launch Offer',
      description: '',
      status: 'active',
    });
    setOfferModalOpen(true);
  };

  const handleSaveOffer = (e) => {
    e.preventDefault();
    if (!offerForm.title || !offerForm.price) return;
    if (editingOffer) {
      setLearnerOffers(
        learnerOffers.map((o) =>
          o.id === editingOffer.id
            ? { ...o, ...offerForm, price: parseFloat(offerForm.price), durationDays: parseInt(offerForm.durationDays) || 15 }
            : o
        )
      );
    } else {
      const newOffer = {
        id: `offer-${Date.now()}`,
        ...offerForm,
        price: parseFloat(offerForm.price),
        durationDays: parseInt(offerForm.durationDays) || 15,
        badgeType: 'badge-orange',
      };
      setLearnerOffers([...learnerOffers, newOffer]);
    }
    setOfferModalOpen(false);
    setEditingOffer(null);
  };

  const handleToggleOfferStatus = (id) => {
    setLearnerOffers(
      learnerOffers.map((o) =>
        o.id === id ? { ...o, status: o.status === 'active' ? 'inactive' : 'active' } : o
      )
    );
  };

  const handleDeleteOffer = (id) => {
    if (!window.confirm('Delete this learner offer package?')) return;
    setLearnerOffers(learnerOffers.filter((o) => o.id !== id));
  };

  // Settings & Profile
  const [profileData, setProfileData] = useState({ name: '', description: '', city: '', state: '', address: '' });
  const [location, setLocation] = useState(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  // Compliance Notifications & Warning Notices
  const [notifications, setNotifications] = useState([]);
  // Consolidated School Reviews & Ratings
  const [reviews, setReviews] = useState([]);

  const handleAcknowledgeNotice = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to acknowledge notification', err);
    }
  };

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [schoolRes, statsRes, instRes, coursesRes, bookingsRes, subRes, vehiclesRes, notifRes, reviewsRes] = await Promise.all([
        getMySchool().catch(() => ({ data: { school: null } })),
        getSchoolStats().catch(() => ({ data: { stats: null } })),
        getInstructors().catch(() => ({ data: { instructors: [] } })),
        getMyCourses().catch(() => ({ data: { courses: [] } })),
        getSchoolBookings().catch(() => ({ data: { bookings: [] } })),
        getMySubscription().catch(() => ({ data: { subscription: null, status: 'none' } })),
        getVehicles().catch(() => ({ data: { vehicles: [] } })),
        getSchoolNotifications().catch(() => ({ data: { notifications: [] } })),
        getMySchoolReviews().catch(() => ({ data: { reviews: [] } })),
      ]);

      if (schoolRes.data?.school) {
        setSchool(schoolRes.data.school);
        setProfileData({
          name: schoolRes.data.school.name,
          description: schoolRes.data.school.description || '',
          city: schoolRes.data.school.city,
          state: schoolRes.data.school.state,
          address: schoolRes.data.school.address,
        });
        if (schoolRes.data.school.latitude && schoolRes.data.school.longitude) {
          setLocation([schoolRes.data.school.latitude, schoolRes.data.school.longitude]);
        }
      }
      setStats(statsRes.data?.stats || null);
      setInstructors(instRes.data?.instructors || []);
      setCourses(coursesRes.data?.courses || []);
      setBookings(bookingsRes.data?.bookings || []);
      setSubscription(subRes.data?.subscription || null);
      setSubStatus(subRes.data?.status || 'none');
      setVehicles(vehiclesRes.data?.vehicles || []);
      setNotifications(notifRes.data?.notifications || []);
      setReviews(reviewsRes.data?.reviews || schoolRes.data?.school?.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateInstructor = async (e) => {
    e.preventDefault();
    if (!instructorForm.name || !instructorForm.email || !instructorForm.phone || !instructorForm.password) {
      alert('Please provide instructor full name, login email, phone number, and a temporary password.');
      return;
    }
    try {
      await addInstructor({
        name: instructorForm.name,
        email: instructorForm.email,
        phone: instructorForm.phone,
        password: instructorForm.password,
        specialization: instructorForm.specialization,
        experienceYears: parseInt(instructorForm.experienceYears) || 3,
      });
      const savedEmail = instructorForm.email;
      const savedPass = instructorForm.password;
      setShowAddInstructorModal(false);
      setInstructorForm({
        name: '',
        email: '',
        phone: '',
        password: 'DL-Inst@2026',
        specialization: '4-Wheeler (Manual & Automatic)',
        experienceYears: '5',
        licenseNumber: '',
      });
      await loadData();
      alert(`✅ Instructor onboarded successfully!\n\n📧 Login Email: ${savedEmail}\n🔑 Temporary Password: ${savedPass}\n\nPlease share these credentials with the instructor. They will use this password for initial login and can set their own private password anytime inside their Instructor Portal.`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add instructor');
    }
  };

  const handleDeleteInstructor = async (id) => {
    if (!window.confirm('Are you sure you want to remove this instructor?')) return;
    try {
      await deleteInstructor(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete instructor');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await addCourse({
        title: courseForm.title,
        price: parseFloat(courseForm.price),
        durationDays: parseInt(courseForm.durationDays),
        description: courseForm.description,
        instructorId: courseForm.instructorId ? parseInt(courseForm.instructorId) : undefined,
      });
      setShowAddCourseModal(false);
      setCourseForm({ title: '', price: '', durationDays: '15', description: '', instructorId: '' });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      await deleteCourse(id);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete course');
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.regNumber || !vehicleForm.model) return;
    try {
      await addVehicle({
        ...vehicleForm,
        instructorId: vehicleForm.instructorId ? parseInt(vehicleForm.instructorId) : null,
      });
      setShowAddVehicleModal(false);
      setVehicleForm({
        regNumber: '',
        type: '4-Wheeler',
        model: '',
        transmission: 'Manual',
        fuelType: 'Petrol',
        dualControlStatus: 'Certified Dual-Control',
        instructorId: '',
        insuranceValidity: '2027-03-31',
        insurancePolicyNo: '',
        fitnessValidity: '2027-04-15',
        pucValidity: '2026-12-31',
        status: 'In Service',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add vehicle');
    }
  };

  const handleToggleVehicleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'In Service' ? 'Maintenance' : 'In Service';
    try {
      await updateVehicle(id, { status: newStatus });
      await loadData();
      if (selectedVehicle && selectedVehicle.id === id) {
        setSelectedVehicle((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update vehicle status');
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from your academy fleet?')) return;
    try {
      await deleteVehicle(id);
      if (selectedVehicle && selectedVehicle.id === id) setSelectedVehicle(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete vehicle');
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this student booking?')) return;
    try {
      await cancelBooking(bookingId);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...profileData,
        latitude: location ? location[0] : undefined,
        longitude: location ? location[1] : undefined,
      };
      await updateSchool(payload);
      setSaveSuccessMsg('School profile updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 3500);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update school profile');
    }
  };

  const handleSubscribe = async (plan) => {
    setSubscribing(true);
    try {
      const orderRes = await createSubscriptionOrder(plan);
      const { orderId, amount, currency, keyId } = orderRes.data;

      openRazorpayCheckout(
        {
          key: keyId,
          amount,
          currency,
          name: 'DriveLearn India',
          description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} SaaS Subscription`,
          order_id: orderId,
          prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        },
        async (paymentResponse) => {
          try {
            await verifySubscriptionPayment({
              razorpayOrderId: paymentResponse.razorpay_order_id,
              razorpayPaymentId: paymentResponse.razorpay_payment_id,
              razorpaySignature: paymentResponse.razorpay_signature,
              plan,
            });
            await loadData();
            alert('🎉 Subscription activated successfully!');
          } catch (err) {
            console.error('Verification failed', err);
          }
        },
        () => { setSubscribing(false); }
      );
    } catch (err) {
      console.error('Subscription error', err);
      setSubscribing(false);
    }
  };

  const schoolDisplayName = school?.name || 'SafeDrive Motor Training School';

  return (
    <div className="portal-layout">
      {/* Left Crimson Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-icon">🚗</div>
          <div className="portal-brand-text">
            <h3>DriveLearn India</h3>
            <span>SCHOOL OWNER PORTAL</span>
          </div>
        </div>

        <div className="ps-section-title">Overview</div>
        <button
          className={`ps-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span>📊</span> Dashboard
        </button>

        <div className="ps-section-title">Operations</div>
        <button
          className={`ps-link ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <span>👥</span> Students ({bookings.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'instructors' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructors')}
        >
          <span>👨‍🏫</span> Instructors ({instructors.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'vehicles' ? 'active' : ''}`}
          onClick={() => setActiveTab('vehicles')}
        >
          <span>🚗</span> Vehicles Fleet ({vehicles.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'courses' ? 'active' : ''}`}
          onClick={() => setActiveTab('courses')}
        >
          <span>📚</span> Courses & Packages ({courses.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          <span>📅</span> Bookings & Schedule
        </button>

        <div className="ps-section-title">Business</div>
        <button
          className={`ps-link ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span>💳</span> Payments & Dues
        </button>
        <button
          className={`ps-link ${activeTab === 'subscription' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscription')}
        >
          <span>👑</span> Subscription {subStatus === 'active' && '✓'}
        </button>
        <button
          className={`ps-link ${activeTab === 'notices' ? 'active' : ''}`}
          onClick={() => setActiveTab('notices')}
          style={{ position: 'relative' }}
        >
          <span>🔔</span> Notices & Compliance
          {notifications.filter((n) => !n.isRead).length > 0 && (
            <span
              className="badge badge-orange"
              style={{ fontSize: '10px', padding: '1px 6px', marginLeft: 'auto' }}
            >
              {notifications.filter((n) => !n.isRead).length}
            </span>
          )}
        </button>
        <button
          className={`ps-link ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <span>⭐</span> Reviews & Ratings ({reviews.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span>⚙️</span> School Settings
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

      {/* Main Content Area */}
      <main className="portal-main">
        {/* Topbar */}
        <div className="portal-topbar">
          <div>
            <h2>{schoolDisplayName}</h2>
            <div className="pt-sub">
              {school?.verificationStatus === 'verified' ? '✓ Verified RTO Partner Academy' : '⏳ Application Under Review'} · {school?.city || 'India'}
            </div>
          </div>

          <div className="topbar-right">
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

        {/* COMPLIANCE ALERT 1: TEMPORARY SUSPENSION BANNER */}
        {school?.verificationStatus === 'suspended' && (
          <div
            style={{
              background: '#FFEBEE',
              border: '2px solid #D32F2F',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 4px 14px rgba(211,47,47,0.12)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '28px' }}>🛑</span>
              <div>
                <strong style={{ color: '#B71C1C', fontSize: '15px' }}>
                  Academy License Temporarily Suspended by Super Admin
                </strong>
                <div style={{ color: '#5F2120', fontSize: '13px', marginTop: '2px' }}>
                  {school.suspensionReason || 'Your academy is under compliance review. Public directory listings and new bookings are paused.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('notices')}
              className="btn btn-sm"
              style={{ background: '#D32F2F', color: '#FFFFFF', padding: '6px 14px' }}
            >
              Review Notice & Appeal →
            </button>
          </div>
        )}

        {/* COMPLIANCE ALERT 2: UNREAD OFFICIAL WARNING NOTICE */}
        {notifications.some((n) => !n.isRead && n.type === 'warning') && (
          <div
            style={{
              background: '#FFF8E1',
              border: '1.5px solid #FFE082',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '22px' }}>⚠️</span>
              <div>
                <strong style={{ color: '#E1712E', fontSize: '14.5px' }}>
                  Official Compliance Warning Notice Received
                </strong>
                <div style={{ color: '#795548', fontSize: '12.5px', marginTop: '1px' }}>
                  Super Admin issued a regulatory notice to your academy. Action required to maintain verified RTO status.
                </div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('notices')}
              className="btn btn-sm"
              style={{ background: '#E1712E', color: '#FFFFFF', padding: '5px 12px', fontSize: '12px' }}
            >
              Read Notice →
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 6 KPI Cards */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">👥</span></div>
                <div className="kpi-val">{bookings.length || 24}</div>
                <div className="kpi-label">Total Students</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">📅</span></div>
                <div className="kpi-val">{bookings.filter((b) => b.status === 'confirmed').length || 8}</div>
                <div className="kpi-label">Active Bookings</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">👨‍🏫</span></div>
                <div className="kpi-val">{instructors.length || 4}</div>
                <div className="kpi-label">Certified Instructors</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">📚</span></div>
                <div className="kpi-val">{courses.length || 3}</div>
                <div className="kpi-label">Active Courses</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">🚗</span></div>
                <div className="kpi-val">{vehicles.length}</div>
                <div className="kpi-label">Fleet Vehicles</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">⭐</span></div>
                <div className="kpi-val">{stats?.avgRating ? `★ ${stats.avgRating}` : '4.7'}</div>
                <div className="kpi-label">Academy Rating</div>
              </div>
            </div>

            {/* Quick Actions & Recent Bookings */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '24px' }}>
              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>Recent Student Bookings</h3>
                  <button onClick={() => setActiveTab('schedule')} className="btn btn-outline btn-sm">View all →</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookings.length > 0 ? (
                    bookings.slice(0, 5).map((b) => (
                      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line-soft)' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700 }}>{b.learner?.name || 'Learner'}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {b.course?.title} · {b.instructor?.user?.name || 'Instructor'}
                          </div>
                        </div>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-neutral'}`}>
                          {b.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '13.5px' }}>
                      No student bookings recorded in database yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="dash-card">
                <div className="dash-card-head">
                  <h3>Instructors On Duty</h3>
                  <button onClick={() => setActiveTab('instructors')} className="btn btn-outline btn-sm">Manage →</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {instructors.length > 0 ? (
                    instructors.map((ins) => (
                      <div key={ins.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line-soft)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>👨‍🏫</span>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{ins.user?.name}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{ins.specialization || 'Manual & Automatic'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setSelectedInstructor(ins)}
                            title="View Instructor Info"
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '11px', padding: '3px 8px', background: '#FFFFFF' }}
                          >
                            👁️ Info
                          </button>
                          <span className="badge badge-success">Active</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '13.5px' }}>
                      No instructors added yet. Add instructors to manage slots!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS */}
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
                  <h3>Enrolled Students</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Realtime student list from database bookings · Click 👁️ to view detailed student contact & info
                  </p>
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Student Name</th>
                    <th style={{ textAlign: 'left' }}>Enrolled Course</th>
                    <th style={{ textAlign: 'left' }}>Assigned Instructor</th>
                    <th style={{ textAlign: 'left' }}>Booking Date</th>
                    <th style={{ textAlign: 'left' }}>Status</th>
                    <th style={{ textAlign: 'center' }}>Student Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ textAlign: 'left' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-tint)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                flexShrink: 0,
                              }}
                            >
                              {b.learner?.name ? b.learner.name[0] : 'S'}
                            </div>
                            <strong style={{ fontSize: '14.5px' }}>{b.learner?.name || 'Student'}</strong>
                          </div>
                        </td>
                        <td style={{ textAlign: 'left' }}>{b.course?.title || 'Driving Course'}</td>
                        <td style={{ textAlign: 'left' }}>{b.instructor?.user?.name || 'Assigned Instructor'}</td>
                        <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
                          {b.bookedDate ? new Date(b.bookedDate).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : b.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedStudent(b)}
                            title="View Student Full Information"
                            className="btn btn-outline btn-sm"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
                              background: '#FFFFFF',
                            }}
                          >
                            👁️ View Info
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                        No enrolled students found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: INSTRUCTORS */}
        {activeTab === 'instructors' && (
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
                  <h3>Certified Driving Instructors</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Manage teaching staff and auto-generate daily training time slots
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddInstructorModal(true)} className="btn btn-primary btn-sm">
                + Add Instructor
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              {instructors.length > 0 ? (
                instructors.map((ins) => (
                  <div key={ins.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--primary-tint)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                        {ins.user?.name ? ins.user.name[0] : 'I'}
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: 700 }}>{ins.user?.name}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>{ins.user?.email} · {ins.user?.phone}</div>
                    <div style={{ fontSize: '13px', marginTop: '6px', fontWeight: 600, color: 'var(--ink)' }}>
                      {ins.specialization || 'Manual & Automatic'} · {ins.experienceYears ? `${ins.experienceYears} yrs exp` : 'Certified'}
                    </div>

                    <div style={{ marginTop: '16px', borderTop: '1px solid var(--line-soft)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedInstructor(ins)}
                        className="btn btn-outline btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFFFFF' }}
                      >
                        👁️ View Info
                      </button>
                      <button
                        onClick={() => handleDeleteInstructor(ins.id)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'var(--line)' }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  No instructors added yet. Click "+ Add Instructor" to onboard your staff!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: VEHICLES FLEET */}
        {activeTab === 'vehicles' && (
          <div>
            {/* Fleet KPI Metric Cards */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: '20px' }}>
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🚗</span>
                  <span className="kpi-trend">Academy Fleet</span>
                </div>
                <div className="kpi-val">{vehicles.length}</div>
                <div className="kpi-label">Total Vehicles</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🚙</span>
                  <span className="kpi-trend">Dual-Pedal</span>
                </div>
                <div className="kpi-val">{vehicles.filter((v) => v.type === '4-Wheeler').length}</div>
                <div className="kpi-label">4-Wheelers</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🛵</span>
                </div>
                <div className="kpi-val">{vehicles.filter((v) => v.type === '2-Wheeler').length}</div>
                <div className="kpi-label">2-Wheelers</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🟢</span>
                  <span className="kpi-trend" style={{ color: 'var(--teal)' }}>Active</span>
                </div>
                <div className="kpi-val" style={{ color: 'var(--teal)' }}>
                  {vehicles.filter((v) => v.status === 'In Service').length}
                </div>
                <div className="kpi-label">On-Road Training</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🔧</span>
                </div>
                <div className="kpi-val" style={{ color: 'var(--orange)' }}>
                  {vehicles.filter((v) => v.status !== 'In Service').length}
                </div>
                <div className="kpi-label">In Maintenance / Yard</div>
              </div>
            </div>

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
                    <h3>Vehicles Fleet Management</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                      Dual-control training vehicles, RTO fitness, insurance, and active trainer allocations
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowAddVehicleModal(true)} className="btn btn-primary btn-sm">
                  + Add Vehicle
                </button>
              </div>

              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Registration No.</th>
                      <th style={{ textAlign: 'left' }}>Type & Model</th>
                      <th style={{ textAlign: 'left' }}>Transmission & Fuel</th>
                      <th style={{ textAlign: 'left' }}>Dual-Control Setup</th>
                      <th style={{ textAlign: 'left' }}>Assigned Instructor</th>
                      <th style={{ textAlign: 'left' }}>Insurance & Fitness</th>
                      <th style={{ textAlign: 'left' }}>Status</th>
                      <th style={{ textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.length > 0 ? (
                      vehicles.map((v) => {
                        const insDate = v.insuranceValidity ? new Date(v.insuranceValidity) : null;
                        const isInsExpiring = insDate && (insDate - new Date()) / (1000 * 60 * 60 * 24) < 45;
                        return (
                          <tr key={v.id || v.regNumber}>
                            <td style={{ textAlign: 'left' }}>
                              <div
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 8px',
                                  background: '#FFF8E1',
                                  border: '1.5px solid #FFE082',
                                  borderRadius: '6px',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 800,
                                  fontSize: '13px',
                                  color: '#263238',
                                  letterSpacing: '0.5px',
                                }}
                              >
                                <span style={{ fontSize: '10px', color: '#B78103' }}>IND</span>
                                {v.regNumber}
                              </div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <strong>{v.model}</strong>
                              <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{v.type}</div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <span className="badge badge-neutral" style={{ fontSize: '11px', marginRight: '4px' }}>
                                {v.transmission || 'Manual'}
                              </span>
                              <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                                {v.fuelType || 'Petrol'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <span
                                className={`badge ${
                                  v.dualControlStatus?.includes('Certified') ? 'badge-success' : 'badge-neutral'
                                }`}
                                style={{ fontSize: '11px' }}
                              >
                                {v.dualControlStatus || 'Dual-Control'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              {v.instructor?.user?.name || v.instructor || 'Unassigned'}
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: isInsExpiring ? 'var(--danger)' : 'var(--success)' }}>
                                {isInsExpiring ? '⚠️ Expiring Soon' : '✓ Valid Insurance'}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                Fitness: {v.fitnessValidity ? new Date(v.fitnessValidity).toLocaleDateString('en-IN') : 'Valid'}
                              </div>
                            </td>
                            <td style={{ textAlign: 'left' }}>
                              <button
                                onClick={() => handleToggleVehicleStatus(v.id, v.status)}
                                className={`badge ${v.status === 'In Service' ? 'badge-success' : 'badge-warning'}`}
                                style={{ border: 'none', cursor: 'pointer', padding: '4px 10px' }}
                                title="Click to toggle between In Service and Maintenance"
                              >
                                {v.status === 'In Service' ? '● In Service' : '▲ Maintenance'}
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <button
                                  onClick={() => setSelectedVehicle(v)}
                                  title="View Vehicle Passport Dossier"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
                                >
                                  👁️ Info
                                </button>
                                <button
                                  onClick={() => handleDeleteVehicle(v.id)}
                                  title="Remove Vehicle"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--line)' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                          No fleet vehicles registered in database. Click "+ Add Vehicle" to register dual-control cars!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: COURSES & PACKAGES */}
        {activeTab === 'courses' && (
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
                  <h3>Driving Courses & Launch Offers</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Publish training packages, pricing, and 2-Wheeler ₹999 launch offers
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddCourseModal(true)} className="btn btn-primary btn-sm">
                + Create Course
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
              {courses.length > 0 ? (
                courses.map((c) => (
                  <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: '12px', padding: '20px', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '17px', color: 'var(--ink)' }}>{c.title}</h4>
                      <span className="badge badge-success">Active</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '6px 0 14px' }}>
                      Duration: {c.durationDays} days · {c.description || 'Comprehensive road training'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '14px' }}>
                      <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                        ₹{Number(c.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteCourse(c.id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)' }}
                    >
                      Delete Course
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  No courses published yet. Click "+ Create Course" to add packages!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: SCHEDULE & BOOKINGS */}
        {activeTab === 'schedule' && (() => {
          const filteredBookings = bookings.filter((b) => {
            const matchesStatus = bookingFilterStatus === 'all' || b.status === bookingFilterStatus;
            const matchesInstructor =
              bookingFilterInstructor === 'all' ||
              String(b.instructorId) === String(bookingFilterInstructor) ||
              b.instructor?.user?.name === bookingFilterInstructor;
            const query = bookingSearchQuery.toLowerCase().trim();
            const matchesQuery =
              !query ||
              (b.learner?.name && b.learner.name.toLowerCase().includes(query)) ||
              (b.course?.title && b.course.title.toLowerCase().includes(query)) ||
              (b.instructor?.user?.name && b.instructor.user.name.toLowerCase().includes(query));
            return matchesStatus && matchesInstructor && matchesQuery;
          });

          const timeSlots = [
            '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
            '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
          ];

          return (
            <div>
              {/* Top Schedule KPI Strip */}
              <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', marginBottom: '20px' }}>
                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-icon">📅</span>
                    <span className="kpi-trend">All Records</span>
                  </div>
                  <div className="kpi-val">{bookings.length}</div>
                  <div className="kpi-label">Total Bookings</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-icon">🟢</span>
                    <span className="kpi-trend" style={{ color: 'var(--teal)' }}>Active</span>
                  </div>
                  <div className="kpi-val" style={{ color: 'var(--teal)' }}>
                    {bookings.filter((b) => b.status === 'confirmed').length}
                  </div>
                  <div className="kpi-label">Confirmed Sessions</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-icon">🟡</span>
                  </div>
                  <div className="kpi-val" style={{ color: 'var(--orange)' }}>
                    {bookings.filter((b) => b.status === 'pending').length}
                  </div>
                  <div className="kpi-label">Pending Approval</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-icon">🔴</span>
                  </div>
                  <div className="kpi-val" style={{ color: 'var(--muted)' }}>
                    {bookings.filter((b) => b.status === 'cancelled').length}
                  </div>
                  <div className="kpi-label">Cancelled / Rescheduled</div>
                </div>

                <div className="kpi-card">
                  <div className="kpi-top">
                    <span className="kpi-icon">💰</span>
                  </div>
                  <div className="kpi-val" style={{ color: 'var(--primary)' }}>
                    ₹{bookings.reduce((sum, b) => sum + (b.status === 'confirmed' ? Number(b.course?.price || 0) : 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="kpi-label">Active Bookings Value</div>
                </div>
              </div>

              <div className="dash-card">
                {/* Header with Back Button and View Switcher */}
                <div className="dash-card-head" style={{ flexWrap: 'wrap', gap: '14px' }}>
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
                      <h3 style={{ margin: 0 }}>Bookings & Master Schedule</h3>
                      <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                        Realtime student training sessions, instructor dispatch, and slot allocations
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '8px', padding: '3px' }}>
                      <button
                        onClick={() => setScheduleViewMode('table')}
                        className={`btn btn-sm ${scheduleViewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '6px' }}
                      >
                        📋 Master Table
                      </button>
                      <button
                        onClick={() => setScheduleViewMode('calendar')}
                        className={`btn btn-sm ${scheduleViewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '6px' }}
                      >
                        📆 Daily Timetable
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    padding: '14px 20px',
                    borderBottom: '1px solid var(--line-soft)',
                    background: '#FAFAFB',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 240px', minWidth: '220px' }}>
                    <span style={{ color: 'var(--muted)' }}>🔍</span>
                    <input
                      type="text"
                      value={bookingSearchQuery}
                      onChange={(e) => setBookingSearchQuery(e.target.value)}
                      placeholder="Search student, course, or instructor..."
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '13px',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                      }}
                    />
                    {bookingSearchQuery && (
                      <button
                        onClick={() => setBookingSearchQuery('')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '14px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['all', 'confirmed', 'pending', 'cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setBookingFilterStatus(status)}
                          style={{
                            padding: '4px 10px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid',
                            borderColor: bookingFilterStatus === status ? 'var(--primary)' : 'var(--line)',
                            background: bookingFilterStatus === status ? 'var(--primary-tint)' : '#FFFFFF',
                            color: bookingFilterStatus === status ? 'var(--primary)' : 'var(--muted)',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                          }}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <select
                      value={bookingFilterInstructor}
                      onChange={(e) => setBookingFilterInstructor(e.target.value)}
                      style={{
                        padding: '5px 10px',
                        fontSize: '12.5px',
                        border: '1px solid var(--line)',
                        borderRadius: '6px',
                        background: '#FFFFFF',
                        color: 'var(--ink)',
                      }}
                    >
                      <option value="all">All Instructors</option>
                      {instructors.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.user?.name || 'Instructor'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* VIEW 1: MASTER TABLE VIEW */}
                {scheduleViewMode === 'table' && (
                  <div className="table-responsive">
                    <table className="dash-table">
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left' }}>Student</th>
                          <th style={{ textAlign: 'left' }}>Instructor</th>
                          <th style={{ textAlign: 'left' }}>Course</th>
                          <th style={{ textAlign: 'left' }}>Booked Slot</th>
                          <th style={{ textAlign: 'left' }}>Status</th>
                          <th style={{ textAlign: 'center' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredBookings.length > 0 ? (
                          filteredBookings.map((b) => (
                            <tr key={b.id}>
                              <td style={{ textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div
                                    style={{
                                      width: '28px',
                                      height: '28px',
                                      borderRadius: '50%',
                                      background: 'var(--primary-tint)',
                                      color: 'var(--primary)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '11px',
                                      fontWeight: 800,
                                      flexShrink: 0,
                                    }}
                                  >
                                    {b.learner?.name ? b.learner.name[0].toUpperCase() : 'S'}
                                  </div>
                                  <div>
                                    <strong>{b.learner?.name || 'Learner'}</strong>
                                    <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{b.learner?.email || ''}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                <div style={{ fontWeight: 600 }}>{b.instructor?.user?.name || 'Unassigned'}</div>
                                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                                  {vehicles.find((v) => v.instructorId === b.instructorId)?.model || 'Fleet Vehicle'}
                                </div>
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                <span className="badge badge-neutral" style={{ fontSize: '11px', marginRight: '4px' }}>
                                  {b.course?.title || 'Driving Course'}
                                </span>
                                {b.course?.price && (
                                  <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                                    ₹{Number(b.course.price).toLocaleString('en-IN')}
                                  </div>
                                )}
                              </td>
                              <td style={{ textAlign: 'left', fontFamily: 'var(--font-mono)' }}>
                                <div style={{ fontWeight: 600, fontSize: '13px' }}>
                                  {b.bookedDate ? new Date(b.bookedDate).toLocaleDateString('en-IN') : 'Recent'}
                                </div>
                                <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                                  🕒 {b.startTime || '09:00 AM'}
                                </div>
                              </td>
                              <td style={{ textAlign: 'left' }}>
                                <span
                                  className={`badge ${
                                    b.status === 'confirmed'
                                      ? 'badge-success'
                                      : b.status === 'pending'
                                      ? 'badge-warning'
                                      : 'badge-danger'
                                  }`}
                                >
                                  {b.status === 'confirmed' ? '✓ Confirmed' : b.status === 'pending' ? '▲ Pending' : '✕ Cancelled'}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    onClick={() => setSelectedStudent(b)}
                                    title="View Student Booking Dossier"
                                    className="btn btn-outline btn-sm"
                                    style={{ padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
                                  >
                                    👁️ Info
                                  </button>
                                  {b.status === 'pending' && (
                                    <button
                                      onClick={() => handleCancelBooking(b.id)}
                                      className="btn btn-outline btn-sm"
                                      style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--line)' }}
                                      title="Cancel Pending Request"
                                    >
                                      Cancel
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                              No bookings found matching your search and filter criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* VIEW 2: DAILY TIMETABLE GRID */}
                {scheduleViewMode === 'calendar' && (
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                      {timeSlots.map((slot) => {
                        const slotBookings = filteredBookings.filter((b) => {
                          const timeStr = b.startTime || '09:00 AM';
                          return timeStr.includes(slot.replace(' AM', '').replace(' PM', '')) || timeStr === slot;
                        });

                        return (
                          <div
                            key={slot}
                            style={{
                              border: '1px solid var(--line)',
                              borderRadius: '10px',
                              padding: '14px',
                              background: slotBookings.length > 0 ? '#FFFFFF' : '#FAFAFB',
                              boxShadow: slotBookings.length > 0 ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '14px' }}>🕒</span>
                                <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>{slot}</strong>
                              </div>
                              <span
                                className={`badge ${slotBookings.length > 0 ? 'badge-success' : 'badge-neutral'}`}
                                style={{ fontSize: '10.5px' }}
                              >
                                {slotBookings.length > 0 ? `${slotBookings.length} Session` : 'Available'}
                              </span>
                            </div>

                            {slotBookings.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {slotBookings.map((sb) => (
                                  <div
                                    key={sb.id}
                                    style={{
                                      background: 'var(--paper)',
                                      border: '1px solid var(--line-soft)',
                                      borderRadius: '8px',
                                      padding: '10px',
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <strong style={{ fontSize: '13px' }}>{sb.learner?.name || 'Learner'}</strong>
                                      <button
                                        onClick={() => setSelectedStudent(sb)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--primary)' }}
                                        title="View Details"
                                      >
                                        👁️
                                      </button>
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>
                                      📚 {sb.course?.title || 'Training'}
                                    </div>
                                    <div style={{ fontSize: '11.5px', color: 'var(--ink)', fontWeight: 600, marginTop: '2px' }}>
                                      👨‍🏫 {sb.instructor?.user?.name || 'Trainer'}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontStyle: 'italic', padding: '8px 0' }}>
                                Open slot for learner road practice
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 7: PAYMENTS */}
        {activeTab === 'payments' && (
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
                  <h3>Payments & Earnings Ledger</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Course enrollments revenue received via DriveLearn gateway
                  </p>
                </div>
              </div>
            </div>

            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '20px' }}>
              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">💰</span></div>
                <div className="kpi-val">
                  ₹{bookings.reduce((sum, b) => sum + (b.status === 'confirmed' || b.status === 'completed' ? Number(b.course?.price || 0) : 0), 0).toLocaleString('en-IN')}
                </div>
                <div className="kpi-label">Gross Course Enrollments</div>
              </div>
              <div className="kpi-card">
                <div className="kpi-top"><span className="kpi-icon">🛡️</span></div>
                <div className="kpi-val">{bookings.filter((b) => b.status === 'confirmed').length}</div>
                <div className="kpi-label">Paid Active Bookings</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: LEARNER PACKAGES, OFFERS & SAAS PLAN */}
        {activeTab === 'subscription' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* 1. DriveLearn SaaS Academy Plan (B2B SaaS) */}
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
                    <h3 style={{ margin: 0 }}>Academy Platform SaaS Subscription</h3>
                    <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                      Your academy's official license status with DriveLearn India National RTO Network
                    </p>
                  </div>
                </div>
                <span
                  className={`badge ${subStatus === 'active' ? 'badge-success' : 'badge-warning'}`}
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {subStatus === 'active' ? '🟢 Active Verified Partner' : '🟡 Standard Trial'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginTop: '14px' }}>
                <div style={{ background: 'var(--paper)', border: '1.5px solid var(--line)', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px' }}>Starter Academy Tier</h4>
                      <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '6px 0', color: 'var(--ink)' }}>
                        ₹999 <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>/month</span>
                      </div>
                    </div>
                  </div>
                  <ul style={{ fontSize: '12.5px', color: 'var(--muted)', paddingLeft: '16px', margin: '10px 0 16px' }}>
                    <li>Unlimited Course Bookings</li>
                    <li>Instructor Slots Scheduling</li>
                    <li>Automated GST Invoices</li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('monthly')}
                    disabled={subscribing || subStatus === 'active'}
                    className="btn btn-outline btn-sm btn-block"
                  >
                    {subStatus === 'active' ? '✓ Plan Active' : subscribing ? 'Processing...' : 'Subscribe Monthly'}
                  </button>
                </div>

                <div style={{ background: '#FFFDF9', border: '2px solid var(--primary)', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '-10px', right: '16px' }}>
                    <span className="badge badge-orange" style={{ fontSize: '10px' }}>RECOMMENDED · SAVE 25%</span>
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--primary)' }}>Annual Pro Partner Tier</h4>
                    <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-mono)', margin: '6px 0', color: 'var(--primary)' }}>
                      ₹8,999 <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>/year</span>
                    </div>
                  </div>
                  <ul style={{ fontSize: '12.5px', color: 'var(--ink)', paddingLeft: '16px', margin: '10px 0 16px' }}>
                    <li>Priority RTO Verified Search Ranking</li>
                    <li>Multi-Branch & Fleet Management</li>
                    <li>2-Wheeler ₹999 Campaign Spotlight</li>
                  </ul>
                  <button
                    onClick={() => handleSubscribe('yearly')}
                    disabled={subscribing || subStatus === 'active'}
                    className="btn btn-sm btn-block"
                    style={{ background: 'var(--primary)', color: '#FFFFFF' }}
                  >
                    {subStatus === 'active' ? '✓ Active Annual Partner' : subscribing ? 'Processing...' : 'Subscribe Yearly (₹8,999)'}
                  </button>
                </div>
              </div>
            </div>

            {/* 2. Learner Packages, Offers & Promotional Campaign Manager (What School Owner sets for Learners) */}
            <div className="dash-card">
              <div className="dash-card-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Learner Packages & Campaign Offer Manager</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Configure the packages, discounts, ₹999 campaign offers, and memberships available for learners to book
                  </p>
                </div>
                <button onClick={handleOpenAddOffer} className="btn btn-primary btn-sm">
                  + Create New Learner Offer
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginTop: '16px' }}>
                {learnerOffers.map((offer) => (
                  <div
                    key={offer.id}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '20px',
                      background: '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      opacity: offer.status === 'active' ? 1 : 0.65,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <span className="badge badge-neutral" style={{ fontSize: '10.5px', marginBottom: '4px' }}>
                            {offer.vehicleType}
                          </span>
                          <h4 style={{ margin: '2px 0 0 0', fontSize: '16px', color: 'var(--ink)' }}>{offer.title}</h4>
                        </div>
                        <span className={`badge ${offer.badgeType || 'badge-orange'}`} style={{ fontSize: '10.5px', flexShrink: 0 }}>
                          {offer.badge}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '12px 0 6px 0' }}>
                        <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
                          ₹{Number(offer.price).toLocaleString('en-IN')}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>/ {offer.durationDays} Days</span>
                      </div>

                      <p style={{ fontSize: '12.5px', color: 'var(--muted)', margin: '8px 0 16px 0', lineHeight: 1.45 }}>
                        {offer.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--line-soft)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        onClick={() => handleToggleOfferStatus(offer.id)}
                        className={`badge ${offer.status === 'active' ? 'badge-success' : 'badge-neutral'}`}
                        style={{ border: 'none', cursor: 'pointer', padding: '4px 10px' }}
                        title="Click to toggle active/inactive visibility for learners"
                      >
                        {offer.status === 'active' ? '● Published' : '⏸️ Inactive'}
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditOffer(offer)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#FFFFFF' }}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', color: 'var(--danger)', borderColor: 'var(--line)' }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 8.5: NOTICES & COMPLIANCE */}
        {activeTab === 'notices' && (
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
                  <h3 style={{ margin: 0 }}>Official Compliance & Regulatory Notices</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Official notices, regulatory warnings, and license updates issued by Super Admin
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      border: n.type === 'suspension' ? '1.5px solid #FFCDD2' : n.type === 'warning' ? '1.5px solid #FFE082' : '1px solid var(--line)',
                      background: n.type === 'suspension' ? '#FFF5F5' : n.type === 'warning' ? '#FFFDF5' : '#FFFFFF',
                      borderRadius: '12px',
                      padding: '18px 20px',
                      opacity: n.isRead ? 0.75 : 1,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>
                          {n.type === 'suspension' ? '🛑' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div>
                          <strong style={{ fontSize: '15px', color: n.type === 'suspension' ? '#B71C1C' : n.type === 'warning' ? '#E1712E' : 'var(--ink)' }}>
                            {n.title}
                          </strong>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleString('en-IN') : 'Recent'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`badge ${n.type === 'suspension' ? 'badge-danger' : n.type === 'warning' ? 'badge-orange' : 'badge-neutral'}`} style={{ fontSize: '11px' }}>
                          {n.type.toUpperCase()}
                        </span>
                        {!n.isRead && (
                          <button
                            onClick={() => handleAcknowledgeNotice(n.id)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '11.5px', padding: '3px 8px', background: '#FFFFFF' }}
                          >
                            ✓ Acknowledge
                          </button>
                        )}
                      </div>
                    </div>

                    <p style={{ fontSize: '13.5px', color: 'var(--ink)', margin: '12px 0 0 0', lineHeight: 1.5, background: '#FFFFFF', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
                      {n.message}
                    </p>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>✓</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>No Compliance Notices on Record</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Your driving academy is in good standing with RTO regulatory standards.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: REVIEWS */}
        {activeTab === 'reviews' && (
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
                  <h3>Student Reviews & Feedback</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Feedback submitted by learners upon completing driving courses
                  </p>
                </div>
              </div>
            </div>

            {/* Rating Summary Bar */}
            {reviews && reviews.length > 0 && (
              <div
                style={{
                  background: 'var(--paper)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#E1712E', lineHeight: 1 }}>
                    {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
                  </div>
                  <div style={{ fontSize: '13px', color: '#E1712E', marginTop: '4px' }}>★★★★★</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                    {reviews.length} Verified {reviews.length === 1 ? 'Review' : 'Reviews'}
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--line-soft)', paddingLeft: '20px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  Verified learner ratings and feedback automatically consolidated from course completions across all branches & instructors.
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {reviews && reviews.length > 0 ? (
                reviews.map((r) => {
                  const matchedBooking = bookings.find(
                    (b) => b.learnerId === r.learnerId || b.learner?.email === r.learner?.email
                  );
                  return (
                    <div
                      key={r.id}
                      style={{
                        background: '#FFFFFF',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        border: '1px solid var(--line)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              background: '#E8F5E9',
                              color: '#2E7D32',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                            }}
                          >
                            {(r.learner?.name || 'L').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <strong>{r.learner?.name || 'Verified Learner'}</strong>
                            <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                            </div>
                            {matchedBooking && (
                              <div style={{ fontSize: '11.5px', color: 'var(--primary)', marginTop: '2px', fontWeight: 600 }}>
                                👨‍🏫 Trained under: {matchedBooking.instructor?.user?.name || 'Academy Instructor'} · {matchedBooking.course?.title || 'Driving Course'}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ background: '#FFF8E1', padding: '4px 10px', borderRadius: '999px', border: '1px solid #FFE082', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ color: '#E1712E', fontWeight: 700, fontSize: '13px' }}>★ {r.rating}</span>
                          <span style={{ color: 'var(--muted)', fontSize: '11.5px' }}>/ 5</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '13.5px', color: 'var(--ink)', margin: '8px 0 0 0', lineHeight: 1.5, background: 'var(--paper)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--line-soft)' }}>
                        "{r.comment}"
                      </p>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>No Reviews Yet</div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                    Learners will submit ratings and feedback here upon completing their training sessions.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="dash-card" style={{ maxWidth: '700px' }}>
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
                  <h3>Driving School Profile & Location</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Update your public academy information and map coordinates
                  </p>
                </div>
              </div>
            </div>

            {saveSuccessMsg && (
              <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontWeight: 600 }}>
                {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Academy Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  value={profileData.description}
                  onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>City</label>
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>State</label>
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Physical Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>Map Coordinates (Click on Map to Set Location)</label>
                <div style={{ height: '240px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--line)' }}>
                  <LocationPicker position={location} onLocationSelect={setLocation} />
                </div>
              </div>

              <button type="submit" className="btn btn-navy" style={{ alignSelf: 'flex-start' }}>
                Save Profile Changes
              </button>
            </form>
          </div>
        )}

        {/* MODAL 1: ONBOARD NEW INSTRUCTOR */}
        {showAddInstructorModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Onboard Driving Instructor</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12.5px', color: 'var(--muted)' }}>
                    Add certified staff to your academy with instant login credentials
                  </p>
                </div>
                <button onClick={() => setShowAddInstructorModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
              </div>

              <form onSubmit={handleCreateInstructor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Instructor Full Name</label>
                  <input
                    type="text"
                    value={instructorForm.name}
                    onChange={(e) => setInstructorForm({ ...instructorForm, name: e.target.value })}
                    placeholder="e.g. Bikash Mohanty"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Login Email Address</label>
                    <input
                      type="email"
                      value={instructorForm.email}
                      onChange={(e) => setInstructorForm({ ...instructorForm, email: e.target.value })}
                      placeholder="instructor@domain.com"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={instructorForm.phone}
                      onChange={(e) => setInstructorForm({ ...instructorForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Teaching Specialization</label>
                    <select
                      value={instructorForm.specialization}
                      onChange={(e) => setInstructorForm({ ...instructorForm, specialization: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="4-Wheeler (Manual & Automatic)">4-Wheeler (Manual & Automatic)</option>
                      <option value="4-Wheeler (Manual Only)">4-Wheeler (Manual Only)</option>
                      <option value="4-Wheeler (Automatic Only)">4-Wheeler (Automatic Only)</option>
                      <option value="2-Wheeler (Motorcycle & Scooter)">2-Wheeler (Motorcycle & Scooter)</option>
                      <option value="Commercial Heavy LMV/HMV">Commercial Heavy LMV/HMV</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Teaching Experience</label>
                    <select
                      value={instructorForm.experienceYears}
                      onChange={(e) => setInstructorForm({ ...instructorForm, experienceYears: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="1">1 Year</option>
                      <option value="2">2 Years</option>
                      <option value="3">3 Years</option>
                      <option value="5">5 Years</option>
                      <option value="7">7 Years</option>
                      <option value="10">10+ Years</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    RTO Instructor License No. <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={instructorForm.licenseNumber}
                    onChange={(e) => setInstructorForm({ ...instructorForm, licenseNumber: e.target.value })}
                    placeholder="e.g. OD-02-INS-2020-9182"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}
                  />
                </div>

                {/* Temporary Password Section with Generator */}
                <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', padding: '12px 14px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '12.5px', fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
                      🔑 Temporary Password (For 1st Login)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateTempPassword}
                      style={{
                        background: 'var(--teal-tint)',
                        border: '1px solid var(--teal)',
                        color: 'var(--teal)',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      🎲 Generate Pin
                    </button>
                  </div>
                  <input
                    type="text"
                    value={instructorForm.password}
                    onChange={(e) => setInstructorForm({ ...instructorForm, password: e.target.value })}
                    placeholder="Set temporary password"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                    required
                  />
                  <div style={{ fontSize: '11.5px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.4 }}>
                    ℹ️ <strong>First-Time Login:</strong> This temporary password will be saved in the database. When the instructor logs in to their portal, they can update it anytime in their Profile settings.
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddInstructorModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Onboard & Save Instructor</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD COURSE */}
        {showAddCourseModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Create Driving Course</h3>
                <button onClick={() => setShowAddCourseModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Course Title</label>
                  <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} placeholder="e.g. 4-Wheeler Basic Course" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Price (₹)</label>
                    <input type="number" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} placeholder="3999" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Duration (Days)</label>
                    <input type="number" value={courseForm.durationDays} onChange={(e) => setCourseForm({ ...courseForm, durationDays: e.target.value })} placeholder="15" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Description</label>
                  <textarea rows={2} value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course syllabus and road training details..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddCourseModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Publish Course</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD VEHICLE */}
        {showAddVehicleModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '20px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '28px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Register Fleet Vehicle</h3>
                <button onClick={() => setShowAddVehicleModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
              </div>

              <form onSubmit={handleAddVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>RTO Registration Plate</label>
                    <input
                      type="text"
                      value={vehicleForm.regNumber}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, regNumber: e.target.value })}
                      placeholder="e.g. OD-02-AB-4471"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Vehicle Type</label>
                    <select
                      value={vehicleForm.type}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, type: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="4-Wheeler">4-Wheeler (Car)</option>
                      <option value="2-Wheeler">2-Wheeler (Bike/Scooter)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Model & Variant</label>
                  <input
                    type="text"
                    value={vehicleForm.model}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                    placeholder="e.g. Maruti Suzuki Swift (VXi Manual)"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Transmission</label>
                    <select
                      value={vehicleForm.transmission}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, transmission: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="Manual">Manual</option>
                      <option value="Automatic">Automatic</option>
                      <option value="Automatic Scooter">Automatic Scooter</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Fuel Type</label>
                    <select
                      value={vehicleForm.fuelType}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, fuelType: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="Petrol">Petrol</option>
                      <option value="Petrol + CNG">Petrol + CNG</option>
                      <option value="Diesel">Diesel</option>
                      <option value="EV (Electric)">EV (Electric)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Dual-Control Setup</label>
                    <select
                      value={vehicleForm.dualControlStatus}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, dualControlStatus: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="Certified Dual-Control">Certified Dual-Control</option>
                      <option value="Standard Dual-Pedal">Standard Dual-Pedal</option>
                      <option value="N/A (2-Wheeler)">N/A (2-Wheeler)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Assign Instructor</label>
                    <select
                      value={vehicleForm.instructorId}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, instructorId: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="">-- Unassigned --</option>
                      {instructors.map((ins) => (
                        <option key={ins.id} value={ins.id}>
                          {ins.user?.name} ({ins.specialization || 'Instructor'})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Insurance Validity</label>
                    <input
                      type="date"
                      value={vehicleForm.insuranceValidity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, insuranceValidity: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>Commercial Fitness Date</label>
                    <input
                      type="date"
                      value={vehicleForm.fitnessValidity}
                      onChange={(e) => setVehicleForm({ ...vehicleForm, fitnessValidity: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setShowAddVehicleModal(false)} className="btn btn-outline btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save & Register Vehicle</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: STUDENT INFO MODAL (Eye Icon Click) */}
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
                      fontSize: '17px',
                    }}
                  >
                    {selectedStudent.learner?.name ? selectedStudent.learner.name[0] : 'S'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedStudent.learner?.name || 'Student'}</h3>
                    <span className={`badge ${selectedStudent.status === 'confirmed' ? 'badge-success' : selectedStudent.status === 'pending' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '11px', marginTop: '2px' }}>
                      {selectedStudent.status}
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

              {/* Contact & Booking Information */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--paper)', padding: '18px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Phone Number</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {selectedStudent.learner?.phone || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Email Address</div>
                    <div style={{ fontSize: '13.5px', marginTop: '2px' }}>
                      {selectedStudent.learner?.email || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Enrolled Course</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px', color: 'var(--primary)' }}>
                    {selectedStudent.course?.title || 'Driving Course'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Assigned Instructor</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '2px' }}>
                      {selectedStudent.instructor?.user?.name || 'Unassigned'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Booking Date</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {selectedStudent.bookedDate ? new Date(selectedStudent.bookedDate).toLocaleDateString('en-IN') : 'Recent'}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                {selectedStudent.status === 'pending' ? (
                  <button
                    onClick={() => {
                      handleCancelBooking(selectedStudent.id);
                      setSelectedStudent(null);
                    }}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Cancel Pending Request
                  </button>
                ) : (
                  <div style={{ fontSize: '13px', color: selectedStudent.status === 'confirmed' ? 'var(--teal)' : 'var(--muted)', fontWeight: 700 }}>
                    {selectedStudent.status === 'confirmed' ? '✓ Training Session Confirmed' : '• Session Closed'}
                  </div>
                )}

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="btn btn-navy btn-sm"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 5: INSTRUCTOR INFO MODAL (Eye Icon Click) */}
        {selectedInstructor && (
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
                      background: 'var(--teal-tint)',
                      color: 'var(--teal)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '17px',
                    }}
                  >
                    {selectedInstructor.user?.name ? selectedInstructor.user.name[0] : 'I'}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedInstructor.user?.name || 'Instructor'}</h3>
                    <span className="badge badge-success" style={{ fontSize: '11px', marginTop: '2px' }}>
                      Certified Instructor · Active
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInstructor(null)}
                  style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Instructor Details Dossier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--paper)', padding: '18px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Phone Number</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {selectedInstructor.user?.phone || '—'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Email Address</div>
                    <div style={{ fontSize: '13.5px', marginTop: '2px' }}>
                      {selectedInstructor.user?.email || '—'}
                    </div>
                  </div>
                </div>

                <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Specialization & Training</div>
                  <div style={{ fontSize: '14.5px', fontWeight: 700, marginTop: '2px', color: 'var(--ink)' }}>
                    {selectedInstructor.specialization || 'Manual & Automatic Transmission'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Teaching Experience</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 600, marginTop: '2px' }}>
                      {selectedInstructor.experienceYears ? `${selectedInstructor.experienceYears} Years` : '5 Years'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Active Student Load</div>
                    <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      {bookings.filter((b) => b.instructorId === selectedInstructor.id && b.status === 'confirmed').length} Active Enrolled
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Assigned Vehicle</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                      {vehicles.find(
                        (v) =>
                          v.instructorId === selectedInstructor.id ||
                          (typeof v.instructor === 'string' &&
                            v.instructor.toLowerCase().includes((selectedInstructor.user?.name || '').toLowerCase())) ||
                          (v.instructor?.user?.name &&
                            v.instructor.user.name.toLowerCase().includes((selectedInstructor.user?.name || '').toLowerCase()))
                      )?.model || 'Maruti Suzuki Swift'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Daily Time Slots</div>
                    <div style={{ fontSize: '12.5px', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      07:00 AM – 07:00 PM
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button
                  onClick={() => setSelectedInstructor(null)}
                  className="btn btn-navy btn-sm"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 6: VEHICLE DOSSIER MODAL (Eye Icon Click) */}
        {selectedVehicle && (
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
                maxWidth: '540px',
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
                      borderRadius: '10px',
                      background: '#FFF8E1',
                      border: '1.5px solid #FFE082',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '20px',
                    }}
                  >
                    {selectedVehicle.type === '2-Wheeler' ? '🛵' : '🚗'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedVehicle.regNumber}</h3>
                      <span className="badge badge-neutral" style={{ fontSize: '11px' }}>{selectedVehicle.type}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                      {selectedVehicle.model}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedVehicle(null)}
                  style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              {/* Technical Specifications & Compliance Dossier */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--paper)', padding: '18px', borderRadius: '12px', border: '1px solid var(--line)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Fuel & Transmission</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px', color: 'var(--ink)' }}>
                      {selectedVehicle.fuelType || 'Petrol'} · {selectedVehicle.transmission || 'Manual'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Dual-Control Setup</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px', color: 'var(--teal)' }}>
                      ✓ {selectedVehicle.dualControlStatus || 'Certified Dual-Control'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Assigned Instructor</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>
                      {selectedVehicle.instructor?.user?.name || selectedVehicle.instructor || 'Unassigned'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Service Status</div>
                    <div style={{ marginTop: '2px' }}>
                      <button
                        onClick={() => handleToggleVehicleStatus(selectedVehicle.id, selectedVehicle.status)}
                        className={`badge ${selectedVehicle.status === 'In Service' ? 'badge-success' : 'badge-warning'}`}
                        style={{ border: 'none', cursor: 'pointer', padding: '4px 10px' }}
                      >
                        {selectedVehicle.status === 'In Service' ? '● In Service (Toggle)' : '▲ In Maintenance (Toggle)'}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line-soft)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Insurance Policy & Expiry</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {selectedVehicle.insuranceValidity ? new Date(selectedVehicle.insuranceValidity).toLocaleDateString('en-IN') : 'Valid'}
                    </div>
                    {selectedVehicle.insurancePolicyNo && (
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>Pol: {selectedVehicle.insurancePolicyNo}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>RTO Commercial Fitness</div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                      {selectedVehicle.fitnessValidity ? new Date(selectedVehicle.fitnessValidity).toLocaleDateString('en-IN') : 'Valid'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600 }}>✓ RTO Compliant</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => handleDeleteVehicle(selectedVehicle.id)}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                >
                  Delete from Fleet
                </button>

                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="btn btn-navy btn-sm"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 7: EDIT / CREATE LEARNER OFFER MODAL */}
        {offerModalOpen && (
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
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>
                  {editingOffer ? 'Edit Learner Offer / Package' : 'Create New Learner Offer'}
                </h3>
                <button
                  onClick={() => setOfferModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveOffer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Package / Campaign Title
                  </label>
                  <input
                    type="text"
                    value={offerForm.title}
                    onChange={(e) => setOfferForm({ ...offerForm, title: e.target.value })}
                    placeholder="e.g. 2-Wheeler ₹999 Campaign Launch Offer"
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Vehicle Category
                    </label>
                    <select
                      value={offerForm.vehicleType}
                      onChange={(e) => setOfferForm({ ...offerForm, vehicleType: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    >
                      <option value="4-Wheeler">4-Wheeler (Car)</option>
                      <option value="2-Wheeler">2-Wheeler (Scooter/Bike)</option>
                      <option value="All Vehicles">All Vehicles (VIP Pass)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Learner Price (₹)
                    </label>
                    <input
                      type="number"
                      value={offerForm.price}
                      onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                      placeholder="e.g. 999"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={offerForm.durationDays}
                      onChange={(e) => setOfferForm({ ...offerForm, durationDays: e.target.value })}
                      placeholder="15"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Campaign Badge / Tag
                    </label>
                    <input
                      type="text"
                      value={offerForm.badge}
                      onChange={(e) => setOfferForm({ ...offerForm, badge: e.target.value })}
                      placeholder="e.g. Save 50% · Launch Offer"
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Package Syllabus & Features Description
                  </label>
                  <textarea
                    rows={3}
                    value={offerForm.description}
                    onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                    placeholder="Describe road training hours, dual-control simulator sessions, test track practice..."
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setOfferModalOpen(false)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingOffer ? 'Save Offer Changes' : 'Publish Learner Package'}
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

export default SchoolDashboard;