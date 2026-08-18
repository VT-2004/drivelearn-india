import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  getMyAvailability,
  addAvailability,
  generateAvailability,
  deleteAvailability,
} from '../../services/api';
import AccountMenu from '../../components/AccountMenu';
import LiveClock from '../../components/LiveClock';
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

const formatDuration = (startTime, endTime) => {
  const startM = timeToMinutes(startTime);
  const endM = timeToMinutes(endTime);
  const diff = endM - startM;
  if (diff <= 0) return '';
  if (diff === 60) return '1 hr';
  if (diff > 60) {
    const hrs = Math.floor(diff / 60);
    const rem = diff % 60;
    return rem > 0 ? `${hrs} hr ${rem} min` : `${hrs} hrs`;
  }
  return `${diff} min`;
};

const InstructorAvailability = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('generate'); // 'generate' | 'single'

  // Single slot form
  const [singleForm, setSingleForm] = useState({ date: '', startTime: '09:00', endTime: '10:00' });
  const [singleError, setSingleError] = useState('');
  const [singleSuccess, setSingleSuccess] = useState('');

  // Generator form
  const [genForm, setGenForm] = useState({
    date: '',
    windowStartTime: '09:00',
    windowEndTime: '17:00',
    slotDuration: '45',
    bufferMinutes: '15',
  });
  const [genError, setGenError] = useState('');
  const [genSuccess, setGenSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const load = async () => {
    setLoading(true);
    try {
      const res = await getMyAvailability();
      setSlots(res.data.slots);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Compute live preview of generated slots
  const previewSlots = useMemo(() => {
    if (!genForm.windowStartTime || !genForm.windowEndTime || !genForm.slotDuration) {
      return [];
    }
    const startM = timeToMinutes(genForm.windowStartTime);
    const endM = timeToMinutes(genForm.windowEndTime);
    const duration = parseInt(genForm.slotDuration, 10);
    const buffer = parseInt(genForm.bufferMinutes, 10) || 0;

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
  }, [genForm.windowStartTime, genForm.windowEndTime, genForm.slotDuration, genForm.bufferMinutes]);

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setSingleError('');
    setSingleSuccess('');
    const dur = timeToMinutes(singleForm.endTime) - timeToMinutes(singleForm.startTime);
    if (dur > 120) {
      setSingleError('Single slot cannot exceed 2 hours (120 mins). Please use "Auto-Generate Slots" for longer shifts.');
      return;
    }
    setSubmitting(true);
    try {
      await addAvailability(singleForm);
      setSingleSuccess('Slot added successfully!');
      setSingleForm({ date: singleForm.date, startTime: '09:00', endTime: '10:00' });
      load();
    } catch (err) {
      setSingleError(err.response?.data?.error || 'Failed to add slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenSubmit = async (e) => {
    e.preventDefault();
    setGenError('');
    setGenSuccess('');
    if (previewSlots.length === 0) {
      setGenError('No valid slots to generate in the specified time window.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await generateAvailability(genForm);
      setGenSuccess(res.data.message || `Generated ${res.data.count} slots!`);
      load();
    } catch (err) {
      setGenError(err.response?.data?.error || 'Failed to generate slots');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this slot?')) return;
    try {
      await deleteAvailability(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete slot');
    }
  };

  const grouped = slots.reduce((acc, s) => {
    const dateKey = new Date(s.date).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {});

  return (
    <div className="dash-page">
      <div className="dash-header">
        <h1>My Teaching Availability</h1>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <Link to="/instructor" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
            ← All Courses
          </Link>
          <LiveClock />
          <AccountMenu />
        </div>
      </div>

      <p style={{ color: '#6B7680', marginBottom: '20px' }}>
        Add your available teaching hours. Standard driving lessons are 30–60 minutes long.
      </p>

      {/* Mode Switcher */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button
          type="button"
          className={mode === 'generate' ? 'btn btn-primary' : 'btn btn-outline'}
          style={mode !== 'generate' ? { color: '#1C1F22', border: '1.5px solid #1C1F22' } : {}}
          onClick={() => setMode('generate')}
        >
          ⚡ Auto-Generate Lesson Slots (Recommended)
        </button>
        <button
          type="button"
          className={mode === 'single' ? 'btn btn-primary' : 'btn btn-outline'}
          style={mode !== 'single' ? { color: '#1C1F22', border: '1.5px solid #1C1F22' } : {}}
          onClick={() => setMode('single')}
        >
          ➕ Add Single Slot
        </button>
      </div>

      {mode === 'generate' ? (
        <form className="form-card" onSubmit={handleGenSubmit} style={{ maxWidth: '640px', marginBottom: '28px' }}>
          <h3 style={{ marginTop: 0 }}>Auto-Generate Lesson Slots</h3>
          <p style={{ fontSize: '13px', color: '#6B7680', marginTop: '-6px', marginBottom: '16px' }}>
            Enter your working hours and the system will automatically slice the time into discrete lesson slots.
          </p>

          <label>Date</label>
          <input
            type="date"
            min={today}
            value={genForm.date}
            onChange={(e) => setGenForm({ ...genForm, date: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label>Work Start Time</label>
              <input
                type="time"
                value={genForm.windowStartTime}
                onChange={(e) => setGenForm({ ...genForm, windowStartTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label>Work End Time</label>
              <input
                type="time"
                value={genForm.windowEndTime}
                onChange={(e) => setGenForm({ ...genForm, windowEndTime: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
            <div>
              <label>Lesson Duration</label>
              <select
                value={genForm.slotDuration}
                onChange={(e) => setGenForm({ ...genForm, slotDuration: e.target.value })}
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes (Standard 2-Wheeler)</option>
                <option value="60">60 minutes (1 Hour)</option>
                <option value="90">90 minutes (1.5 Hours)</option>
              </select>
            </div>
            <div>
              <label>Break Between Lessons</label>
              <select
                value={genForm.bufferMinutes}
                onChange={(e) => setGenForm({ ...genForm, bufferMinutes: e.target.value })}
              >
                <option value="0">No Break (0 min)</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes (Recommended)</option>
                <option value="30">30 minutes</option>
              </select>
            </div>
          </div>

          {previewSlots.length > 0 && (
            <div style={{ marginTop: '16px', background: '#F8F9FA', border: '1px solid #E9ECEF', borderRadius: '6px', padding: '12px 16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C1F22', marginBottom: '8px' }}>
                Preview: {previewSlots.length} Bookable Lesson Slots
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {previewSlots.map((p, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'white',
                      border: '1px solid #CED4DA',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      color: '#495057',
                    }}
                  >
                    {p.start} – {p.end}
                  </span>
                ))}
              </div>
            </div>
          )}

          {genError && <p style={{ color: '#B3261E', fontSize: '14px', marginTop: '10px' }}>{genError}</p>}
          {genSuccess && <p style={{ color: '#2E7D32', fontSize: '14px', marginTop: '10px' }}>{genSuccess}</p>}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={submitting || previewSlots.length === 0}
            style={{ marginTop: '16px' }}
          >
            {submitting ? 'Generating...' : `Generate ${previewSlots.length} Slots`}
          </button>
        </form>
      ) : (
        <form className="form-card" onSubmit={handleSingleSubmit} style={{ maxWidth: '500px', marginBottom: '28px' }}>
          <h3 style={{ marginTop: 0 }}>Add Single Lesson Slot</h3>
          <p style={{ fontSize: '13px', color: '#6B7680', marginTop: '-6px', marginBottom: '16px' }}>
            Max lesson length: 2 hours (120 min).
          </p>
          <label>Date</label>
          <input
            type="date"
            min={today}
            value={singleForm.date}
            onChange={(e) => setSingleForm({ ...singleForm, date: e.target.value })}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label>Start Time</label>
              <input
                type="time"
                value={singleForm.startTime}
                onChange={(e) => setSingleForm({ ...singleForm, startTime: e.target.value })}
                required
              />
            </div>
            <div>
              <label>End Time</label>
              <input
                type="time"
                value={singleForm.endTime}
                onChange={(e) => setSingleForm({ ...singleForm, endTime: e.target.value })}
                required
              />
            </div>
          </div>

          {singleForm.startTime && singleForm.endTime && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#6B7680' }}>
              Duration: <strong>{formatDuration(singleForm.startTime, singleForm.endTime) || 'Invalid times'}</strong>
            </div>
          )}

          {singleError && <p style={{ color: '#B3261E', fontSize: '14px' }}>{singleError}</p>}
          {singleSuccess && <p style={{ color: '#2E7D32', fontSize: '14px' }}>{singleSuccess}</p>}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={submitting}
            style={{ marginTop: '16px' }}
          >
            {submitting ? 'Adding...' : 'Add Slot'}
          </button>
        </form>
      )}

      <div className="dash-header">
        <h1 style={{ fontSize: '20px' }}>Upcoming Bookable Slots ({slots.length})</h1>
      </div>

      {loading ? (
        <p>Loading slots...</p>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="empty-state">No availability slots added yet. Use the generator above to add slots.</div>
      ) : (
        Object.entries(grouped).map(([date, daySlots]) => (
          <div key={date} style={{ marginBottom: '22px' }}>
            <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: '#1C1F22' }}>📅 {date}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
              {daySlots.map((s) => {
                const dur = formatDuration(s.startTime, s.endTime);
                return (
                  <div
                    key={s.id}
                    style={{
                      background: 'white',
                      border: s.isBooked ? '1.5px solid #2E7D32' : '1px solid #D8D4C9',
                      borderRadius: '6px',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>
                        {s.startTime} – {s.endTime}
                      </span>
                      {dur && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#6B7680' }}>
                          ({dur})
                        </span>
                      )}
                      {s.isBooked && (
                        <span
                          className="status-badge status-verified"
                          style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 6px' }}
                        >
                          Booked
                        </span>
                      )}
                    </div>
                    {!s.isBooked && (
                      <button
                        className="action-btn reject-btn"
                        onClick={() => handleDelete(s.id)}
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default InstructorAvailability;