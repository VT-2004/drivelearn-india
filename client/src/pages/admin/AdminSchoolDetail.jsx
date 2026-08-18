import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSchoolDetailForAdmin, approveSchool, rejectSchool } from '../../services/api';
import '../../styles/dashboard.css';

const AdminSchoolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('Submitted RTO documentation was insufficient or did not match registered details.');

  const loadSchool = async () => {
    try {
      setLoading(true);
      const res = await getSchoolDetailForAdmin(id);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchool();
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      await approveSchool(id);
      await loadSchool();
    } catch (err) {
      alert('Failed to approve school');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    try {
      setActionLoading(true);
      await rejectSchool(id, rejectionReason);
      setShowRejectModal(false);
      await loadSchool();
    } catch (err) {
      alert('Failed to reject school');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-layout" style={{ minHeight: '100vh', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🚗</div>
          <h3 style={{ fontFamily: 'var(--font-heading)' }}>Loading Driving Academy Details...</h3>
          <p style={{ color: 'var(--muted)', fontSize: '13px' }}>Fetching registration & KYC data from database</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="portal-layout" style={{ minHeight: '100vh', background: 'var(--paper)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', background: '#FFFFFF', padding: '40px', borderRadius: '16px', border: '1px solid var(--line)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
          <h3>Academy Not Found</h3>
          <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>{error || 'The requested driving school record could not be loaded.'}</p>
          <Link to="/admin" className="btn btn-navy">
            ← Back to Super Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { school, stats } = data;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '30px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Navigation & Breadcrumb Header with Circular Back Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={() => navigate('/admin')}
              title="Back to Admin Dashboard"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#FFFFFF',
                border: '1.5px solid var(--line)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                fontSize: '18px',
                color: 'var(--ink)',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(-3px)';
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.background = '#F9FAFB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.borderColor = 'var(--line)';
                e.currentTarget.style.background = '#FFFFFF';
              }}
            >
              ←
            </button>
            <div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Super Admin Portal / Driving Schools Directory</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>{school.name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {school.verificationStatus !== 'verified' && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn btn-sm"
                style={{
                  background: 'var(--teal)',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(14, 138, 130, 0.2)',
                }}
              >
                ✓ Approve & Verify School
              </button>
            )}
            {school.verificationStatus !== 'rejected' && (
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={actionLoading}
                className="btn btn-sm"
                style={{
                  background: '#B3182F',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(179, 24, 47, 0.25)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#921325')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#B3182F')}
              >
                ✕ Reject Application
              </button>
            )}
          </div>
        </div>

        {/* Hero School Profile Banner */}
        <div
          className="dash-card"
          style={{
            background: 'linear-gradient(135deg, #1C1F22 0%, #2D3339 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            padding: '30px',
            marginBottom: '24px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '14px',
                  background: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  color: '#FFFFFF',
                  flexShrink: 0,
                }}
              >
                🚗
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', margin: 0, color: '#FFFFFF' }}>
                    {school.name}
                  </h1>
                  <span
                    className={`badge ${school.verificationStatus === 'verified' ? 'badge-verified' : school.verificationStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {school.verificationStatus === 'verified' ? '✓ RTO Verified Academy' : school.verificationStatus === 'rejected' ? '✕ Verification Rejected' : '⏳ Verification Pending'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', color: '#D0D4DA', fontSize: '13.5px', flexWrap: 'wrap' }}>
                  <span>📍 {school.address}, {school.city}, {school.state}</span>
                  <span>•</span>
                  <span>Owner: <strong>{school.owner?.name}</strong></span>
                  <span>•</span>
                  <span>Registered: {new Date(school.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            </div>

            {school.documentsUrl && (
              <a
                href={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${school.documentsUrl}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm"
                style={{ background: '#FFFFFF', color: '#1C1F22', fontWeight: 700 }}
              >
                📄 View KYC Document
              </a>
            )}
          </div>
        </div>

        {/* 6 Key Performance Indicators */}
        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginBottom: '24px' }}>
          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon">👥</span>
              <span className="kpi-trend">Active</span>
            </div>
            <div className="kpi-val">{stats.enrolledLearners}</div>
            <div className="kpi-label">Enrolled Learners</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon">💰</span>
              <span className="kpi-trend">Live DB</span>
            </div>
            <div className="kpi-val">₹{Number(stats.totalRevenue).toLocaleString('en-IN')}</div>
            <div className="kpi-label">Total Revenue Generated</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon">⭐</span>
            </div>
            <div className="kpi-val">{stats.avgRating ? `★ ${stats.avgRating}` : 'New'}</div>
            <div className="kpi-label">{stats.reviewCount} Learner Review{stats.reviewCount !== 1 ? 's' : ''}</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon">📚</span>
            </div>
            <div className="kpi-val">{stats.totalCourses}</div>
            <div className="kpi-label">Listed Courses</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon">👨‍🏫</span>
            </div>
            <div className="kpi-val">{stats.totalInstructors}</div>
            <div className="kpi-label">Certified Instructors</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-top">
              <span className="kpi-icon">📍</span>
            </div>
            <div className="kpi-val">{stats.totalBranches || 1}</div>
            <div className="kpi-label">Training Centers</div>
          </div>
        </div>

        {/* Detailed 2-Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT COLUMN: Overview, Owner Info, Reviews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Registration & Academy Details */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Academy Registration & Dossier</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Description & Profile</div>
                  <div style={{ fontSize: '14px', marginTop: '2px' }}>
                    {school.description || 'Verified motor driving training institution affiliated with State Transport Department.'}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Full Academy Address</div>
                    <div style={{ fontSize: '13.5px', marginTop: '2px' }}>{school.address}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>City & State</div>
                    <div style={{ fontSize: '13.5px', marginTop: '2px', fontWeight: 700 }}>{school.city}, {school.state}</div>
                  </div>
                </div>

                {school.latitude && school.longitude && (
                  <div style={{ paddingTop: '10px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>GPS Geo-Coordinates</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', marginTop: '2px' }}>
                      Latitude: {school.latitude.toFixed(5)} · Longitude: {school.longitude.toFixed(5)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Profile Card */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Academy Owner Profile</h3>
                <span className="badge badge-neutral">Primary Contact</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Owner Name</div>
                  <div style={{ fontSize: '15px', fontWeight: 700, marginTop: '2px' }}>{school.owner?.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Phone Number</div>
                  <div style={{ fontSize: '14px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{school.owner?.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Email Address</div>
                  <div style={{ fontSize: '13.5px', marginTop: '2px' }}>{school.owner?.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>Account Member Since</div>
                  <div style={{ fontSize: '13.5px', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                    {school.owner?.createdAt ? new Date(school.owner.createdAt).toLocaleDateString('en-IN') : '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Learner Reviews & Feedback ({school.reviews?.length || 0})</h3>
              </div>

              {school.reviews && school.reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {school.reviews.map((r) => (
                    <div key={r.id} style={{ background: 'var(--paper)', padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <strong>{r.learner?.name || 'Anonymous Learner'}</strong>
                        <span style={{ color: '#E1712E', fontWeight: 700 }}>★ {r.rating} / 5</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--ink)', margin: '4px 0' }}>"{r.comment}"</p>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '13.5px' }}>
                  No reviews recorded for this academy yet.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Courses, Instructors, Branches */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Courses Offered */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Course Catalog & Pricing ({school.courses?.length || 0})</h3>
              </div>

              {school.courses && school.courses.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {school.courses.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--paper)',
                        padding: '14px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14.5px' }}>{c.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>
                          Duration: {c.durationDays} Days · {c.description || 'Comprehensive driving training'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{Number(c.price).toLocaleString('en-IN')}
                        </div>
                        <span className="badge badge-success" style={{ fontSize: '10px', padding: '2px 6px' }}>Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '13.5px' }}>
                  No courses published yet.
                </div>
              )}
            </div>

            {/* Certified Instructors */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Certified Instructors ({school.instructors?.length || 0})</h3>
              </div>

              {school.instructors && school.instructors.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {school.instructors.map((ins) => (
                    <div
                      key={ins.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--paper)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>👨‍🏫</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{ins.user?.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {ins.specialization || 'Manual & Automatic'} · {ins.experienceYears ? `${ins.experienceYears} yrs exp` : 'Certified'}
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-neutral" style={{ fontSize: '11px' }}>Instructor</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)', fontSize: '13.5px' }}>
                  No instructors assigned yet.
                </div>
              )}
            </div>

            {/* Training Branches */}
            <div className="dash-card">
              <div className="dash-card-head">
                <h3>Training Centers & Branches ({school.branches?.length || 0})</h3>
              </div>

              {school.branches && school.branches.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {school.branches.map((b) => (
                    <div
                      key={b.id}
                      style={{
                        background: 'var(--paper)',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--line)',
                        fontSize: '13px',
                      }}
                    >
                      📍 <strong>{b.city}, {b.state}</strong> — {b.address}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--muted)', background: 'var(--paper)', padding: '14px', borderRadius: '10px' }}>
                  📍 Main Headquarters: {school.address}, {school.city}, {school.state}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Interactive Application Rejection Modal */}
        {showRejectModal && (
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
                <h3 style={{ margin: 0, color: '#B3182F', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>✕</span> Reject School Application
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontSize: '13.5px', color: 'var(--ink)', marginBottom: '16px' }}>
                You are about to reject the verification application for <strong>{school.name}</strong>. The owner will receive an official notification email with the rejection feedback.
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>
                  Reason for Rejection / Compliance Feedback:
                </label>
                <textarea
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Explain why the documents or registration details were rejected..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="btn btn-outline btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReject}
                  disabled={actionLoading}
                  className="btn btn-sm"
                  style={{ background: '#B3182F', color: '#FFFFFF', fontWeight: 700 }}
                >
                  {actionLoading ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminSchoolDetail;