import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import LogoutButton from '../components/LogoutButton';

const StudentDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
    
  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [assignedExams, setAssignedExams] = useState([]);
  const [completedExams, setCompletedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assigned');
  const [upcomingExams, setUpcomingExams] = useState([]);
  const safeJsonArray = async (res) => {
  try {
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
  };
  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [
        profileRes,
        dashboardRes,
        assignedRes,
        upcomingRes,
        completedRes
      ] = await Promise.all([
        fetch('http://localhost:8081/student/profile', { headers }),
        fetch('http://localhost:8081/student/dashboard', { headers }),
        fetch('http://localhost:8081/student/exams/assigned', { headers }),
        fetch('http://localhost:8081/student/exams/upcoming', { headers }),
        fetch('http://localhost:8081/student/exams/completed', { headers })
      ]);
      if (!dashboardRes.ok) {
  const msg = await dashboardRes.text(); // This avoids .json() crash
  alert("Dashboard error: " + msg);
  return;
}
      setProfile(await profileRes.json());
      const dashboardData = await dashboardRes.json();
      setDashboard(dashboardData);
      setAnnouncements(dashboardData.announcements || []);
setAssignedExams(await safeJsonArray(assignedRes));
setCompletedExams(await safeJsonArray(completedRes));
setUpcomingExams(await safeJsonArray(upcomingRes));
    } catch (err) {
      console.error('Error loading student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleStartExam = async (examId) => {
    try {
      const res = await fetch(`http://localhost:8081/student/exams/${examId}/start`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const session = await res.json();
        navigate(`/student/exams/session/${session.sessionId}`); // ✅ Go to sessionId route
      } else {
        alert("Failed to start exam.");
      }
    } catch (err) {
      console.error("Error starting exam:", err);
    }
  };

  const renderExams = (exams) => {
      if (!Array.isArray(exams)) {
        return <p>No exams found.</p>;
    }
    const isCompletedTab = activeTab === 'completed';
    const tableHeaders = [
      "Title", "Subject", "Teacher", "Status", "Start", "End",
      ...(isCompletedTab ? ["Score"] : []),
      "Actions"
    ];

    return exams.length === 0 ? (
      <p>No exams found.</p>
    ) : (
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            {tableHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => (
            <tr key={exam.examId}>
              <td>{exam.examTitle}</td>
              <td>{exam.subject}</td>
              <td>{exam.teacherName}</td>
              <td>{exam.status}</td>
              <td>{new Date(exam.startTime).toLocaleString()}</td>
              <td>{new Date(exam.endTime).toLocaleString()}</td>
              {isCompletedTab && <td> {exam.correctAnswers} / {exam.totalQuestions}</td>}
              <td>
                {exam.canStart ? (
                  <button onClick={() => handleStartExam(exam.examId)}>
                    Start
                  </button>
                ) : (
                  <span style={{ color: 'gray' }}>{exam.status}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  if (loading || !profile || !dashboard) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <LogoutButton />
      <button onClick={() => navigate('/change-password')}>
        Change Password
      </button>
      <h2>🎓 Welcome, {profile.fullName}</h2>
      <p>
        Roll No: {profile.rollNo} | Dept: {profile.department} | Year: {profile.year}
      </p>

      <h3>📊 Dashboard Stats</h3>
      <ul>
        <li>Total Exams Assigned: {profile.totalExamsAssigned}</li>
        <li>Exams Completed: {profile.totalExamsCompleted}</li>
        <li>Average Score: {profile.averageScore}%</li>
        <li>Upcoming: {dashboard.upcoming}</li>
        <li>Completed: {dashboard.completed}</li>
        <li>Pending: {dashboard.pending}</li>
      </ul>

      <h3>📢 Announcements</h3>
      <ul>
        {announcements.length === 0 ? (
          <li>No announcements yet.</li>
        ) : (
          announcements.map((msg, idx) => <li key={idx}>{msg}</li>)
        )}
      </ul>

      <h3>📝 Exams</h3>
      <div style={{ marginBottom: '15px' }}>
        <button onClick={() => setActiveTab('assigned')} style={{ marginRight: '10px' }}>
          Assigned
        </button>
        <button onClick={() => setActiveTab('upcoming')} style={{ marginRight: '10px' }}>
          Upcoming
        </button>
        <button onClick={() => setActiveTab('completed')}>Completed</button>
      </div>

      <div>
        {activeTab === 'assigned' && renderExams(assignedExams)}
        {activeTab === 'upcoming' && renderExams(upcomingExams)}
        {activeTab === 'completed' && renderExams(completedExams)}
      </div>
    </div>
  );
};

export default StudentDashboard;
