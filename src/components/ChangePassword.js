import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
  const { rollNo, token, forceChangePassword, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false); // ✅ Define loading state

  if (!forceChangePassword) {
    return <p>You are not allowed to change your password again.</p>;
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setMessage("New passwords do not match");
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:8081/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rollNo,
          oldPassword,
          newPassword,
        }),
      });

      const result = await response.text();

      if (response.ok && result === 'Password changed successfully') {
        setMessage('Password changed successfully. Redirecting to login...');
        logout(); // ✅ Clear token/context
        setTimeout(() => navigate('/login'), 1500); // ✅ Redirect after delay
      } else {
        setMessage(result);
      }

    } catch (error) {
      console.error('Error:', error);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Change Password</h2>
      <form onSubmit={handleChangePassword}>
        <input
          type="password"
          placeholder="Old Password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ChangePassword;
