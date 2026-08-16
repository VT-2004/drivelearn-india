import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyStudents } from '../../services/api';
import AccountMenu from '../../components/AccountMenu';
import '../../styles/dashboard.css';

const statusColor = {
  pending: '#856404',
  confirmed: '#155724',
  completed: '#155724',
  cancelled: '#721C24',
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyStudents();
        setStudents(res.data.students);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Students</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/school" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            ← Back to Dashboard
          </Link>
          <AccountMenu />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : students.length === 0 ? (
        <div className="empty-state">No students have booked with your school yet.</div>
      ) : (
        <>
          <p style={{ color: '#6B7680', marginBottom: '20px' }}>{students.length} student(s) total</p>
          {students.map((s) => (
            <div className="form-card" key={s.id} style={{ marginBottom: '16px', maxWidth: '750px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 6px' }}>{s.name}</h3>
                  <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>{s.email}</p>
                  <p style={{ margin: '0 0 4px', color: '#6B7680', fontSize: '14px' }}>{s.phone}</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#8B929A' }}>
                    Member since {new Date(s.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="dash-price-tag" style={{ display: 'inline-block' }}>
                    {s.totalBookings} booking{s.totalBookings !== 1 ? 's' : ''}
                  </div>
                  <br />
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '13px', padding: '6px 14px', marginTop: '10px', color: '#1C1F22', border: '1.5px solid #1C1F22' }}
                    onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                  >
                    {expandedId === s.id ? 'Hide Courses' : 'View Courses'}
                  </button>
                </div>
              </div>

              {expandedId === s.id && (
                <div style={{ marginTop: '16px', borderTop: '1px solid #EFEDE6', paddingTop: '16px' }}>
                  {s.courses.map((c, idx) => (
                    <div key={idx} style={{ fontSize: '13px', color: '#6B7680', marginBottom: '8px' }}>
                      <strong style={{ color: '#1C1F22' }}>{c.title}</strong> with {c.instructor} —{' '}
                      {new Date(c.bookedDate).toLocaleDateString('en-IN')} —{' '}
                      <span style={{ color: statusColor[c.status], fontWeight: 600, textTransform: 'capitalize' }}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default Students;