// src/pages/student/StudentResultPage.js

import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const StudentResultPage = () => {
  const { sessionId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8081/student/results/${sessionId}`, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token'),
      },
    })
      .then((res) => res.json())
      .then((data) => setResult(data))
      .catch((err) => console.error('Failed to load result', err));
  }, [sessionId]);

  if (!result) return <p>Loading result...</p>;

  return (
    <div>
      <h2>Result for: {result.examTitle}</h2>
      <p>Subject: {result.subject}</p>
      <p>Total Marks: {result.totalMarks}</p>
      <p><strong>Correct:</strong> {result.correctAnswers} / {result.correctAnswers + result.wrongAnswers + result.unanswered}</p>
<p><strong>Wrong:</strong> {result.wrongAnswers}</p>
<p><strong>Unanswered:</strong> {result.unanswered}</p>
<p><strong>Score: {result.correctAnswers} / {result.totalMarks}</strong></p>
      <p>Time Taken: {result.timeTakenMinutes} mins</p>
      <p>Submitted At: {new Date(result.submittedAt).toLocaleString()}</p>

    </div>
  );
};

export default StudentResultPage;
