import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import TeacherAssignExam from './pages/TeacherAssignExam';
import StudentExamPage from './pages/StudentExamPage';
import StudentResultPage from './pages/StudentResultPage';
import TeacherStats from './pages/TeacherStats';
import ProtectedRoute from './components/ProtectedRoute';
import ChangePassword from './components/ChangePassword';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* ✅ Protected Teacher Routes */}
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/assign-exam" element={
          <ProtectedRoute role="teacher">
            <TeacherAssignExam />
          </ProtectedRoute>
        } />
        <Route path="/teacher/stats" element={
          <ProtectedRoute role="teacher">
            <TeacherStats />
          </ProtectedRoute>
        } />

        {/* ✅ Protected Student Routes */}
        <Route path="/student/dashboard" element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        } />
        <Route path="/student/exams/:examId/start" element={
          <ProtectedRoute role="student">
            <StudentExamPage />
          </ProtectedRoute>
        } />
        <Route path="/student/exams/session/:sessionId" element={
          <ProtectedRoute role="student">
            <StudentExamPage />
          </ProtectedRoute>
        } />
        <Route path="/student/results/:sessionId" element={
          <ProtectedRoute role="student">
            <StudentResultPage />
          </ProtectedRoute>
        } />
        <Route path="/student/results" element={
          <ProtectedRoute role="student">
            <StudentResultPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
