import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const StudentExamPage = () => {
  const { token } = useAuth();
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(null); // in minutes

useEffect(() => {
  const fetchSession = async () => {
    try {
      const res = await fetch(`http://localhost:8081/student/exams/session/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();

        // ✅ Redirect if exam already submitted
        if (data.isSubmitted) {
          alert("This exam has already been submitted.");
          navigate(`/student/results/${sessionId}`);
          return;
        }

        setSessionData(data);
        setTimeRemaining(data.timeRemainingMinutes);
      } else {
        console.error('Failed to load exam session');
      }
    } catch (err) {
      console.error('Error fetching session:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchSession();
}, [sessionId, token, navigate]);

  useEffect(() => {
    if (timeRemaining === null) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const handleAnswerChange = async (questionId, selectedAnswer) => {
    setSessionData(prev => ({
      ...prev,
      questions: prev.questions.map(q =>
        q.questionId === questionId ? { ...q, selectedAnswer } : q
      )
    }));

    try {
      await fetch(`http://localhost:8081/student/exams/session/${sessionId}/answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          questionId,
          selectedAnswer,
          timeSpentSeconds: 0 // optional, update if needed
        })
      });
    } catch (err) {
      console.error("Error saving answer:", err);
    }
  };

  const handleAutoSubmit = async () => {
    try {
      const res = await fetch(`http://localhost:8081/student/exams/session/${sessionId}/submit`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const result = await res.json();
        navigate(`/student/results/${result.sessionId}`);
      } else {
        alert("Auto-submission failed.");
      }
    } catch (err) {
      console.error("Error in auto-submit:", err);
    }
  };

  const handleManualSubmit = async () => {
    const confirm = window.confirm("Are you sure you want to submit?");
    if (!confirm) return;
    await handleAutoSubmit();
  };

  if (loading || !sessionData) return <p>Loading exam...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>📝 {sessionData.examTitle}</h2>
      <p>Subject: {sessionData.subject}</p>
      <p>Questions Answered: {sessionData.answeredQuestions} / {sessionData.totalQuestions}</p>
      <p style={{ fontWeight: 'bold', color: 'red' }}>
        Time Remaining: {timeRemaining} minute{timeRemaining !== 1 ? 's' : ''}
      </p>

      <hr />

      {sessionData.questions.map((q, index) => (
        <div key={q.questionId} style={{ marginBottom: '20px' }}>
          <p><strong>Q{index + 1}:</strong> {q.questionText}</p>
          {q.imagePath && <img src={q.imagePath} alt="Question" width="200" />}

          <form>
            {['A', 'B', 'C', 'D'].map(option => (
              <div key={option}>
                <label>
                  <input
                    type="radio"
                    name={`question-${q.questionId}`}
                    value={option}
                    checked={q.selectedAnswer === option}
                    onChange={() => handleAnswerChange(q.questionId, option)}
                  />
                  {option}: {q[`option${option}`]}
                </label>
              </div>
            ))}
          </form>

          <p>Selected Answer: {q.selectedAnswer || "Not answered yet"}</p>
        </div>
      ))}

      <button
        onClick={handleManualSubmit}
        style={{ padding: '10px 20px', fontSize: '16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}
      >
        Submit Exam
      </button>
    </div>
  );
};

export default StudentExamPage;
