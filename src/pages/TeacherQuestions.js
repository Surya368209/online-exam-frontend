import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TeacherQuestions = ({ inlineOnly = false }) => {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // ✅ new state
  
  const [deleteMessage, setDeleteMessage] = useState('');

  const [newQuestion, setNewQuestion] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
    imagePath: '' // changed from imageUrl to imagePath to match backend
  });

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('http://localhost:8081/teacher/exams', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setExams(data);
      } catch (err) {
        setError('Failed to load exams');
      } finally {
        setLoadingExams(false);
      }
    };
    fetchExams();
  }, [token]);

  const fetchQuestions = async (examId) => {
    setLoadingQuestions(true);
    try {
      const res = await fetch(`http://localhost:8081/teacher/exams/${examId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (Array.isArray(data)) {
        setQuestions(data);
      } else if (Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        setQuestions([]);
      }

    } catch (err) {
      setError('Failed to load questions');
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleExamChange = (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    if (examId) {
      fetchQuestions(examId);
    } else {
      setQuestions([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!selectedExamId) return setError('Please select an exam first.');
    setSubmitting(true);
    setError('');
    setSuccessMessage('');

    const payload = {
      ...newQuestion,
      examId: selectedExamId
    };

    try {
      const res = await fetch(`http://localhost:8081/teacher/exams/${selectedExamId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Error adding question');

      await fetchQuestions(selectedExamId);
      setNewQuestion({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: '',
        imagePath: ''
      });
      setSuccessMessage('✅ Question added successfully!');
      setTimeout(() => setSuccessMessage(''), 3000); // clear message after 3 sec
    } catch (err) {
      setError(err.message || 'Failed to add question');
    } finally {
      setSubmitting(false);
    }
  };

const handleDeleteQuestion = async (questionId) => {
  const confirm = window.confirm('Are you sure you want to delete this question?');
  if (!confirm) return;

  try {
    const res = await fetch(`http://localhost:8081/teacher/exams/${selectedExamId}/questions/${questionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error('Failed to delete question');

    await fetchQuestions(selectedExamId);
    setDeleteMessage('✅ Question deleted successfully!');
    setTimeout(() => setDeleteMessage(''), 3000); // auto-clear after 3 seconds
  } catch (err) {
    setError(err.message || 'Error deleting question');
  }
};


  return (
    <div style={{ marginTop: '20px' }}>
      {!inlineOnly && <h2>Manage Questions</h2>}

      <label>
        Select Exam:{' '}
        {loadingExams ? (
          <span>Loading exams...</span>
        ) : (
          <select value={selectedExamId} onChange={handleExamChange}>
            <option value="">-- Select --</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title} ({exam.subject})
              </option>
            ))}
          </select>
        )}
      </label>

      {selectedExamId && (
        <form onSubmit={handleAddQuestion} style={{ marginTop: '20px' }}>
          <h3>Add New Question</h3>
          {deleteMessage && <p style={{ color: 'green', marginTop: '10px' }}>{deleteMessage}</p>}
          <textarea
            name="questionText"
            value={newQuestion.questionText}
            onChange={handleChange}
            placeholder="Question Text"
            rows="3"
            required
          />
          <input
            type="text"
            name="imagePath"
            value={newQuestion.imagePath}
            onChange={handleChange}
            placeholder="Image URL (optional)"
          />
          <input type="text" name="optionA" value={newQuestion.optionA || ''} onChange={handleChange} placeholder="Option A" required />
          <input type="text" name="optionB" value={newQuestion.optionB || ''} onChange={handleChange} placeholder="Option B" required />
          <input type="text" name="optionC" value={newQuestion.optionC || ''} onChange={handleChange} placeholder="Option C" required />
          <input type="text" name="optionD" value={newQuestion.optionD || ''} onChange={handleChange} placeholder="Option D" required />
          <select name="correctAnswer" value={newQuestion.correctAnswer || ''} onChange={handleChange} required>
            <option value="">-- Correct Answer --</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Question'}
          </button>
        </form>
      )}

      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      {successMessage && <p style={{ color: 'green', marginTop: '10px' }}>{successMessage}</p>}

      {selectedExamId && (
        <>
          <h3 style={{ marginTop: '30px' }}>All Questions</h3>
          {loadingQuestions ? (
            <p>Loading questions...</p>
          ) : questions.length === 0 ? (
            <p>No questions found for this exam.</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: '100%', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Text</th>
                  <th>Options</th>
                  <th>Answer</th>
                  <th>Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q, idx) => (
                  <tr key={q.id || idx}>
                    <td>{idx + 1}</td>
                    <td>{q.questionText}</td>
                    <td>
                      A. {q.optionA}<br />
                      B. {q.optionB}<br />
                      C. {q.optionC}<br />
                      D. {q.optionD}
                    </td>
                    <td>{q.correctAnswer}</td>
                    <td>{q.imagePath ? <img src={q.imagePath} alt="Q" width="100" /> : 'N/A'}</td>
                    <td>
                      <button onClick={() => handleDeleteQuestion(q.id)}>🗑️ Delete</button>
                    </td>
                  </tr>
                ))}
                
              </tbody>
              
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherQuestions;
