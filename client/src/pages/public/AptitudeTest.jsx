import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import testQuestionsByTier from '../../data/testQuestions';
import '../../styles/test.css';

const TEST_DURATION_SECONDS = 10 * 60;

const difficultyInfo = {
  easy: { label: 'Easy', desc: 'Basic road signs and rules — great for first-timers.' },
  moderate: { label: 'Moderate', desc: 'Right-of-way, safe distances, and practical scenarios.' },
  difficult: { label: 'Difficult', desc: 'In-depth vehicle dynamics, law specifics, and edge cases.' },
};

const AptitudeTest = () => {
  const [difficulty, setDifficulty] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentIndex]: optionIndex });
  };

  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      clearInterval(timerRef.current);
      setSubmitted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleRestart = () => {
    setDifficulty(null);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(TEST_DURATION_SECONDS);
  };

  const score = testQuestions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
    0
  );

  if (!difficulty) {
    return (
      <div className="test-page">
        <div className="test-header">
          <h1>Driving Aptitude Test</h1>
          <Link to="/" style={{ color: '#F2B705', fontSize: '13px', textDecoration: 'none' }}>← Back to home</Link>
        </div>
        <div className="test-body">
          <div className="test-intro">
            <h2>Choose Your Difficulty</h2>
            <p>
              15 questions per level covering Indian traffic rules, road signs, and safe driving practices.
              You'll have {TEST_DURATION_SECONDS / 60} minutes. This is a free practice test — no login required,
              and it isn't an official RTO exam.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '20px' }}>
              {Object.keys(difficultyInfo).map((key) => (
                <div
                  key={key}
                  onClick={() => setDifficulty(key)}
                  style={{
                    cursor: 'pointer', border: '1.5px solid #E4E1D9', borderRadius: '10px',
                    padding: '20px', width: '220px', textAlign: 'left', transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#F2B705')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#E4E1D9')}
                >
                  <h3 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)', textTransform: 'uppercase' }}>
                    {difficultyInfo[key].label}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#6B7680', margin: 0 }}>{difficultyInfo[key].desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="test-page">
        <div className="test-header">
          <h1>Test Results — {difficultyInfo[difficulty].label}</h1>
          <Link to="/" style={{ color: '#F2B705', fontSize: '13px', textDecoration: 'none' }}>← Back to home</Link>
        </div>
        <div className="test-body">
          <div className="result-card" style={{ marginBottom: '24px' }}>
            <p className="result-label">Your Score</p>
            <div className="result-score">{score}<span>/{testQuestions.length}</span></div>
            <p className="result-label">
              {score >= testQuestions.length * 0.8
                ? "Excellent! You're well prepared."
                : score >= testQuestions.length * 0.5
                ? 'Good effort — a bit more practice will help.'
                : 'Consider brushing up before your real test.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={handleRestart}>Try Another Level</button>
              <Link to="/learner" className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }}>
                Find a Driving School
              </Link>
            </div>
          </div>

          <div className="result-card">
            <h3 style={{ textAlign: 'left', marginTop: 0 }}>Review Answers</h3>
            {testQuestions.map((q, idx) => {
              const userAnswer = answers[idx];
              const isCorrect = userAnswer === q.correctIndex;
              return (
                <div className="review-item" key={idx}>
                  <p className="review-question">{idx + 1}. {q.question}</p>
                  <p className={`review-answer ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
                    Your answer: {userAnswer !== undefined ? q.options[userAnswer] : 'Not answered'} {isCorrect ? '✓' : '✗'}
                  </p>
                  {!isCorrect && (
                    <p className="review-answer review-correct">Correct answer: {q.options[q.correctIndex]}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const question = testQuestions[currentIndex];
  const progressPercent = ((currentIndex + 1) / testQuestions.length) * 100;

  return (
    <div className="test-page">
      <div className="test-header">
        <h1>{difficultyInfo[difficulty].label} Test</h1>
        <div className="test-timer">⏱ {formatTime(timeLeft)}</div>
      </div>
      <div className="test-body">
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="question-card">
          <div className="question-number">Question {currentIndex + 1} of {testQuestions.length}</div>
          <div className="question-text">{question.question}</div>

          {question.options.map((option, idx) => (
            <div
              key={idx}
              className={`option-row ${answers[currentIndex] === idx ? 'selected' : ''}`}
              onClick={() => handleSelect(idx)}
            >
              <input type="radio" checked={answers[currentIndex] === idx} onChange={() => handleSelect(idx)} />
              <span>{option}</span>
            </div>
          ))}

          <div className="test-nav">
            <button className="btn btn-outline" style={{ color: '#1C1F22', border: '1.5px solid #1C1F22' }} onClick={handlePrev} disabled={currentIndex === 0}>
              Previous
            </button>
            <button className="btn btn-primary" onClick={handleNext}>
              {currentIndex === testQuestions.length - 1 ? 'Submit Test' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;