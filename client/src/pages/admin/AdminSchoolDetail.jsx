import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSchoolDetailForAdmin } from '../../services/api';
import '../../styles/dashboard.css';

const statusClass = {
  pending: 'status-pending',
  verified: 'status-verified',
  rejected: 'status-rejected',
};

const AdminSchoolDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSchoolDetailForAdmin(id);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to load school details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div className="dash-page">Loading...</div>;
  if (error) return <div className="dash-page">{error} — <Link to="/admin">Back to Admin Dashboard</Link></div>;
  if (!data) return null;

  const { school, stats } = data;

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1 style={{ fontSize: '26px' }}>{school.name}</h1>
        <Link to="/admin" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
          ← Back to Admin Dashboard
        </Link>
      </div>

      <span className={`status-badge ${statusClass[school.verificationStatus]}`} style={{ marginBottom: '20px', display: 'inline-block' }}>
        {school.verificationStatus}
      </span>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.enrolledLearners}</div>
          <div className="stat-label">Enrolled Learners</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">₹{Number(stats.totalRevenue).toLocaleString('en-IN')}</div>
          <div className="stat-label">Revenue Generated</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating ? `★ ${stats.avgRating}` : '—'}</div>
          <div className="stat-label">{stats.reviewCount} Review{stats.reviewCount !== 1 ? 's' : ''}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Courses Listed</div>
        </div>
      </div>

      <div className="form-card" style={{ marginBottom: '24px' }}>
        <h3 style={{ marginTop: 0 }}>Registration Details</h3>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Description:</strong> {school.description || 'N/A'}</p>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Address:</strong> {school.address}, {school.city}, {school.state}</p>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Registered On:</strong> {new Date(school.createdAt).toLocaleDateString('en-IN')}</p>
        {school.latitude && school.longitude && (
          <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Coordinates:</strong> {school.latitude.toFixed(5)}, {school.longitude.toFixed(5)}</p>
        )}

        <h4 style={{ marginBottom: '6px' }}>Owner Info</h4>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Name:</strong> {school.owner.name}</p>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Email:</strong> {school.owner.email}</p>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Phone:</strong> {school.owner.phone}</p>
        <p style={{ fontSize: '14px', margin: '4px 0' }}><strong>Account Created:</strong> {new Date(school.owner.createdAt).toLocaleDateString('en-IN')}</p>

        {school.documentsUrl && (
          <a
            href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${school.documentsUrl}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '16px', display: 'inline-block' }}
          >
            📄 Download Verification Document
          </a>
        )}
      </div>

      <div className="dash-header" style={{ marginTop: '30px' }}>
        <h1 style={{ fontSize: '20px' }}>Branches ({school.branches.length})</h1>
      </div>
      {school.branches.length === 0 ? (
        <div className="empty-state">No branches added.</div>
      ) : (
        school.branches.map((b) => (
          <div className="branch-card" key={b.id}>
            <span>{b.address}, {b.city}, {b.state}</span>
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '30px' }}>
        <h1 style={{ fontSize: '20px' }}>Instructors ({school.instructors.length})</h1>
      </div>
      {school.instructors.length === 0 ? (
        <div className="empty-state">No instructors added.</div>
      ) : (
        school.instructors.map((i) => (
          <div className="branch-card" key={i.id}>
            <span>
              <strong>{i.user.name}</strong> — {i.user.email}
              {i.specialization && ` · ${i.specialization}`}
            </span>
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '30px' }}>
        <h1 style={{ fontSize: '20px' }}>Courses ({school.courses.length})</h1>
      </div>
      {school.courses.length === 0 ? (
        <div className="empty-state">No courses added.</div>
      ) : (
        school.courses.map((c) => (
          <div className="branch-card" key={c.id}>
            <span>
              <strong>{c.title}</strong> — <span className="dash-price-tag">₹{Number(c.price).toLocaleString('en-IN')}</span> · {c.durationDays} days
            </span>
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '30px' }}>
        <h1 style={{ fontSize: '20px' }}>Subscription History</h1>
      </div>
      {school.subscriptions.length === 0 ? (
        <div className="empty-state">No subscription payments yet.</div>
      ) : (
        school.subscriptions.map((s) => (
          <div className="branch-card" key={s.id}>
            <span>
              {s.plan === 'monthly' ? 'Monthly' : 'Yearly'} plan — {new Date(s.startDate).toLocaleDateString('en-IN')} to {new Date(s.endDate).toLocaleDateString('en-IN')}
            </span>
            <span className={`status-badge ${new Date(s.endDate) > new Date() ? 'status-verified' : 'status-rejected'}`}>
              {new Date(s.endDate) > new Date() ? 'active' : 'expired'}
            </span>
          </div>
        ))
      )}

      <div className="dash-header" style={{ marginTop: '30px' }}>
        <h1 style={{ fontSize: '20px' }}>Reviews ({school.reviews.length})</h1>
      </div>
      {school.reviews.length === 0 ? (
        <div className="empty-state">No reviews yet.</div>
      ) : (
        <div className="form-card">
          {school.reviews.map((r) => (
            <div key={r.id} style={{ borderBottom: '1px solid #EFEDE6', padding: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: '14px' }}>{r.learner.name}</strong>
                <span style={{ color: '#F2B705', fontWeight: 600 }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              </div>
              {r.comment && <p style={{ fontSize: '14px', color: '#6B7680', margin: '6px 0 0' }}>{r.comment}</p>}
              <p style={{ fontSize: '12px', color: '#8B929A', margin: '6px 0 0' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSchoolDetail;