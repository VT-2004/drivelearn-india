import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import testQuestionsByTier from '../../data/testQuestions';
import '../../styles/test.css';

const TEST_DURATION_SECONDS = 10 * 60; // 10 minutes

const difficultyInfo = {
  easy: {
    label: 'Easy · Foundational',
    level: 'Level 1',
    badgeClass: 'easy',
    icon: '🔰',
    desc: 'Core mandatory traffic signals, road signs, pavement markings, and baseline vehicle control basics.',
    target: 'Ideal for first-time learners & LL applicants',
  },
  moderate: {
    label: 'Moderate · Intermediate',
    level: 'Level 2',
    badgeClass: 'moderate',
    icon: '⚡',
    desc: 'Roundabouts, right-of-way priorities, blind spots, safe following distance, and defensive city driving.',
    target: 'Recommended for active learners & DL test prep',
  },
  difficult: {
    label: 'Difficult · Advanced RTO',
    level: 'Level 3',
    badgeClass: 'difficult',
    icon: '🏆',
    desc: 'Motor Vehicles Act penalties, vehicle dynamics (ABS, understeer, hydroplaning), hill ascents & night highway law.',
    target: 'For seasoned drivers & driving instructors',
  },
};

const AptitudeTest = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all', 'correct', 'wrong'
  const timerRef = useRef(null);

  const testQuestions = difficulty ? testQuestionsByTier[difficulty] : [];

  useEffect(() => {
    if (difficulty && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [difficulty, submitted]);

  // Keyboard shortcut listener (A, B, C, D, Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!difficulty || submitted) return;
      const key = e.key.toLowerCase();
      if (['a', '1'].includes(key)) handleSelect(0);
      if (['b', '2'].includes(key)) handleSelect(1);
      if (['c', '3'].includes(key)) handleSelect(2);
      if (['d', '4'].includes(key)) handleSelect(3);
      if (e.key === 'ArrowRight' && currentIndex < testQuestions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [difficulty, submitted, currentIndex, answers]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (optionIndex) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const toggleFlag = (index) => {
    setFlaggedQuestions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      if (window.confirm('Ready to submit your driving aptitude test for evaluation?')) {
        clearInterval(timerRef.current);
        setSubmitted(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRestart = () => {
    setDifficulty(null);
    setCurrentIndex(0);
    setAnswers({});
    setFlaggedQuestions({});
    setSubmitted(false);
    setTimeLeft(TEST_DURATION_SECONDS);
    setReviewFilter('all');
  };

  const score = testQuestions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
    0
  );

  const percentage = testQuestions.length > 0 ? Math.round((score / testQuestions.length) * 100) : 0;
  const isPassed = percentage >= 80;
  const answeredCount = Object.keys(answers).length;
  const timeSpentSeconds = TEST_DURATION_SECONDS - timeLeft;

  // 1. SELECTION SCREEN
  if (!difficulty) {
    return (
      <div className="aptitude-page">
        <header className="aptitude-header">
          <div className="aptitude-header-inner">
            <div className="aptitude-brand">
              <div className="aptitude-brand-icon">🚗</div>
              <div>
                <h1>DriveLearn India</h1>
                <span>National RTO Practice & Aptitude Engine</span>
              </div>
            </div>
            <Link
              to="/"
              className="btn btn-outline btn-sm"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
            >
              ← Back to Home
            </Link>
          </div>
        </header>

        <main className="aptitude-container">
          <div className="aptitude-hero">
            <div className="aptitude-hero-badge">🚦 Free Mock RTO Examination</div>
            <h2>Indian Driving Aptitude Assessment</h2>
            <p>
              Test your knowledge of Indian road signs, traffic regulations under the Motor Vehicles Act,
              and defensive driving techniques before taking your official RTO learner test.
            </p>
            <div className="aptitude-hero-stats">
              <div className="aptitude-hero-stat-item">⏱️ 10 Minutes Timed</div>
              <div className="aptitude-hero-stat-item">📋 15 Multiple Choice Questions</div>
              <div className="aptitude-hero-stat-item">🎯 80% Passing Benchmark</div>
              <div className="aptitude-hero-stat-item">🔒 No Sign-In Required</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Select Assessment Difficulty Tier
            </h3>
            <p style={{ color: '#64748B', fontSize: '14px', marginTop: '4px' }}>
              Choose a skill level to begin your customized mock test
            </p>
          </div>

          <div className="aptitude-tiers-grid">
            {Object.keys(difficultyInfo).map((key) => {
              const item = difficultyInfo[key];
              return (
                <div
                  key={key}
                  className="aptitude-tier-card"
                  onClick={() => setDifficulty(key)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={`aptitude-tier-badge ${item.badgeClass}`}>
                    {item.icon} {item.level}
                  </div>
                  <h3 className="aptitude-tier-title">{item.label.split('·')[0]}</h3>
                  <div style={{ fontSize: '12.5px', color: '#EA580C', fontWeight: 700, marginBottom: '8px' }}>
                    {item.target}
                  </div>
                  <p className="aptitude-tier-desc">{item.desc}</p>
                  <div className="aptitude-tier-footer">
                    <span>15 Questions · 10 Mins</span>
                    <span style={{ color: '#EA580C', fontWeight: 700 }}>Start Test →</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick FAQ / Tips */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px 28px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
            }}
          >
            <div>
              <strong style={{ fontSize: '15px', color: '#0F172A' }}>
                💡 Tip: Keyboard Shortcuts Enabled
              </strong>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '3px' }}>
                During the test, press keys <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, or <strong>D</strong> to quickly pick an answer, and Left/Right Arrow keys to navigate!
              </div>
            </div>
            <Link to="/learner" className="btn btn-primary btn-sm" style={{ padding: '8px 16px', textDecoration: 'none' }}>
              🚗 Explore Driving Schools
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // 2. RESULTS & REVIEW SCREEN
  if (submitted) {
    const filteredReview = testQuestions.map((q, idx) => ({ ...q, originalIndex: idx })).filter((q) => {
      const userAnswer = answers[q.originalIndex];
      const isCorrect = userAnswer === q.correctIndex;
      if (reviewFilter === 'correct') return isCorrect;
      if (reviewFilter === 'wrong') return !isCorrect;
      return true;
    });

    return (
      <div className="aptitude-page">
        <header className="aptitude-header">
          <div className="aptitude-header-inner">
            <div className="aptitude-brand">
              <div className="aptitude-brand-icon">📊</div>
              <div>
                <h1>Test Scorecard & Analysis</h1>
                <span>{difficultyInfo[difficulty].label} Assessment</span>
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="btn btn-outline btn-sm"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)' }}
            >
              🔄 Choose Another Level
            </button>
          </div>
        </header>

        <main className="aptitude-container">
          <div className="aptitude-results-hero">
            <div className={`aptitude-score-circle ${isPassed ? 'pass' : 'fail'}`}>
              <div className="number">{percentage}%</div>
              <div className="label">{isPassed ? '✓ PASSED' : 'RETEST'}</div>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
              {isPassed ? '🎉 Outstanding! You are RTO Ready.' : '📚 Keep Practicing — Almost There!'}
            </h2>
            <p style={{ color: '#64748B', fontSize: '14.5px', maxWidth: '560px', margin: '0 auto' }}>
              {isPassed
                ? `You scored ${score} out of ${testQuestions.length} correct. You have a solid grasp of Indian traffic regulations, signals, and defensive safety protocols.`
                : `You scored ${score} out of ${testQuestions.length}. RTO exam passing threshold is 80% (12/15). Review your answers below to sharpen your knowledge.`}
            </p>

            <div className="aptitude-metrics-grid">
              <div className="aptitude-metric-box">
                <div className="val" style={{ color: '#15803D' }}>{score}</div>
                <div className="lbl">Correct Answers</div>
              </div>
              <div className="aptitude-metric-box">
                <div className="val" style={{ color: '#DC2626' }}>{testQuestions.length - score}</div>
                <div className="lbl">Incorrect / Skipped</div>
              </div>
              <div className="aptitude-metric-box">
                <div className="val" style={{ color: '#EA580C' }}>{formatTime(timeSpentSeconds)}</div>
                <div className="lbl">Time Taken</div>
              </div>
              <div className="aptitude-metric-box">
                <div className="val">{testQuestions.length}</div>
                <div className="lbl">Total Questions</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleRestart} style={{ padding: '10px 24px' }}>
                🔄 Retake Test
              </button>
              <Link to="/learner" className="btn btn-navy" style={{ padding: '10px 24px', textDecoration: 'none' }}>
                🚗 Book Driving Academy Lessons
              </Link>
              <Link to="/" className="btn btn-outline" style={{ padding: '10px 20px', textDecoration: 'none' }}>
                🏠 Home
              </Link>
            </div>
          </div>

          {/* Detailed Question Review */}
          <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
              Question Review & Explanations ({testQuestions.length})
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={() => setReviewFilter('all')}
                className={`btn btn-sm ${reviewFilter === 'all' ? 'btn-navy' : 'btn-outline'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                All ({testQuestions.length})
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`btn btn-sm ${reviewFilter === 'correct' ? 'btn-navy' : 'btn-outline'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                ✓ Correct ({score})
              </button>
              <button
                onClick={() => setReviewFilter('wrong')}
                className={`btn btn-sm ${reviewFilter === 'wrong' ? 'btn-navy' : 'btn-outline'}`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                ✗ Incorrect ({testQuestions.length - score})
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredReview.map((q) => {
              const userAnswer = answers[q.originalIndex];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div
                  key={q.originalIndex}
                  className={`aptitude-review-card ${isCorrect ? 'correct' : 'wrong'}`}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: isCorrect ? '#15803D' : '#DC2626', textTransform: 'uppercase' }}>
                      Question {q.originalIndex + 1} · {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <span
                      className={`badge ${isCorrect ? 'badge-success' : 'badge-danger'}`}
                      style={{ fontSize: '11px' }}
                    >
                      {isCorrect ? '+1 Mark' : '0 Marks'}
                    </span>
                  </div>

                  <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                    {q.question}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px', marginBottom: '12px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isUserPick = userAnswer === optIdx;
                      const isCorrectPick = q.correctIndex === optIdx;

                      let bg = '#F8FAFC';
                      let border = '#E2E8F0';
                      let color = '#334155';
                      let icon = '';

                      if (isCorrectPick) {
                        bg = '#DCFCE7';
                        border = '#86EFAC';
                        color = '#166534';
                        icon = '✓ Correct Answer';
                      } else if (isUserPick && !isCorrect) {
                        bg = '#FEE2E2';
                        border = '#FCA5A5';
                        color = '#991B1B';
                        icon = '✗ Your Choice';
                      }

                      return (
                        <div
                          key={optIdx}
                          style={{
                            background: bg,
                            border: `1.5px solid ${border}`,
                            borderRadius: '8px',
                            padding: '10px 14px',
                            fontSize: '13.5px',
                            color,
                            fontWeight: isCorrectPick || isUserPick ? 700 : 500,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                          {icon && <span style={{ fontSize: '11px', fontWeight: 800 }}>{icon}</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // 3. ACTIVE QUIZ INTERACTION SCREEN
  const question = testQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / testQuestions.length) * 100;
  const isUrgent = timeLeft < 120; // less than 2 minutes left

  return (
    <div className="aptitude-page">
      {/* Sticky Modern Topbar */}
      <header className="aptitude-header">
        <div className="aptitude-header-inner">
          <div className="aptitude-brand">
            <div className="aptitude-brand-icon">{difficultyInfo[difficulty].icon}</div>
            <div>
              <h1>{difficultyInfo[difficulty].label}</h1>
              <span>Question {currentIndex + 1} of {testQuestions.length} ({answeredCount} Answered)</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className={`aptitude-timer-badge ${isUrgent ? 'urgent' : ''}`}>
              <span>⏱️</span>
              <span>{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
                  handleRestart();
                }
              }}
              className="btn btn-outline btn-sm"
              style={{ color: '#FFFFFF', borderColor: 'rgba(255,255,255,0.3)', padding: '6px 12px' }}
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <main className="aptitude-container">
        <div className="aptitude-quiz-card">
          {/* Progress Bar & Header */}
          <div className="aptitude-progress-wrapper">
            <div className="aptitude-progress-header">
              <span>Progress: {Math.round(progressPercent)}%</span>
              <span>{answeredCount} of {testQuestions.length} Questions Answered</span>
            </div>
            <div className="aptitude-progress-track">
              <div className="aptitude-progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          {/* Quick-Jump Question Navigator Dots */}
          <div className="aptitude-nav-dots">
            {testQuestions.map((_, idx) => {
              const isCurrent = idx === currentIndex;
              const isAnswered = answers[idx] !== undefined;
              const isFlagged = flaggedQuestions[idx];

              let cls = 'aptitude-dot';
              if (isCurrent) cls += ' active';
              else if (isFlagged) cls += ' flagged';
              else if (isAnswered) cls += ' answered';

              return (
                <button
                  key={idx}
                  className={cls}
                  onClick={() => setCurrentIndex(idx)}
                  title={`Jump to Question ${idx + 1} ${isAnswered ? '(Answered)' : '(Unanswered)'}`}
                >
                  {isFlagged ? '🚩' : idx + 1}
                </button>
              );
            })}
          </div>

          {/* Question Text */}
          <div className="aptitude-question-badge">
            🚦 Question #{currentIndex + 1}
          </div>
          <div className="aptitude-question-text">{question.question}</div>

          {/* Options */}
          <div className="aptitude-options-list">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentIndex] === idx;
              const optionKey = String.fromCharCode(65 + idx); // A, B, C, D

              return (
                <div
                  key={idx}
                  className={`aptitude-option-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleSelect(idx)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="aptitude-option-key">{optionKey}</div>
                  <div className="aptitude-option-label">{option}</div>
                  <input
                    type="radio"
                    checked={isSelected}
                    onChange={() => handleSelect(idx)}
                    style={{ accentColor: '#EA580C', transform: 'scale(1.2)', cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action Footer */}
          <div className="aptitude-quiz-actions">
            <button
              className="btn btn-outline btn-sm"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              style={{ padding: '8px 16px', fontWeight: 600 }}
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() => toggleFlag(currentIndex)}
              className="btn btn-outline btn-sm"
              style={{
                borderColor: flaggedQuestions[currentIndex] ? '#EF4444' : '#CBD5E1',
                color: flaggedQuestions[currentIndex] ? '#DC2626' : '#475569',
                background: flaggedQuestions[currentIndex] ? '#FEF2F2' : '#FFFFFF',
                padding: '8px 14px',
                fontSize: '12.5px',
              }}
            >
              {flaggedQuestions[currentIndex] ? '🚩 Flagged' : '🏳️ Flag for Review'}
            </button>

            <button
              className="btn btn-primary btn-sm"
              onClick={handleNext}
              style={{ padding: '8px 20px', fontWeight: 700 }}
            >
              {currentIndex === testQuestions.length - 1 ? 'Submit Test ✓' : 'Next Question →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AptitudeTest;