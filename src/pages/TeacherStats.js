import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TeacherStats = () => {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('http://localhost:8081/teacher/exams', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error('Failed to fetch exams:', err);
      }
    };
    fetchExams();
  }, [token]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!selectedExamId) return;
      try {
        const res = await fetch(`http://localhost:8081/teacher/exams/${selectedExamId}/results`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        console.log(data);
        setResults(data);
      } catch (err) {
        console.error('Failed to fetch results:', err);
      }
    };
    fetchResults();
  }, [selectedExamId, token]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📊 Exam Statistics</h2>

      <label>Select Exam: </label>
      <select
        value={selectedExamId}
        onChange={(e) => setSelectedExamId(e.target.value)}
        style={{ marginLeft: '10px', padding: '5px' }}
      >
        <option value="">-- Select an exam --</option>
        {exams.map((exam) => (
          <option key={exam.id} value={exam.id}>
            {exam.title} ({exam.subject})
          </option>
        ))}
      </select>

      {results.length > 0 && (
        <table border="1" cellPadding="6" style={{ marginTop: '20px', width: '100%' }}>
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Department</th>
              <th>Year</th>
              <th>Correct</th>
              <th>Wrong</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Time Taken (mins)</th>
            </tr>
          </thead>
          <tbody>
  {results.map((res, i) => {
    const total = res.correctAnswers + res.wrongAnswers + res.unanswered;
    return (
      <tr key={i}>
        <td>{res.rollNo}</td>
        <td>{res.studentName}</td>
        <td>{res.department}</td>
        <td>{res.year}</td>
        <td>{res.correctAnswers} / {total}</td>
        <td>{res.wrongAnswers}</td>
        <td>{total} / {res.totalMarks}</td>
        <td>{res.percentage.toFixed(2)}%</td>
        <td>{res.timeTakenMinutes}</td>
      </tr>
    );
  })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default TeacherStats;
