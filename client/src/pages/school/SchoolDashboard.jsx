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

  const { logout, user } = useAuth();
  const navigate = useNavigate();

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

      <div className="dash-header" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '22px' }}>Instructors</h1>
        <button className="btn btn-primary" onClick={() => setShowInstructorForm(!showInstructorForm)}>
          {showInstructorForm ? 'Cancel' : '+ Add Instructor'}
        </button>
      </div>

      {showInstructorForm && (
        <form className="form-card" onSubmit={handleAddInstructor} style={{ marginBottom: '24px' }}>
          <label>Full Name</label>
          <input type="text" name="name" value={instructorData.name} onChange={handleInstructorChange} required />
          <label>Email</label>
          <input type="email" name="email" value={instructorData.email} onChange={handleInstructorChange} required />
          <label>Temporary Password</label>
          <input type="password" name="password" value={instructorData.password} onChange={handleInstructorChange} required />
          <label>Phone</label>
          <input type="text" name="phone" value={instructorData.phone} onChange={handleInstructorChange} required />
          <label>Specialization</label>
          <input type="text" name="specialization" value={instructorData.specialization} onChange={handleInstructorChange} placeholder="e.g. 2-wheeler, 4-wheeler" />
          <label>Years of Experience</label>
          <input type="number" name="experienceYears" value={instructorData.experienceYears} onChange={handleInstructorChange} />
          {instructorError && <p style={{ color: 'red', fontSize: '14px' }}>{instructorError}</p>}
          <button type="submit" className="btn btn-primary submit-btn">Add Instructor</button>
        </form>
      )}

      {instructors.length === 0 ? (
        <div className="empty-state">No instructors added yet.</div>
      ) : (
        instructors.map((i) => (
          <div className="branch-card" key={i.id}>
            <span>
              <strong>{i.user.name}</strong> — {i.user.email}
              {i.specialization && ` · ${i.specialization}`}
              {i.experienceYears && ` · ${i.experienceYears} yrs exp`}
            </span>
            <button className="action-btn reject-btn" onClick={() => handleDeleteInstructor(i.id)}>Remove</button>
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '22px' }}>Courses</h1>
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

      <div className="dash-header" style={{ marginTop: '40px' }}>
        <h1 style={{ fontSize: '22px' }}>Bookings</h1>
        <Link to="/school/students" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
          View All Students
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="empty-state">No bookings yet.</div>
      ) : (
        <table className="dash-table">
          <thead>
            <tr>
              <th>Learner</th>
              <th>Course</th>
              <th>Instructor</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id}>
                <td>{b.learner.name}<br /><span style={{ color: '#8B929A', fontSize: '12px' }}>{b.learner.phone}</span></td>
                <td>{b.course.title}</td>
                <td>{b.instructor.user.name}</td>
                <td>{new Date(b.bookedDate).toLocaleDateString('en-IN')}</td>
                <td><span className={`status-badge ${b.status === 'cancelled' ? 'status-rejected' : b.status === 'pending' ? 'status-pending' : 'status-verified'}`}>{b.status}</span></td>
                <td>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <button className="action-btn reject-btn" onClick={() => handleCancelBooking(b.id)}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SchoolDashboard;