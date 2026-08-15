import { useState, useEffect } from 'react';
import '../styles/calendar.css';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// fetchFn: async (month, year) => { data: { days: { [dayNum]: 'present' | 'absent' } } }
const AttendanceCalendar = ({ fetchFn }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchFn(month, year);
      setDays(res.data.days || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const presentCount = Object.values(days).filter((s) => s === 'present').length;
  const absentCount = Object.values(days).filter((s) => s === 'absent').length;

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-day-cell empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const status = days[d];
    cells.push(
      <div key={d} className={`cal-day-cell ${status || ''}`}>
        {d}
      </div>
    );
  }

  return (
    <div>
      <div className="cal-summary">
        <div className="cal-summary-card">
          <div className="cal-summary-value" style={{ color: '#155724' }}>{presentCount}</div>
          <div className="cal-summary-label">Present Days</div>
        </div>
        <div className="cal-summary-card">
          <div className="cal-summary-value" style={{ color: '#721C24' }}>{absentCount}</div>
          <div className="cal-summary-label">Absent Days</div>
        </div>
        <div className="cal-summary-card">
          <div className="cal-summary-value">{presentCount + absentCount}</div>
          <div className="cal-summary-label">Total Recorded</div>
        </div>
      </div>

      <div className="cal-nav">
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22', padding: '6px 14px', fontSize: '13px' }} onClick={handlePrevMonth}>
          ← Prev
        </button>
        <h4>{monthName}</h4>
        <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22', padding: '6px 14px', fontSize: '13px' }} onClick={handleNextMonth}>
          Next →
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#8B929A' }}>Loading...</p>
      ) : (
        <>
          <div className="cal-grid">
            {DAY_LABELS.map((d) => (
              <div key={d} className="cal-day-label">{d}</div>
            ))}
            {cells}
          </div>
          <div className="cal-legend">
            <span><span className="cal-legend-dot" style={{ background: '#D4EDDA' }}></span>Present</span>
            <span><span className="cal-legend-dot" style={{ background: '#F8D7DA' }}></span>Absent</span>
            <span><span className="cal-legend-dot" style={{ background: 'white', border: '1px solid #E4E1D9' }}></span>No lesson</span>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceCalendar;