import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '../../services/api';
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

      const [statsRes, branchRes, instructorRes, courseRes] = await Promise.all([
        getSchoolStats(),
        getMyBranches(),
        getInstructors(),
        getMyCourses(),
      ]);
      setStats(statsRes.data.stats);
      setBranches(branchRes.data.branches);
      setInstructors(instructorRes.data.instructors);
      setCourses(courseRes.data.courses);
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
      await updateSchool(profileData);
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

  if (loading) return <div className="dash-page">Loading...</div>;
  if (!school) return null;

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>School Dashboard</h1>
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={logout}>
          Logout
        </button>
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
            <button type="submit" className="btn btn-primary submit-btn">Save Changes</button>
          </form>
        )}

        {school.verificationStatus === 'pending' && (
          <p style={{ fontSize: '13px', color: '#856404', background: '#FFF3CD', padding: '10px', borderRadius: '4px', marginTop: '16px' }}>
            Your school is awaiting verification from our team.
          </p>
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
              <strong>{c.title}</strong> — ₹{Number(c.price).toLocaleString('en-IN')} · {c.durationDays} days
            </span>
            <button className="action-btn reject-btn" onClick={() => handleDeleteCourse(c.id)}>Delete</button>
          </div>
        ))
      )}
    </div>
  );
};

export default SchoolDashboard;