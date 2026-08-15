import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import testQuestions from '../../data/testQuestions';
import '../../styles/test.css';

const TEST_DURATION_SECONDS = 10 * 60; // 10 minute mock test

const AptitudeTest = () => {
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    if (started && !submitted) {
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
  }, [started, submitted]);

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
    setStarted(false);
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted(false);
    setTimeLeft(TEST_DURATION_SECONDS);
  };

  const score = testQuestions.reduce(
    (acc, q, idx) => (answers[idx] === q.correctIndex ? acc + 1 : acc),
    0
  );

  if (!started) {
    return (
      <div className="test-page">
        <div className="test-header">
          <h1>Driving Aptitude Test</h1>
          <Link to="/" style={{ color: '#F2B705', fontSize: '13px', textDecoration: 'none' }}>← Back to home</Link>
        </div>
        <div className="test-body">
          <div className="test-intro">
            <h2>Test Your Road Knowledge</h2>
            <p>
              {testQuestions.length} questions covering Indian traffic rules, road signs, and safe driving practices.
              You'll have {TEST_DURATION_SECONDS / 60} minutes to complete it. This is a free practice test —
              no login required, and it isn't an official RTO exam.
            </p>
            <button className="btn btn-primary btn-lg" onClick={() => setStarted(true)}>
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="test-page">
        <div className="test-header">
          <h1>Test Results</h1>
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
                : 'Consider brushing up on traffic rules before your real test.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={handleRestart}>Retake Test</button>
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
        <h1>Driving Aptitude Test</h1>
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