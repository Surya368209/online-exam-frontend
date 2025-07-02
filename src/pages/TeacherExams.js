import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TeacherExams = ({ inlineOnly = false }) => {
  const formatDateTimeWithSeconds = (dt) => {
    return dt.length === 16 ? dt + ':00' : dt;
  };
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [newExam, setNewExam] = useState({
    title: '',
    subject: '',
    totalMarks: '',
    durationMinutes: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await fetch('http://localhost:8081/teacher/exams', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to load exams');
      const data = await res.json();
      setExams(data);
    } catch (err) {
      setError(err.message || 'Error loading exams');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewExam((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      title: newExam.title.trim(),
      subject: newExam.subject.trim(),
      totalMarks: parseInt(newExam.totalMarks),
      durationMinutes: parseInt(newExam.durationMinutes),
      startTime: formatDateTimeWithSeconds(newExam.startTime),
      endTime: formatDateTimeWithSeconds(newExam.endTime)
    };

    // Validate
    if (
      !payload.title ||
      !payload.subject ||
      isNaN(payload.totalMarks) ||
      isNaN(payload.durationMinutes) ||
      !payload.startTime ||
      !payload.endTime
    ) {
      setError('Please fill all fields correctly.');
      setSubmitting(false);
      return;
    }

    console.log('Submitting payload:', payload);

    try {
      const res = await fetch('http://localhost:8081/teacher/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create exam');
      await fetchExams();
      setNewExam({
        title: '',
        subject: '',
        totalMarks: '',
        durationMinutes: '',
        startTime: '',
        endTime: ''
      });
    } catch (err) {
      setError(err.message || 'Error creating exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteExam = async (id) => {
    const confirm = window.confirm('Are you sure you want to delete this exam?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:8081/teacher/exams/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to delete exam');
      await fetchExams();
    } catch (err) {
      setError(err.message || 'Error deleting exam');
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {!inlineOnly && <h2>Exams</h2>}

      <form onSubmit={handleCreateExam} style={{ marginBottom: '20px' }}>
        <h3>Create New Exam</h3>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newExam.title}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={newExam.subject}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="totalMarks"
          placeholder="Total Marks"
          value={newExam.totalMarks}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="durationMinutes"
          placeholder="Duration (minutes)"
          value={newExam.durationMinutes}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="startTime"
          value={newExam.startTime}
          onChange={handleChange}
          required
        />
        <input
          type="datetime-local"
          name="endTime"
          value={newExam.endTime}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating...' : 'Create Exam'}
        </button>
      </form>

      {loading ? (
        <p>Loading exams...</p>
      ) : (
        <>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <table border="1" cellPadding="8" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Subject</th>
                <th>Total Marks</th>
                <th>Duration</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td>{exam.title}</td>
                  <td>{exam.subject}</td>
                  <td>{exam.totalMarks}</td>
                  <td>{exam.durationMinutes} min</td>
                  <td>{exam.startTime}</td>
                  <td>{exam.endTime}</td>
                  <td>
                    <button onClick={() => handleDeleteExam(exam.id)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default TeacherExams;
