import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TeacherQuestions from './TeacherQuestions';
import TeacherExams from './TeacherExams';
import TeacherStats from './TeacherStats';
import LogoutButton from '../components/LogoutButton';
import ChangePassword from '../components/ChangePassword';

const TeacherDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');


  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('http://localhost:8081/teacher/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch dashboard');
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [token]);

  const categorizeExams = (exams) => {
    const now = new Date();
    return {
      active: exams.filter(e => new Date(e.startTime) <= now && new Date(e.endTime) >= now),
      upcoming: exams.filter(e => new Date(e.startTime) > now),
      past: exams.filter(e => new Date(e.endTime) < now)
    };
  };

  const renderTab = () => {
    if (!dashboardData) return null;

    const fullExamList = dashboardData.exams || [];
    const { active, upcoming, past } = categorizeExams(fullExamList);

    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h3>👤 Profile Info</h3>
            <p><strong>Name:</strong> {dashboardData.teacherName}</p>
            <p><strong>Roll No:</strong> {dashboardData.rollNo}</p>
            <p><strong>Department:</strong> {dashboardData.department}</p>
            <p><strong>Designation:</strong> {dashboardData.designation}</p>
          </div>
        );

      case 'exams':
        return (
          <div>
            <h3>📋 Exam Summary</h3>
            <p><strong>Total Exams:</strong> {fullExamList.length}</p>
            <p><strong>Active:</strong> {active.length}</p>
            <p><strong>Upcoming:</strong> {upcoming.length}</p>
            <p><strong>Completed:</strong> {past.length}</p>

            <h4 style={{ marginTop: '20px' }}>Recent Exams</h4>
            <table border="1" cellPadding="8" style={{ marginTop: '10px' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Start</th>
                  <th>End</th>
                </tr>
              </thead>
              <tbody>
                {fullExamList.slice(0, 5).map((exam) => (
                  <tr key={exam.id}>
                    <td>{exam.title}</td>
                    <td>{exam.subject}</td>
                    <td>{new Date(exam.startTime).toLocaleString()}</td>
                    <td>{new Date(exam.endTime).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'create':
        return (
          <div>
            <h3>➕ Create New Exam</h3>
            <TeacherExams inlineOnly />
          </div>
        );

      case 'questions':
        return (
          <div>
            <h3>🧠 Manage Questions</h3>
            <TeacherQuestions inlineOnly />
          </div>
        );

      case 'assign':
        return (
          <div>
            <h3>📤 Assign Exam to Students</h3>
            {dashboardData.totalExamsCreated === 0 ? (
              <p style={{ color: 'gray' }}>⚠️ No exams available. Please create an exam first.</p>
            ) : (
              <button onClick={() => navigate('/teacher/assign-exam')}>
                Go to Assign Exam Page
              </button>
            )}
          </div>
        );

      case 'stats':
        return (
          <div>
            <TeacherStats />
          </div>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { key: 'profile', label: '👤 Profile' },
    { key: 'exams', label: '📋 Exams' },
    { key: 'create', label: '➕ Create Exam' },
    { key: 'questions', label: '🧠 Questions' },
    { key: 'assign', label: '📤 Assign Exam' },
    { key: 'stats', label: '📈 Stats' }
  ];

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🧑‍🏫 Teacher Dashboard</h2>
            <LogoutButton />
      <button onClick={() => navigate('/change-password')}>
        Change Password
      </button>

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              marginRight: '10px',
              padding: '8px 16px',
              backgroundColor: activeTab === tab.key ? '#333' : '#eee',
              color: activeTab === tab.key ? '#fff' : '#000',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ marginTop: '20px' }}>
        {renderTab()}
      </div>
    </div>
  );
};

export default TeacherDashboard;
