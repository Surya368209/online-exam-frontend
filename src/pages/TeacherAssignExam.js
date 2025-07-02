import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const TeacherAssignExam = () => {
    const navigate = useNavigate();
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [error, setError] = useState('');
  const [assignments, setAssignments] = useState([]);

  const departments = ['CSE', 'CSE(AI)', 'ECE', 'EEE', 'MECH', 'CIVIL'];
  const years = ['1', '2', '3', '4'];

  // Fetch all exams
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('http://localhost:8081/teacher/exams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setExams(data);
      } catch (err) {
        console.error('Failed to load exams:', err);
      }
    };
    fetchExams();
  }, [token]);

  // Fetch assignments when exam changes
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedExamId) return;
      try {
        const res = await fetch(`http://localhost:8081/teacher/exams/${selectedExamId}/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setAssignments(data); // Each item has studentName, department, assignedAt
      } catch (err) {
        console.error('Failed to fetch assignments:', err);
      }
    };
    fetchAssignments();
  }, [selectedExamId, token]);

  const handleAssign = async () => {
    if (!selectedExamId || !department || !year) {
      setError('Please fill all fields');
      return;
    }

    setError('');
    setAssignMessage('');

    const alreadyAssigned = assignments.some(
      (a) => a.department === department && a.assignedAt && a.assignedAt.includes(`20`) // naive check
    );

    if (alreadyAssigned) {
      setAssignMessage(`Already assigned to ${department} - Year ${year}`);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8081/teacher/exams/${selectedExamId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ department, year })
      });

      if (!res.ok) throw new Error('Failed to assign exam');

      const text = await res.text();
      setAssignMessage(text);
      setSelectedExamId('');
      setDepartment('');
      setYear('');
      setAssignments([]); // reset on success
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h2>Assign Exam to Department & Year</h2>

      <div>
        <label>Exam:</label>
        <select
          value={selectedExamId}
          onChange={(e) => {
            setSelectedExamId(e.target.value);
            setAssignMessage('');
            setError('');
          }}
        >
          <option value="">-- Select Exam --</option>
          {exams.map((exam) => (
            <option key={exam.id} value={exam.id}>
              {exam.title} ({exam.subject})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Department:</label>
        <select value={department} onChange={(e) => setDepartment(e.target.value)}>
          <option value="">-- Select Dept --</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Year:</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">-- Select Year --</option>
          {years.map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>

      <div>
        <button onClick={handleAssign}>Assign Exam</button>
      </div>

      {assignMessage && <p style={{ color: 'green', marginTop: '10px' }}>{assignMessage}</p>}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );
};

export default TeacherAssignExam;
