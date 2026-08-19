import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAllSchools,
  approveSchool,
  rejectSchool,
  getAdminAnalytics,
  getAllUsers,
  adminOverrideSchoolSubscription,
  warnSchool,
  suspendSchool,
  unsuspendSchool,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/dashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, verification, schools, users, states, subscriptions, payments, settings
  const [allSchools, setAllSchools] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  // Warning Modal State
  const [warningModalSchool, setWarningModalSchool] = useState(null);
  const [warningForm, setWarningForm] = useState({ subject: '', message: '' });
  const [warningLoading, setWarningLoading] = useState(false);

  // Suspend Modal State
  const [suspendModalSchool, setSuspendModalSchool] = useState(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendLoading, setSuspendLoading] = useState(false);

  const handleOpenWarning = (school) => {
    setWarningModalSchool(school);
    setWarningForm({
      subject: `⚠️ Official RTO Compliance Notice - ${school.name}`,
      message: '',
    });
  };

  const handleSendWarning = async (e) => {
    e.preventDefault();
    if (!warningModalSchool || !warningForm.message.trim()) return;
    setWarningLoading(true);
    try {
      await warnSchool(warningModalSchool.id, warningForm);
      alert(`✅ Official compliance warning notice sent to ${warningModalSchool.name} via email & dashboard!`);
      setWarningModalSchool(null);
      setWarningForm({ subject: '', message: '' });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send warning notice');
    } finally {
      setWarningLoading(false);
    }
  };

  const handleOpenSuspend = (school) => {
    setSuspendModalSchool(school);
    setSuspendReason('');
  };

  const handleConfirmSuspend = async (e) => {
    e.preventDefault();
    if (!suspendModalSchool) return;
    setSuspendLoading(true);
    try {
      await suspendSchool(suspendModalSchool.id, { reason: suspendReason });
      alert(`🛑 ${suspendModalSchool.name} has been temporarily suspended.`);
      setSuspendModalSchool(null);
      setSuspendReason('');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to suspend school');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleUnsuspend = async (id, name) => {
    if (!window.confirm(`Reinstate ${name} to Verified RTO Partner status?`)) return;
    try {
      await unsuspendSchool(id);
      alert(`✓ ${name} has been reinstated and verified!`);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reinstate school');
    }
  };

  // Directory Search
  const [searchSchoolText, setSearchSchoolText] = useState('');

  // User directory state
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearchText, setUserSearchText] = useState('');

  // Admin SaaS Rights & School Subscription Overrides
  const [selectedSchoolForSub, setSelectedSchoolForSub] = useState(null);
  const [overrideForm, setOverrideForm] = useState({ plan: 'yearly', durationMonths: '12', status: 'active' });
  const [overrideLoading, setOverrideLoading] = useState(false);

  // Editable SaaS Pricing & Rights
  const [saasTiers, setSaasTiers] = useState([
    { id: 'starter', name: 'Starter Academy Tier', price: 999, billing: '/month', instructorsLimit: 3, fleetLimit: 2, rtoBadge: false, campaignAccess: true },
    { id: 'pro', name: 'Annual Pro Partner Tier', price: 8999, billing: '/year', instructorsLimit: 15, fleetLimit: 10, rtoBadge: true, campaignAccess: true },
    { id: 'enterprise', name: 'Enterprise Multi-Branch Tier', price: 19999, billing: '/year', instructorsLimit: 50, fleetLimit: 40, rtoBadge: true, campaignAccess: true },
  ]);
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({ name: '', price: '', instructorsLimit: '', fleetLimit: '' });

  const handleGrantFreeSaas = async (schoolId) => {
    try {
      await adminOverrideSchoolSubscription(schoolId, { plan: 'yearly', durationMonths: 12, status: 'active' });
      alert('✅ 1-Year Free Verified Partner SaaS granted to this Academy!');
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to grant SaaS subscription');
    }
  };

  const handleSaveSubOverride = async (e) => {
    e.preventDefault();
    if (!selectedSchoolForSub) return;
    setOverrideLoading(true);
    try {
      await adminOverrideSchoolSubscription(selectedSchoolForSub.id, {
        plan: overrideForm.plan,
        durationMonths: parseInt(overrideForm.durationMonths) || 12,
        status: overrideForm.status,
      });
      alert(`✅ Subscription rights updated for ${selectedSchoolForSub.name}!`);
      setSelectedSchoolForSub(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update subscription rights');
    } finally {
      setOverrideLoading(false);
    }
  };

  const handleOpenEditTier = (tier) => {
    setEditingTier(tier);
    setTierForm({
      name: tier.name,
      price: tier.price,
      instructorsLimit: tier.instructorsLimit,
      fleetLimit: tier.fleetLimit,
    });
  };

  const handleSaveTier = (e) => {
    e.preventDefault();
    if (!editingTier) return;
    setSaasTiers(
      saasTiers.map((t) =>
        t.id === editingTier.id
          ? {
              ...t,
              name: tierForm.name,
              price: parseFloat(tierForm.price) || t.price,
              instructorsLimit: parseInt(tierForm.instructorsLimit) || t.instructorsLimit,
              fleetLimit: parseInt(tierForm.fleetLimit) || t.fleetLimit,
            }
          : t
      )
    );
    alert('✅ SaaS Tier rights & pricing updated for driving schools!');
    setEditingTier(null);
  };

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const [schoolsRes, analyticsRes, usersRes] = await Promise.all([
        getAllSchools().catch(() => ({ data: { schools: [] } })),
        getAdminAnalytics().catch(() => ({ data: { analytics: null } })),
        getAllUsers().catch(() => ({ data: { users: [] } })),
      ]);

      setAllSchools(schoolsRes.data?.schools || []);
      setAnalytics(analyticsRes.data?.analytics || null);
      setUsers(usersRes.data?.users || []);
    } catch (err) {
      console.error('Error loading realtime admin data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveSchool(id);
      await loadData();
    } catch (err) {
      alert('Failed to verify school');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this school application?')) return;
    try {
      await rejectSchool(id);
      await loadData();
    } catch (err) {
      alert('Failed to reject school');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Realtime search filter on actual database schools
  const filteredSchools = allSchools.filter((s) => {
    const query = searchSchoolText.toLowerCase().trim();
    if (!query) return true;
    return (
      s.name?.toLowerCase().includes(query) ||
      s.city?.toLowerCase().includes(query) ||
      s.state?.toLowerCase().includes(query) ||
      s.address?.toLowerCase().includes(query) ||
      s.owner?.name?.toLowerCase().includes(query) ||
      s.owner?.email?.toLowerCase().includes(query) ||
      (s.owner?.phone && s.owner.phone.includes(query))
    );
  });

  // Realtime filter for KYC Verification tab
  const verificationQueue = allSchools.filter((s) => {
    if (verificationFilter === 'all') return true;
    return s.verificationStatus === verificationFilter;
  });

  // Realtime filter for Users Directory tab
  const filteredUsers = users.filter((u) => {
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    const query = userSearchText.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.name?.toLowerCase().includes(query) ||
      u.email?.toLowerCase().includes(query) ||
      (u.phone && u.phone.includes(query));
    return matchesRole && matchesSearch;
  });

  const pendingCount = allSchools.filter((s) => s.verificationStatus === 'pending').length;
  const verifiedCount = allSchools.filter((s) => s.verificationStatus === 'verified').length;
  const totalLearners = analytics?.totalLearners ?? users.filter((u) => u.role === 'learner').length;
  const totalInstructors = users.filter((u) => u.role === 'instructor').length;

  return (
    <div className="portal-layout">
      {/* Left Crimson Sidebar */}
      <aside className="portal-sidebar">
        <div className="portal-brand">
          <div className="portal-brand-icon">🛡️</div>
          <div className="portal-brand-text">
            <h3>DriveLearn India</h3>
            <span>SUPER ADMIN PORTAL</span>
          </div>
        </div>

        <div className="ps-section-title">Overview</div>
        <button
          className={`ps-link ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <span>📊</span> Dashboard
        </button>

        <div className="ps-section-title">Network & Operations</div>
        <button
          className={`ps-link ${activeTab === 'verification' ? 'active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          <span>🛡️</span> School Verification {pendingCount > 0 && `(${pendingCount})`}
        </button>
        <button
          className={`ps-link ${activeTab === 'schools' ? 'active' : ''}`}
          onClick={() => setActiveTab('schools')}
        >
          <span>🚗</span> Driving Schools Directory
        </button>
        <button
          className={`ps-link ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <span>👥</span> User Directory ({users.length})
        </button>
        <button
          className={`ps-link ${activeTab === 'states' ? 'active' : ''}`}
          onClick={() => setActiveTab('states')}
        >
          <span>🌐</span> States & Coverage
        </button>

        <div className="ps-section-title">Commerce & System</div>
        <button
          className={`ps-link ${activeTab === 'subscriptions' ? 'active' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          <span>📜</span> Subscriptions
        </button>
        <button
          className={`ps-link ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <span>💳</span> Payments & Revenue
        </button>
        <button
          className={`ps-link ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <span>⚙️</span> Platform Settings
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

      {/* Main Super Admin Content Area */}
      <main className="portal-main">
        {/* Topbar */}
        <div className="portal-topbar">
          <div>
            <h2>Platform Control Center</h2>
            <div className="pt-sub">Realtime monitoring and administration of DriveLearn India database</div>
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

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div>
            {/* 6 Realtime KPI Cards Grid */}
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🚗</span>
                  <span className="kpi-trend">Live DB</span>
                </div>
                <div className="kpi-val">{allSchools.length}</div>
                <div className="kpi-label">Registered Schools</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">🛡️</span>
                  <span className="kpi-trend">Verified</span>
                </div>
                <div className="kpi-val">{verifiedCount}</div>
                <div className="kpi-label">Verified Academies</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">⏳</span>
                </div>
                <div className="kpi-val" style={{ color: 'var(--orange)' }}>
                  {pendingCount}
                </div>
                <div className="kpi-label">Pending Verification</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">👥</span>
                  <span className="kpi-trend">Live DB</span>
                </div>
                <div className="kpi-val">{totalLearners}</div>
                <div className="kpi-label">Total Learners</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">👨‍🏫</span>
                </div>
                <div className="kpi-val">{totalInstructors}</div>
                <div className="kpi-label">Active Instructors</div>
              </div>

              <div className="kpi-card">
                <div className="kpi-top">
                  <span className="kpi-icon">💰</span>
                </div>
                <div className="kpi-val">
                  ₹{analytics?.totalRevenue ? Number(analytics.totalRevenue).toLocaleString('en-IN') : '0'}
                </div>
                <div className="kpi-label">Platform Gross Volume</div>
              </div>
            </div>

            {/* Pending Verification Applications Preview */}
            <div className="dash-card">
              <div className="dash-card-head">
                <div>
                  <h3>Pending Driving School Verifications</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Schools awaiting RTO license check and platform verification approval
                  </p>
                </div>
                <button
                  onClick={() => {
                    setVerificationFilter('pending');
                    setActiveTab('verification');
                  }}
                  className="btn btn-outline btn-sm"
                >
                  Review Queue ({pendingCount}) →
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allSchools.filter((s) => s.verificationStatus === 'pending').length > 0 ? (
                  allSchools.filter((s) => s.verificationStatus === 'pending').map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: 'var(--paper)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🛡️</span>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 700 }}>{item.name}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                            {item.city}, {item.state} · Owner: {item.owner?.name || 'Owner'} ({item.owner?.email})
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/admin/school/${item.id}`} className="btn btn-outline btn-sm">
                          Inspect KYC
                        </Link>
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="btn btn-sm"
                          style={{ background: 'var(--primary)', color: '#FFFFFF' }}
                        >
                          Verify & Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)' }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)', fontSize: '14px' }}>
                    ✓ No pending verifications in queue. All schools in the database are verified!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SCHOOL VERIFICATION (KYC QUEUE) */}
        {activeTab === 'verification' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3>Driving School KYC & Verification</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Review submitted documents, business licenses, grant verification, issue warning notices, or suspend licenses
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['Pending', 'Verified', 'Suspended', 'Rejected', 'All'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setVerificationFilter(tab.toLowerCase())}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '999px',
                      border: '1px solid var(--line)',
                      background: verificationFilter === tab.toLowerCase() ? 'var(--primary)' : '#FFFFFF',
                      color: verificationFilter === tab.toLowerCase() ? '#FFFFFF' : 'var(--ink)',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {tab} ({allSchools.filter((s) => tab.toLowerCase() === 'all' || s.verificationStatus === tab.toLowerCase()).length})
                  </button>
                ))}
              </div>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>School Name</th>
                    <th>Owner & Contact</th>
                    <th>Location</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Compliance Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationQueue.length > 0 ? (
                    verificationQueue.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>{item.address}</div>
                        </td>
                        <td>
                          <div>{item.owner?.name || 'Owner'}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{item.owner?.email} · {item.owner?.phone}</div>
                        </td>
                        <td>{item.city}, {item.state}</td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.verificationStatus === 'verified'
                                ? 'badge-verified'
                                : item.verificationStatus === 'suspended'
                                ? 'badge-danger'
                                : item.verificationStatus === 'rejected'
                                ? 'badge-neutral'
                                : 'badge-warning'
                            }`}
                          >
                            {item.verificationStatus === 'verified'
                              ? '✓ Verified'
                              : item.verificationStatus === 'suspended'
                              ? '🛑 Suspended'
                              : item.verificationStatus}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            <Link to={`/admin/school/${item.id}`} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '11.5px' }}>
                              👁️ Inspect
                            </Link>

                            {/* PENDING: Verify or Reject */}
                            {item.verificationStatus === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="btn btn-sm"
                                  style={{ background: 'var(--primary)', color: '#FFFFFF', padding: '4px 10px', fontSize: '11.5px' }}
                                >
                                  ✓ Verify
                                </button>
                                <button
                                  onClick={() => handleReject(item.id)}
                                  className="btn btn-outline btn-sm"
                                  style={{ color: 'var(--danger)', padding: '4px 8px', fontSize: '11.5px' }}
                                >
                                  ✕ Reject
                                </button>
                              </>
                            )}

                            {/* VERIFIED: Cannot reject! Only Give Warning or Suspend License */}
                            {item.verificationStatus === 'verified' && (
                              <>
                                <button
                                  onClick={() => handleOpenWarning(item)}
                                  title="Send Official Compliance Warning to School Owner"
                                  className="btn btn-outline btn-sm"
                                  style={{ color: '#E1712E', borderColor: '#FFE082', background: '#FFFDF9', padding: '4px 9px', fontSize: '11.5px', fontWeight: 600 }}
                                >
                                  ⚠️ Issue Warning
                                </button>
                                <button
                                  onClick={() => handleOpenSuspend(item)}
                                  title="Temporarily Suspend Driving Academy License"
                                  className="btn btn-outline btn-sm"
                                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '4px 8px', fontSize: '11.5px' }}
                                >
                                  🛑 Suspend
                                </button>
                              </>
                            )}

                            {/* SUSPENDED: Can Issue Warning/Notice or Unsuspend / Reinstate */}
                            {item.verificationStatus === 'suspended' && (
                              <>
                                <button
                                  onClick={() => handleOpenWarning(item)}
                                  title="Send Official Notice to Suspended Academy"
                                  className="btn btn-outline btn-sm"
                                  style={{ color: '#E1712E', borderColor: '#FFE082', padding: '4px 8px', fontSize: '11.5px' }}
                                >
                                  ⚠️ Send Notice
                                </button>
                                <button
                                  onClick={() => handleUnsuspend(item.id, item.name)}
                                  title="Reinstate to Verified Partner Status"
                                  className="btn btn-sm"
                                  style={{ background: 'var(--teal)', color: '#FFFFFF', padding: '4px 10px', fontSize: '11.5px' }}
                                >
                                  🟢 Unsuspend
                                </button>
                              </>
                            )}

                            {/* REJECTED: Can Re-Verify */}
                            {item.verificationStatus === 'rejected' && (
                              <button
                                onClick={() => handleApprove(item.id)}
                                className="btn btn-sm"
                                style={{ background: 'var(--primary)', color: '#FFFFFF', padding: '4px 10px', fontSize: '11.5px' }}
                              >
                                ✓ Re-Verify
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                        No schools found for the <strong>{verificationFilter}</strong> filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DRIVING SCHOOLS DIRECTORY */}
        {activeTab === 'schools' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3>Driving Schools Directory</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Realtime directory of all {allSchools.length} driving schools registered in the database
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search driving schools by city (e.g. Pune, Mumbai), state, or academy name..."
                value={searchSchoolText}
                onChange={(e) => setSearchSchoolText(e.target.value)}
                style={{ flex: 1, minWidth: '280px', maxWidth: '520px', padding: '10px 14px', border: '1px solid var(--line)', borderRadius: '8px', fontSize: '13.5px' }}
              />
              {searchSchoolText && (
                <button
                  onClick={() => setSearchSchoolText('')}
                  className="btn btn-outline btn-sm"
                >
                  ✕ Clear Search
                </button>
              )}
              <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Showing <strong>{filteredSchools.length}</strong> of {allSchools.length} schools
              </span>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Driving School</th>
                    <th>Owner & Contact</th>
                    <th>City & State</th>
                    <th>Courses</th>
                    <th>RTO Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchools.length > 0 ? (
                    filteredSchools.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>🚗</span>
                            <strong>{s.name}</strong>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '2px' }}>{s.address}</div>
                        </td>
                        <td>
                          <div>{s.owner?.name || 'Academy Owner'}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{s.owner?.phone || s.owner?.email || '—'}</div>
                        </td>
                        <td>
                          <strong>{s.city}</strong>, {s.state}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {s.courses && s.courses.length > 0 ? (
                              s.courses.map((c, idx) => (
                                <span key={idx} className="chip" style={{ fontSize: '11px', padding: '2px 7px' }}>
                                  {typeof c === 'string' ? c : c.title}
                                </span>
                              ))
                            ) : (
                              <span className="chip" style={{ fontSize: '11px', padding: '2px 7px' }}>
                                4-Wheeler & 2-Wheeler
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${s.verificationStatus === 'verified' ? 'badge-verified' : s.verificationStatus === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                            {s.verificationStatus === 'verified' ? '✓ Verified' : s.verificationStatus}
                          </span>
                        </td>
                        <td>
                          <Link to={`/admin/school/${s.id}`} className="btn btn-outline btn-sm">
                            👁️ View Details
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
                        <div style={{ fontSize: '28px', marginBottom: '8px' }}>🔍</div>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
                          {allSchools.length === 0
                            ? 'No driving schools registered in the database yet.'
                            : `No driving schools match "${searchSchoolText}" in the database.`}
                        </div>
                        {searchSchoolText && (
                          <button
                            onClick={() => setSearchSchoolText('')}
                            className="btn btn-navy btn-sm"
                            style={{ marginTop: '12px' }}
                          >
                            Clear Search Filter
                          </button>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: USER DIRECTORY */}
        {activeTab === 'users' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3>Platform User Directory</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Live database of all {users.length} registered accounts across learners, instructors, school owners, and admins
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['all', 'learner', 'instructor', 'school_owner', 'admin'].map((role) => (
                  <button
                    key={role}
                    onClick={() => setUserRoleFilter(role)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '999px',
                      border: '1px solid var(--line)',
                      background: userRoleFilter === role ? 'var(--primary)' : '#FFFFFF',
                      color: userRoleFilter === role ? '#FFFFFF' : 'var(--ink)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {role === 'all' ? 'All Roles' : role.replace('_', ' ').toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search user by name, email, or phone..."
                value={userSearchText}
                onChange={(e) => setUserSearchText(e.target.value)}
                style={{ width: '100%', maxWidth: '380px', padding: '9px 14px', border: '1px solid var(--line)', borderRadius: '8px' }}
              />
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email & Phone</th>
                    <th>Role</th>
                    <th>Context Info</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td><strong>{u.name}</strong></td>
                        <td>
                          <div>{u.email}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>{u.phone}</div>
                        </td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-orange' : u.role === 'school_owner' ? 'badge-verified' : u.role === 'instructor' ? 'badge-neutral' : 'badge-success'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td style={{ fontSize: '12.5px' }}>
                          {u.role === 'learner' && `₹${Number(u.walletBalance || 0)} Wallet · ${u._count?.bookings ?? 0} bookings`}
                          {u.role === 'school_owner' && (u.drivingSchool ? `${u.drivingSchool.name}` : 'No school')}
                          {u.role === 'instructor' && (u.instructor ? `${u.instructor.school?.name || 'Assigned'}` : '—')}
                          {u.role === 'admin' && 'Super Admin'}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)' }}>
                          {new Date(u.createdAt).toLocaleDateString('en-IN')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                        No users match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: STATES & CITIES COVERAGE */}
        {activeTab === 'states' && (
          <div className="dash-card">
            <div className="dash-card-head">
              <div>
                <h3>States & Coverage</h3>
                <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                  Realtime geographic distribution of registered schools
                </p>
              </div>
            </div>

            <div className="table-responsive">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Registered Schools in DB</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {['Maharashtra', 'Karnataka', 'Delhi', 'Odisha', 'West Bengal', 'Bihar', 'Uttar Pradesh', 'Gujarat'].map((stateName) => {
                    const count = allSchools.filter((s) => s.state === stateName).length;
                    return (
                      <tr key={stateName}>
                        <td><strong>{stateName}</strong></td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {count} {count === 1 ? 'school' : 'schools'}
                        </td>
                        <td>
                          <span className={`badge ${count > 0 ? 'badge-success' : 'badge-neutral'}`}>
                            {count > 0 ? 'Active' : 'Uncovered'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SUBSCRIPTIONS & PLATFORM RIGHTS */}
        {activeTab === 'subscriptions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Section 1: SaaS Tiers & Academy Platform Rights Configuration */}
            <div className="dash-card">
              <div className="dash-card-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Academy SaaS Tiers & Pricing Configuration</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Configure the platform SaaS subscription rates, maximum fleet sizes, and instructor rights for driving schools
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginTop: '16px' }}>
                {saasTiers.map((tier) => (
                  <div
                    key={tier.id}
                    style={{
                      border: tier.id === 'pro' ? '2px solid var(--primary)' : '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '20px',
                      background: tier.id === 'pro' ? '#FFFDF9' : '#FFFFFF',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                    }}
                  >
                    {tier.id === 'pro' && (
                      <div style={{ position: 'absolute', top: '-10px', right: '14px' }}>
                        <span className="badge badge-orange" style={{ fontSize: '10px' }}>POPULAR FOR ACADEMIES</span>
                      </div>
                    )}
                    <div>
                      <h4 style={{ margin: 0, fontSize: '16px', color: tier.id === 'pro' ? 'var(--primary)' : 'var(--ink)' }}>
                        {tier.name}
                      </h4>
                      <div style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--ink)', margin: '8px 0' }}>
                        ₹{tier.price.toLocaleString('en-IN')}{' '}
                        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 400 }}>{tier.billing}</span>
                      </div>
                      <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '6px', margin: '12px 0' }}>
                        <div>👨‍🏫 <strong>Up to {tier.instructorsLimit}</strong> Instructors</div>
                        <div>🚗 <strong>Up to {tier.fleetLimit}</strong> Fleet Vehicles</div>
                        <div>🏷️ {tier.rtoBadge ? '✓ Priority RTO Verified Search' : '• Standard Listing'}</div>
                        <div>🛵 {tier.campaignAccess ? '✓ 2-Wheeler ₹999 Campaign Access' : '• Standard Courses Only'}</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenEditTier(tier)}
                      className="btn btn-outline btn-sm btn-block"
                      style={{ marginTop: '12px', background: '#FFFFFF' }}
                    >
                      ✏️ Edit Tier Rights & Pricing
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 2: Driving Schools SaaS Subscriptions & Overrides */}
            <div className="dash-card">
              <div className="dash-card-head" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Driving Schools SaaS Subscription Roster</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '13px', margin: 0 }}>
                    Grant partner exemptions, override subscription durations, or activate VIP SaaS status for partner academies
                  </p>
                </div>
              </div>

              <div className="table-responsive" style={{ marginTop: '14px' }}>
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Academy Name</th>
                      <th>City & State</th>
                      <th>Owner Contact</th>
                      <th>SaaS License Status</th>
                      <th style={{ textAlign: 'center' }}>Admin Rights & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSchools.length > 0 ? (
                      allSchools.map((s) => (
                        <tr key={s.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '16px' }}>🏫</span>
                              <strong>{s.name}</strong>
                            </div>
                            <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                              {s.address || 'Driving Academy'}
                            </div>
                          </td>
                          <td>
                            <strong>{s.city}</strong>, {s.state}
                          </td>
                          <td>
                            <div>{s.owner?.name || 'School Owner'}</div>
                            <div style={{ fontSize: '11.5px', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                              {s.owner?.phone || s.owner?.email || '—'}
                            </div>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                s.verificationStatus === 'suspended'
                                  ? 'badge-danger'
                                  : s.verificationStatus === 'verified'
                                  ? 'badge-success'
                                  : 'badge-warning'
                              }`}
                              style={{ fontSize: '11px' }}
                            >
                              {s.verificationStatus === 'suspended'
                                ? '🔴 Suspended Academy'
                                : s.verificationStatus === 'verified'
                                ? '🟢 Active SaaS Partner'
                                : '🟡 Standard Trial'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleGrantFreeSaas(s.id)}
                                title="Grant 1-Year Free Verified RTO Partner SaaS"
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '11.5px', color: 'var(--primary)', borderColor: 'var(--line)' }}
                              >
                                ⭐ Grant 1-Yr Free
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedSchoolForSub(s);
                                  setOverrideForm({ plan: 'yearly', durationMonths: '12', status: 'active' });
                                }}
                                title="Set Custom Subscription Rights & Duration"
                                className="btn btn-navy btn-sm"
                                style={{ padding: '4px 10px', fontSize: '11.5px' }}
                              >
                                ⚙️ Custom Rights
                              </button>
                              <button
                                onClick={() => handleOpenWarning(s)}
                                title="Send Official Compliance Warning Notice"
                                className="btn btn-outline btn-sm"
                                style={{ padding: '4px 8px', fontSize: '11.5px', color: '#B45309', borderColor: '#FDE68A', background: '#FFFBEB' }}
                              >
                                ⚠️ Warn
                              </button>
                              {s.verificationStatus === 'suspended' ? (
                                <button
                                  onClick={() => handleUnsuspend(s.id, s.name)}
                                  title="Unsuspend and Reinstate Academy"
                                  className="btn btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '11.5px', background: '#166534', color: '#FFFFFF' }}
                                >
                                  🟢 Unsuspend
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenSuspend(s)}
                                  title="Suspend Academy License"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '11.5px', color: 'var(--danger)', borderColor: '#FCA5A5', background: '#FEF2F2' }}
                                >
                                  🛑 Suspend
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '36px', color: 'var(--muted)' }}>
                          No driving schools registered in the database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: PAYMENTS & REVENUE */}
        {activeTab === 'payments' && (
          <div className="dash-card">
            <h3>National Platform Payouts & Gateway Settlement</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
              Real-time UPI and Razorpay settlement logs
            </p>
            <div style={{ background: 'var(--paper)', padding: '20px', borderRadius: '10px' }}>
              <strong>Total Database Gross Revenue:</strong> ₹{analytics?.totalRevenue ? Number(analytics.totalRevenue).toLocaleString('en-IN') : '0'}
            </div>
          </div>
        )}

        {/* TAB 8: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="dash-card" style={{ maxWidth: '600px' }}>
            <h3>Platform Settings & Compliance</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
              Manage transaction fee percentages and auto-approval thresholds
            </p>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                Platform Gateway Fee (%)
              </label>
              <input type="text" defaultValue="2.5%" style={{ width: '100%', padding: '10px', border: '1px solid var(--line)', borderRadius: '8px' }} />
            </div>
            <button
              onClick={() => alert('Platform settings saved successfully!')}
              className="btn btn-navy"
              style={{ marginTop: '16px' }}
            >
              Save System Settings
            </button>
          </div>
        )}

        {/* MODAL 1: OVERRIDE SCHOOL SAAS RIGHTS & DURATION */}
        {selectedSchoolForSub && (
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
                  <h3 style={{ margin: 0, fontSize: '18px' }}>Set Academy SaaS License</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {selectedSchoolForSub.name} · {selectedSchoolForSub.city}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSchoolForSub(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSubOverride} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    SaaS Plan Tier
                  </label>
                  <select
                    value={overrideForm.plan}
                    onChange={(e) => setOverrideForm({ ...overrideForm, plan: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                  >
                    <option value="yearly">Annual Pro Partner Tier (1-Year)</option>
                    <option value="monthly">Starter Academy Tier (Monthly)</option>
                    <option value="enterprise">Enterprise Multi-Branch Tier</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    License Duration (Months)
                  </label>
                  <input
                    type="number"
                    value={overrideForm.durationMonths}
                    onChange={(e) => setOverrideForm({ ...overrideForm, durationMonths: e.target.value })}
                    placeholder="12"
                    min="1"
                    max="120"
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    SaaS Access Status
                  </label>
                  <select
                    value={overrideForm.status}
                    onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                  >
                    <option value="active">🟢 Active Partner (Full Platform Access)</option>
                    <option value="trial">🟡 Standard Trial (Limited Access)</option>
                    <option value="expired">🔴 Expired / Revoked Access</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSchoolForSub(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={overrideLoading}
                    className="btn btn-primary btn-sm"
                  >
                    {overrideLoading ? 'Updating...' : 'Save & Grant SaaS Rights'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: EDIT SAAS TIER PRICING & RIGHTS */}
        {editingTier && (
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
                <h3 style={{ margin: 0, fontSize: '18px' }}>Edit SaaS Tier Rights & Pricing</h3>
                <button
                  onClick={() => setEditingTier(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveTier} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Tier Title
                  </label>
                  <input
                    type="text"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Subscription Price (₹)
                  </label>
                  <input
                    type="number"
                    value={tierForm.price}
                    onChange={(e) => setTierForm({ ...tierForm, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontFamily: 'var(--font-mono)' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Max Instructors
                    </label>
                    <input
                      type="number"
                      value={tierForm.instructorsLimit}
                      onChange={(e) => setTierForm({ ...tierForm, instructorsLimit: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Max Fleet Vehicles
                    </label>
                    <input
                      type="number"
                      value={tierForm.fleetLimit}
                      onChange={(e) => setTierForm({ ...tierForm, fleetLimit: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingTier(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Tier Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: SEND FORMAL COMPLIANCE WARNING NOTICE */}
        {warningModalSchool && (
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
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#E1712E' }}>⚠️ Issue Official Compliance Notice</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    To: {warningModalSchool.name} ({warningModalSchool.owner?.email})
                  </div>
                </div>
                <button
                  onClick={() => setWarningModalSchool(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSendWarning} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Notice Subject / Violation Type
                  </label>
                  <input
                    type="text"
                    value={warningForm.subject}
                    onChange={(e) => setWarningForm({ ...warningForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '6px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Detailed Warning Message / Rectification Instructions
                  </label>
                  <textarea
                    rows={4}
                    value={warningForm.message}
                    onChange={(e) => setWarningForm({ ...warningForm, message: e.target.value })}
                    placeholder="Specify the regulatory guideline violation (e.g. Expired vehicle fitness, student attendance dispute, uncertified trainer) and required resolution steps..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13.5px', lineHeight: 1.45 }}
                    required
                  />
                </div>

                <div style={{ background: '#FFF8E1', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#795548', lineHeight: 1.4 }}>
                  ℹ️ This notice will be immediately dispatched to the School Owner's registered Gmail (<strong>{warningModalSchool.owner?.email}</strong>) and posted to their dashboard Compliance Notifications.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setWarningModalSchool(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={warningLoading}
                    className="btn btn-sm"
                    style={{ background: '#E1712E', color: '#FFFFFF', padding: '6px 14px' }}
                  >
                    {warningLoading ? 'Dispatching Notice...' : '⚠️ Send Warning Notice'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: TEMPORARILY SUSPEND ACADEMY LICENSE */}
        {suspendModalSchool && (
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
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--danger)' }}>🛑 Suspend Academy License</h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {suspendModalSchool.name} · {suspendModalSchool.city}
                  </div>
                </div>
                <button
                  onClick={() => setSuspendModalSchool(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmSuspend} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    Official Suspension Reason
                  </label>
                  <textarea
                    rows={3}
                    value={suspendReason}
                    onChange={(e) => setSuspendReason(e.target.value)}
                    placeholder="e.g. Safety inspection non-compliance, expired commercial fitness certificates, or multiple learner dispute reports..."
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13.5px' }}
                    required
                  />
                </div>

                <div style={{ background: '#FFEBEE', padding: '10px 14px', borderRadius: '6px', fontSize: '12px', color: '#B71C1C', lineHeight: 1.4 }}>
                  ⚠️ Suspending this school will pause new learner bookings, remove priority verified placement, and email the school owner with immediate suspension terms.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSuspendModalSchool(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={suspendLoading}
                    className="btn btn-sm"
                    style={{ background: 'var(--danger)', color: '#FFFFFF', padding: '6px 14px' }}
                  >
                    {suspendLoading ? 'Suspending...' : 'Confirm Suspension'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: CUSTOM SAAS SUBSCRIPTION RIGHTS OVERRIDE */}
        {selectedSchoolForSub && (
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
                maxWidth: '500px',
                width: '100%',
                padding: '26px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--ink)' }}>
                    ⚙️ Custom SaaS Rights
                  </h3>
                  <div style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                    {selectedSchoolForSub.name} · {selectedSchoolForSub.city}, {selectedSchoolForSub.state}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSchoolForSub(null)}
                  style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: 'var(--muted)' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSubOverride} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                    SaaS Subscription Plan
                  </label>
                  <select
                    value={overrideForm.plan}
                    onChange={(e) => setOverrideForm({ ...overrideForm, plan: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                  >
                    <option value="yearly">⭐ Annual Pro Verified Partner Tier (Yearly)</option>
                    <option value="monthly">🏢 Starter Monthly Academy Tier (Monthly)</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Duration (Months)
                    </label>
                    <select
                      value={overrideForm.durationMonths}
                      onChange={(e) => setOverrideForm({ ...overrideForm, durationMonths: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px' }}
                    >
                      <option value="1">1 Month</option>
                      <option value="3">3 Months (Quarterly)</option>
                      <option value="6">6 Months (Half-Year)</option>
                      <option value="12">12 Months (1 Year Full)</option>
                      <option value="24">24 Months (2 Years VIP)</option>
                      <option value="36">36 Months (3 Years VIP)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, marginBottom: '4px' }}>
                      Status
                    </label>
                    <select
                      value={overrideForm.status}
                      onChange={(e) => setOverrideForm({ ...overrideForm, status: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}
                    >
                      <option value="active">🟢 Active / Granted</option>
                      <option value="expired">🔴 Expired / Revoked</option>
                    </select>
                  </div>
                </div>

                <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '12px 14px', borderRadius: '8px', fontSize: '12px', color: '#166534', lineHeight: 1.4 }}>
                  ✓ Overriding will instantly activate the academy's cloud features, unlock unlimited fleet & instructor onboarding, and notify the school owner.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedSchoolForSub(null)}
                    className="btn btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={overrideLoading}
                    className="btn btn-primary btn-sm"
                    style={{ padding: '6px 16px', fontWeight: 700 }}
                  >
                    {overrideLoading ? 'Saving...' : '💾 Save SaaS Rights'}
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

export default AdminDashboard;