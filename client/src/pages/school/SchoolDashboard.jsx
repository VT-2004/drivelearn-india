import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import LocationPicker from '../../components/LocationPicker';
import LiveClock from '../../components/LiveClock';
import AccountMenu from '../../components/AccountMenu';
import {
  getMySchool,
  updateSchool,
  getSchoolStats,
  getMyBranches,
  addBranch,
  deleteBranch,
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
  cancelSchoolRegistration,
  getSchoolSchedule,
} from '../../services/api';
import { openRazorpayCheckout } from '../../services/razorpayHelper';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const statusClass = {
  pending: 'status-pending',
  verified: 'status-verified',
  rejected: 'status-rejected',
};

const SchoolDashboard = () => {
  const [school, setSchool] = useState(null);
  const [stats, setStats] = useState(null);
  const [branches, setBranches] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({ name: '', description: '', city: '', state: '', address: '' });

  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchData, setBranchData] = useState({ city: '', state: '', address: '' });

  const [showInstructorForm, setShowInstructorForm] = useState(false);
  const [instructorData, setInstructorData] = useState({
    name: '', email: '', password: '', phone: '', specialization: '', experienceYears: '',
  });
  const [instructorError, setInstructorError] = useState('');

  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseData, setCourseData] = useState({ title: '', description: '', price: '', durationDays: '' });
  const [courseError, setCourseError] = useState('');

  const [bookings, setBookings] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [subStatus, setSubStatus] = useState('none');
  const [subscribing, setSubscribing] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [location, setLocation] = useState(null);

  // Instructor Schedule state
  const [scheduleSlots, setScheduleSlots] = useState([]);
  const [scheduleStats, setScheduleStats] = useState({ totalSlots: 0, bookedSlots: 0, openSlots: 0 });
  const [scheduleInstructorFilter, setScheduleInstructorFilter] = useState('');
  const [scheduleDateFilter, setScheduleDateFilter] = useState('');
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Dedicated Instructor Detail Modal / Drawer state
  const [selectedInstructorDetail, setSelectedInstructorDetail] = useState(null);
  const [instructorModalDateFilter, setInstructorModalDateFilter] = useState('');

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const loadSchedule = async (instId = scheduleInstructorFilter, dateVal = scheduleDateFilter) => {
    setLoadingSchedule(true);
    try {
      const res = await getSchoolSchedule({
        instructorId: instId || undefined,
        date: dateVal || undefined,
      });
      setScheduleSlots(res.data.slots || []);
      setScheduleStats(res.data.stats || { totalSlots: 0, bookedSlots: 0, openSlots: 0 });
    } catch (err) {
      console.error('Failed to load school schedule', err);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const loadData = async () => {
    try {
      const schoolRes = await getMySchool();
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

      const [statsRes, branchRes, instructorRes, courseRes, bookingRes, subRes, analyticsRes] = await Promise.all([
        getSchoolStats(),
        getMyBranches(),
        getInstructors(),
        getMyCourses(),
        getSchoolBookings(),
        getMySubscription(),
        getSchoolAnalytics(),
      ]);
      setStats(statsRes.data.stats);
      setBranches(branchRes.data.branches);
      setInstructors(instructorRes.data.instructors);
      setCourses(courseRes.data.courses);
      setBookings(bookingRes.data.bookings);
      setSubscription(subRes.data.subscription);
      setSubStatus(subRes.data.currentStatus);
      setAnalytics(analyticsRes.data.analytics);
      loadSchedule();
    } catch (err) {
      if (err.response?.status === 404) {
        navigate('/school/register');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...profileData };
      if (location) {
        dataToSave.latitude = location[0];
        dataToSave.longitude = location[1];
      }
      await updateSchool(dataToSave);
      setEditMode(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleAddBranch = async (e) => {
    e.preventDefault();
    try {
      await addBranch(branchData);
      setBranchData({ city: '', state: '', address: '' });
      setShowBranchForm(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add branch');
    }
  };

  const handleDeleteBranch = async (id) => {
    if (!window.confirm('Delete this branch?')) return;
    await deleteBranch(id);
    loadData();
  };

  const handleInstructorChange = (e) => {
    setInstructorData({ ...instructorData, [e.target.name]: e.target.value });
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    setInstructorError('');
    try {
      await addInstructor(instructorData);
      setInstructorData({ name: '', email: '', password: '', phone: '', specialization: '', experienceYears: '' });
      setShowInstructorForm(false);
      loadData();
    } catch (err) {
      setInstructorError(err.response?.data?.error || 'Failed to add instructor');
    }
  };

  const handleDeleteInstructor = async (id) => {
    if (!window.confirm('Remove this instructor?')) return;
    await deleteInstructor(id);
    loadData();
  };

  const handleCourseChange = (e) => {
    setCourseData({ ...courseData, [e.target.name]: e.target.value });
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    setCourseError('');
    try {
      await addCourse(courseData);
      setCourseData({ title: '', description: '', price: '', durationDays: '' });
      setShowCourseForm(false);
      loadData();
    } catch (err) {
      setCourseError(err.response?.data?.error || 'Failed to add course');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    await deleteCourse(id);
    loadData();
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await cancelBooking(id);
    loadData();
  };

  const handleCancelRegistration = async () => {
    if (!window.confirm('Are you sure you want to cancel this school registration? This will permanently delete your school, branches, instructors, and courses. This cannot be undone.')) {
      return;
    }
    try {
      await cancelSchoolRegistration();
      navigate('/school/register');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel registration');
    }
  };

  const handleSubscribe = async (plan) => {
    setSubscribing(true);
    try {
      const orderRes = await createSubscriptionOrder(plan);
      const orderData = orderRes.data;

      await openRazorpayCheckout(orderData, {
        name: 'DriveLearn India',
        description: `${plan === 'monthly' ? 'Monthly' : 'Yearly'} School Subscription`,
        prefill: { name: user?.name, email: user?.email },
        onSuccess: async (response) => {
          try {
            await verifySubscriptionPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan,
            });
            alert('Subscription activated successfully!');
            loadData();
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },
        onFailure: () => setSubscribing(false),
      });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to start subscription payment');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) return <div className="dash-page">Loading...</div>;
  if (!school) return null;

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>School Dashboard</h1>
        <AccountMenu />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.branches ?? 0}</div>
          <div className="stat-label">Branches</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.instructors ?? 0}</div>
          <div className="stat-label">Instructors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.courses ?? 0}</div>
          <div className="stat-label">Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.bookings ?? 0}</div>
          <div className="stat-label">Bookings</div>
        </div>
      </div>

      {analytics && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">₹{Number(analytics.totalRevenue).toLocaleString('en-IN')}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.confirmedBookings + analytics.completedBookings}</div>
            <div className="stat-label">Paid Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.avgRating ? `★ ${analytics.avgRating}` : '—'}</div>
            <div className="stat-label">{analytics.reviewCount} Review{analytics.reviewCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{analytics.pendingBookings}</div>
            <div className="stat-label">Awaiting Payment</div>
          </div>
        </div>
      )}

      {analytics?.popularCourses?.length > 0 && (
        <div className="form-card" style={{ marginBottom: '32px' }}>
          <h4 style={{ marginTop: 0 }}>Most Booked Courses</h4>
          {analytics.popularCourses.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: idx < analytics.popularCourses.length - 1 ? '1px solid #EFEDE6' : 'none' }}>
              <span style={{ fontSize: '14px' }}>{c.title}</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{c.bookings} booking{c.bookings !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      )}

      <div className="form-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Subscription</h3>
          <span className={`status-badge ${subStatus === 'active' ? 'status-verified' : subStatus === 'expired' ? 'status-rejected' : 'status-pending'}`}>
            {subStatus === 'none' ? 'no plan' : subStatus}
          </span>
        </div>

        {subscription && (
          <p style={{ fontSize: '14px', color: '#6B7680', marginTop: '12px' }}>
            {subscription.plan === 'monthly' ? 'Monthly' : 'Yearly'} plan · Valid until {new Date(subscription.endDate).toLocaleDateString('en-IN')}
          </p>
        )}

        {subStatus !== 'active' && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => handleSubscribe('monthly')} disabled={subscribing}>
              Subscribe Monthly — ₹999
            </button>
            <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => handleSubscribe('yearly')} disabled={subscribing}>
              Subscribe Yearly — ₹9,999
            </button>
          </div>
        )}
      </div>

      <div className="form-card" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>{school.name}</h3>
          <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        <span className={`status-badge ${statusClass[school.verificationStatus]}`} style={{ marginTop: '10px', display: 'inline-block' }}>
          {school.verificationStatus}
        </span>

        {!editMode ? (
          <>
            <p style={{ color: '#6B7680', fontSize: '14px', marginTop: '16px' }}>
              {school.description || 'No description added yet.'}
            </p>
            <p style={{ fontSize: '14px' }}>
              <strong>Main Location:</strong> {school.address}, {school.city}, {school.state}
            </p>
            {!location && (
              <p style={{ fontSize: '13px', color: '#856404', background: '#FFF3CD', padding: '10px', borderRadius: '4px' }}>
                ⚠️ No map location pinned yet — your school won't appear in learners' "Near Me" search until you add one. Click "Edit Profile" to pin your location.
              </p>
            )}
          </>
        ) : (
          <form onSubmit={handleProfileSave} style={{ marginTop: '16px' }}>
            <label>School Name</label>
            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} required />
            <label>Description</label>
            <textarea name="description" value={profileData.description} onChange={handleProfileChange} />
            <label>City</label>
            <input type="text" name="city" value={profileData.city} onChange={handleProfileChange} required />
            <label>State</label>
            <input type="text" name="state" value={profileData.state} onChange={handleProfileChange} required />
            <label>Address</label>
            <input type="text" name="address" value={profileData.address} onChange={handleProfileChange} required />
            <label>Pin Your Exact Location on the Map</label>
            <LocationPicker value={location} onChange={(lat, lng) => setLocation([lat, lng])} />
            <button type="submit" className="btn btn-primary submit-btn">Save Changes</button>
          </form>
        )}

        {school.verificationStatus === 'pending' && (
          <>
            <p style={{ fontSize: '13px', color: '#856404', background: '#FFF3CD', padding: '10px', borderRadius: '4px', marginTop: '16px' }}>
              Your school is awaiting verification from our team.
            </p>
            <button
              className="btn"
              style={{ marginTop: '10px', background: '#E14B3C', color: 'white', border: 'none' }}
              onClick={handleCancelRegistration}
            >
              Cancel Registration Request
            </button>
          </>
        )}
      </div>

      <div className="dash-header">
        <h1 style={{ fontSize: '22px' }}>Branches</h1>
        <button className="btn btn-primary" onClick={() => setShowBranchForm(!showBranchForm)}>
          {showBranchForm ? 'Cancel' : '+ Add Branch'}
        </button>
      </div>

      {showBranchForm && (
        <form className="form-card" onSubmit={handleAddBranch} style={{ marginBottom: '24px' }}>
          <label>City</label>
          <input type="text" value={branchData.city} onChange={(e) => setBranchData({ ...branchData, city: e.target.value })} required />
          <label>State</label>
          <input type="text" value={branchData.state} onChange={(e) => setBranchData({ ...branchData, state: e.target.value })} required />
          <label>Address</label>
          <input type="text" value={branchData.address} onChange={(e) => setBranchData({ ...branchData, address: e.target.value })} required />
          <button type="submit" className="btn btn-primary submit-btn">Save Branch</button>
        </form>
      )}

      {branches.length === 0 ? (
        <div className="empty-state">No branches added yet.</div>
      ) : (
        branches.map((b) => (
          <div className="branch-card" key={b.id}>
            <span>{b.address}, {b.city}, {b.state}</span>
            <button className="action-btn reject-btn" onClick={() => handleDeleteBranch(b.id)}>Delete</button>
          </div>
        ))
      )}

      {/* Instructors Group Header */}
      <div className="dash-header" style={{ marginTop: '48px' }}>
        <div>
          <h1 style={{ fontSize: '22px', margin: 0 }}>Instructors & Teaching Staff</h1>
          <p style={{ color: '#6B7680', fontSize: '13px', margin: '4px 0 0' }}>
            Manage instructors, monitor their lesson completions, track teaching slots, and inspect individual schedules.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowInstructorForm(!showInstructorForm)}>
          {showInstructorForm ? 'Cancel' : '+ Add New Instructor'}
        </button>
      </div>

      {showInstructorForm && (
        <form className="form-card" onSubmit={handleAddInstructor} style={{ marginBottom: '24px', border: '2px solid #D32F2F' }}>
          <h3 style={{ marginTop: 0, marginBottom: '14px' }}>➕ Register New Instructor</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div>
              <label>Full Name *</label>
              <input type="text" name="name" value={instructorData.name} onChange={handleInstructorChange} required />
            </div>
            <div>
              <label>Email Address *</label>
              <input type="email" name="email" value={instructorData.email} onChange={handleInstructorChange} required />
            </div>
            <div>
              <label>Temporary Password *</label>
              <input type="password" name="password" value={instructorData.password} onChange={handleInstructorChange} required />
            </div>
            <div>
              <label>Phone Number *</label>
              <input type="text" name="phone" value={instructorData.phone} onChange={handleInstructorChange} required />
            </div>
            <div>
              <label>Specialization</label>
              <input type="text" name="specialization" value={instructorData.specialization} onChange={handleInstructorChange} placeholder="e.g. 2-Wheeler Specialist, Car Trainer" />
            </div>
            <div>
              <label>Years of Experience</label>
              <input type="number" name="experienceYears" value={instructorData.experienceYears} onChange={handleInstructorChange} placeholder="e.g. 5" />
            </div>
          </div>
          {instructorError && <p style={{ color: '#D32F2F', fontSize: '14px', marginTop: '10px' }}>{instructorError}</p>}
          <div style={{ marginTop: '16px' }}>
            <button type="submit" className="btn btn-primary submit-btn">Add Instructor</button>
          </div>
        </form>
      )}

      {/* Instructor Group Cards Grid */}
      {instructors.length === 0 ? (
        <div className="empty-state">No instructors added yet. Click "+ Add New Instructor" to onboard your trainers.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {instructors.map((i) => {
            const instBookings = bookings.filter((b) => b.instructorId === i.id);
            const totalBookingsCount = instBookings.length;
            const completedCount = instBookings.filter((b) => b.status === 'completed').length;
            const instSlots = scheduleSlots.filter((s) => s.instructorId === i.id);
            const openSlotsCount = instSlots.filter((s) => !s.isBooked).length;

            return (
              <div
                key={i.id}
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E0DDD5',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: '#181A1B',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '18px',
                      border: '2px solid #D32F2F',
                    }}>
                      {i.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '17px', color: '#181A1B' }}>{i.user.name}</h3>
                      <span style={{ fontSize: '12px', color: '#D32F2F', fontWeight: 600 }}>
                        {i.specialization || 'Certified Driving Instructor'}
                      </span>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#5F6368', marginBottom: '14px', lineHeight: 1.5 }}>
                    <div>📞 {i.user.phone || i.user.email}</div>
                    <div>⭐ {i.experienceYears != null ? `${i.experienceYears} Years Experience` : 'Experienced Trainer'}</div>
                  </div>

                  {/* Instructor Live KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#6B7680', fontWeight: 600 }}>Students</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#181A1B' }}>{totalBookingsCount}</div>
                    </div>
                    <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>Completed</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#2E7D32' }}>{completedCount}</div>
                    </div>
                    <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '6px', padding: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#F57F17', fontWeight: 600 }}>Open Slots</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#F57F17' }}>{openSlotsCount}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ECEFF1', paddingTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInstructorDetail(i);
                      setInstructorModalDateFilter('');
                    }}
                    style={{
                      background: '#181A1B',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '5px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    🔍 View Details & Slots →
                  </button>
                  <button
                    className="action-btn reject-btn"
                    onClick={() => handleDeleteInstructor(i.id)}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Instructor Detail & Management Center Modal */}
      {selectedInstructorDetail && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '14px',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1.5px solid #ECEFF1', paddingBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: '#181A1B',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '24px',
                  border: '3px solid #D32F2F',
                }}>
                  {selectedInstructorDetail.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 style={{ margin: 0, fontSize: '24px', color: '#181A1B' }}>{selectedInstructorDetail.user.name}</h2>
                    <span style={{ fontSize: '12px', background: '#FFEBEE', color: '#D32F2F', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                      Instructor Admin View
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#D32F2F', fontWeight: 600, marginTop: '2px' }}>
                    {selectedInstructorDetail.specialization || 'Certified Driving Trainer'} · {selectedInstructorDetail.experienceYears || 0} Years Experience
                  </div>
                  <div style={{ fontSize: '13px', color: '#5F6368', marginTop: '2px' }}>
                    📧 {selectedInstructorDetail.user.email} | 📞 {selectedInstructorDetail.user.phone || 'No phone provided'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedInstructorDetail(null)}
                style={{
                  background: '#F1F3F4',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#5F6368',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Instructor Financial & Performance Analytics */}
            {(() => {
              const instBookings = bookings.filter((b) => b.instructorId === selectedInstructorDetail.id);
              const totalStudents = instBookings.length;
              const completed = instBookings.filter((b) => b.status === 'completed').length;
              const ongoing = instBookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
              const instSlots = scheduleSlots.filter((s) => s.instructorId === selectedInstructorDetail.id);
              const openSlots = instSlots.filter((s) => !s.isBooked).length;
              
              // Calculate numeric sum of revenue generated by this instructor's bookings
              const instRevenue = instBookings
                .filter((b) => b.status === 'confirmed' || b.status === 'completed')
                .reduce((acc, b) => acc + Number(b.course?.price || 0), 0);

              return (
                <div style={{ marginBottom: '28px' }}>
                  <h3 style={{ margin: '0 0 12px', fontSize: '16px', color: '#181A1B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    📊 Instructor Analytics & Performance
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div style={{ background: '#FFF8E1', border: '1px solid #FFE082', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#F57F17', fontWeight: 700, textTransform: 'uppercase' }}>Generated Revenue</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#E65100', marginTop: '4px' }}>
                        ₹{instRevenue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#6B7680', fontWeight: 700, textTransform: 'uppercase' }}>Total Bookings</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#181A1B', marginTop: '4px' }}>{totalStudents}</div>
                    </div>
                    <div style={{ background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#2E7D32', fontWeight: 700, textTransform: 'uppercase' }}>Completed Lessons</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#2E7D32', marginTop: '4px' }}>{completed}</div>
                    </div>
                    <div style={{ background: '#E3F2FD', border: '1px solid #BBDEFB', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#1565C0', fontWeight: 700, textTransform: 'uppercase' }}>Active Ongoing</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#1565C0', marginTop: '4px' }}>{ongoing}</div>
                    </div>
                    <div style={{ background: '#F3E5F5', border: '1px solid #E1BEE7', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: '#7B1FA2', fontWeight: 700, textTransform: 'uppercase' }}>Open Slots</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#7B1FA2', marginTop: '4px' }}>{openSlots}</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Instructor Timetable & Teaching Slots */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: '#181A1B' }}>📅 Teaching Schedule & Time Slots</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#6B7680' }}>
                    Available and booked time slots assigned to {selectedInstructorDetail.user.name}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    type="date"
                    value={instructorModalDateFilter}
                    onChange={(e) => setInstructorModalDateFilter(e.target.value)}
                    style={{ padding: '6px 12px', fontSize: '13px', border: '1.5px solid #D8D4C9', borderRadius: '6px' }}
                  />
                  {instructorModalDateFilter && (
                    <button
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                      onClick={() => setInstructorModalDateFilter('')}
                    >
                      All Dates
                    </button>
                  )}
                </div>
              </div>

              {(() => {
                const now = new Date();
                const nowTimeStr = now.toLocaleTimeString('en-IN', {
                  timeZone: 'Asia/Kolkata',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);

                let filteredSlots = scheduleSlots.filter((s) => {
                  if (s.instructorId !== selectedInstructorDetail.id) return false;
                  if (!s.isBooked) {
                    const sDate = new Date(s.date);
                    sDate.setHours(0, 0, 0, 0);
                    if (sDate < todayStart) return false;
                    if (sDate.getTime() === todayStart.getTime() && (s.endTime || s.startTime) <= nowTimeStr) return false;
                  }
                  return true;
                });

                if (instructorModalDateFilter) {
                  filteredSlots = filteredSlots.filter((s) => s.date.startsWith(instructorModalDateFilter));
                }

                if (filteredSlots.length === 0) {
                  return (
                    <div style={{ padding: '24px', background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '8px', textAlign: 'center', color: '#6B7680', fontSize: '13px' }}>
                      No time slots found for {instructorModalDateFilter || 'this instructor'}. The instructor can auto-generate batches from their portal.
                    </div>
                  );
                }

                return (
                  <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px', paddingRight: '4px' }}>
                    {filteredSlots.map((slot) => {
                      const [sh, sm] = slot.startTime.split(':').map(Number);
                      const [eh, em] = slot.endTime.split(':').map(Number);
                      const diff = (eh * 60 + em) - (sh * 60 + sm);
                      const durText = diff === 60 ? '1 hr' : diff > 60 ? `${Math.floor(diff / 60)}h ${diff % 60}m` : `${diff} min`;

                      return (
                        <div
                          key={slot.id}
                          style={{
                            background: '#FFFFFF',
                            border: slot.isBooked ? '1.5px solid #2E7D32' : '1px solid #E0DDD5',
                            borderRadius: '8px',
                            padding: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <strong style={{ fontSize: '14px', color: '#181A1B' }}>{slot.startTime} – {slot.endTime}</strong>
                            <span
                              className={`status-badge ${slot.isBooked ? 'status-verified' : 'status-pending'}`}
                              style={{ fontSize: '10px', padding: '2px 8px' }}
                            >
                              {slot.isBooked ? 'Booked' : 'Open'}
                            </span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#5F6368' }}>
                            📅 {new Date(slot.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} · {durText}
                          </div>
                          {slot.isBooked && slot.booking ? (
                            <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #E8F5E9', fontSize: '11px', color: '#2E7D32', fontWeight: 600 }}>
                              👤 {slot.booking.learner?.name} ({slot.booking.learner?.phone || 'No phone'})
                              <div style={{ color: '#5F6368', fontWeight: 400 }}>{slot.booking.course?.title}</div>
                            </div>
                          ) : (
                            <div style={{ color: '#8B929A', fontSize: '11px', fontStyle: 'italic', marginTop: '4px' }}>
                              Available for student booking
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Bookings Assigned to This Instructor */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#181A1B' }}>
                  📝 Student Bookings for {selectedInstructorDetail.user.name}
                </h3>
              </div>

              {(() => {
                const instBookings = bookings.filter((b) => b.instructorId === selectedInstructorDetail.id);
                if (instBookings.length === 0) {
                  return (
                    <div style={{ padding: '20px', background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '8px', textAlign: 'center', color: '#6B7680', fontSize: '13px' }}>
                      No student bookings recorded yet for this instructor.
                    </div>
                  );
                }

                return (
                  <div style={{ overflowX: 'auto', border: '1px solid #ECEFF1', borderRadius: '8px' }}>
                    <table className="dash-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th>Learner</th>
                          <th>Course</th>
                          <th>Date & Time</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instBookings.map((b) => (
                          <tr key={b.id}>
                            <td>
                              <strong>{b.learner.name}</strong>
                              <br />
                              <span style={{ color: '#8B929A', fontSize: '12px' }}>{b.learner.phone || b.learner.email}</span>
                            </td>
                            <td>
                              {b.course.title}
                              <br />
                              <span style={{ fontSize: '11px', color: '#D32F2F', fontWeight: 700 }}>₹{Number(b.course.price).toLocaleString('en-IN')}</span>
                            </td>
                            <td>
                              {new Date(b.bookedDate).toLocaleDateString('en-IN')}
                              {b.startTime && b.endTime && (
                                <>
                                  <br />
                                  <span style={{ fontSize: '12px', color: '#8B929A' }}>{b.startTime} – {b.endTime}</span>
                                </>
                              )}
                            </td>
                            <td>
                              <span className={`status-badge ${b.status === 'cancelled' ? 'status-rejected' : b.status === 'pending' ? 'status-pending' : 'status-verified'}`}>
                                {b.status}
                              </span>
                            </td>
                            <td>
                              {(b.status === 'pending' || b.status === 'confirmed') && (
                                <button
                                  className="action-btn reject-btn"
                                  onClick={async () => {
                                    if (window.confirm('Cancel this booking and issue a full refund to learner?')) {
                                      await handleCancelBooking(b.id);
                                    }
                                  }}
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Cancel & Refund
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>

            {/* Courses Taught by this Instructor */}
            <div>
              <h3 style={{ margin: '0 0 10px', fontSize: '17px', color: '#181A1B' }}>
                📚 Courses Offered by {selectedInstructorDetail.user.name}
              </h3>
              {(() => {
                const instCourses = courses.filter((c) => c.instructorId === selectedInstructorDetail.id);
                if (instCourses.length === 0) {
                  return (
                    <p style={{ color: '#8B929A', fontSize: '13px', margin: 0 }}>
                      No teacher-specific courses assigned. (Instructor conducts all standard school courses).
                    </p>
                  );
                }
                return (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {instCourses.map((c) => (
                      <div key={c.id} style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '6px', padding: '8px 12px', fontSize: '13px' }}>
                        <strong>{c.title}</strong> — <span style={{ color: '#D32F2F', fontWeight: 700 }}>₹{Number(c.price).toLocaleString('en-IN')}</span> ({c.durationDays} days)
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div style={{ marginTop: '28px', textAlign: 'right', borderTop: '1px solid #ECEFF1', paddingTop: '16px' }}>
              <button
                className="btn btn-outline"
                style={{ color: '#181A1B', border: '1.5px solid #181A1B', padding: '9px 22px', fontWeight: 600 }}
                onClick={() => setSelectedInstructorDetail(null)}
              >
                Close Instructor View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courses Management */}
      <div className="dash-header" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '22px' }}>School Courses</h1>
        <button className="btn btn-primary" onClick={() => setShowCourseForm(!showCourseForm)}>
          {showCourseForm ? 'Cancel' : '+ Add Course'}
        </button>
      </div>

      {showCourseForm && (
        <form className="form-card" onSubmit={handleAddCourse} style={{ marginBottom: '24px' }}>
          <label>Course Title</label>
          <input type="text" name="title" value={courseData.title} onChange={handleCourseChange} required />
          <label>Description</label>
          <textarea name="description" value={courseData.description} onChange={handleCourseChange} />
          <label>Price (₹)</label>
          <input type="number" name="price" value={courseData.price} onChange={handleCourseChange} required />
          <label>Duration (Days)</label>
          <input type="number" name="durationDays" value={courseData.durationDays} onChange={handleCourseChange} required />
          {courseError && <p style={{ color: 'red', fontSize: '14px' }}>{courseError}</p>}
          <button type="submit" className="btn btn-primary submit-btn">Save Course</button>
        </form>
      )}

      {courses.length === 0 ? (
        <div className="empty-state">No courses added yet. Add one so learners can book it.</div>
      ) : (
        courses.map((c) => (
          <div className="branch-card" key={c.id}>
            <span>
              <strong>{c.title}</strong> — <span className="dash-price-tag">₹{Number(c.price).toLocaleString('en-IN')}</span> · {c.durationDays} days
            </span>
            <button className="action-btn reject-btn" onClick={() => handleDeleteCourse(c.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default SchoolDashboard;