import { createContext, useContext, useState } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [rollNo, setRollNo] = useState(() => localStorage.getItem('rollNo'));
  const [forceChangePassword, setForceChangePassword] = useState(() =>
  localStorage.getItem('forceChangePassword') === 'true'
);

const login = (newToken, newRole, newRollNo, newForceChangePassword) => {
  localStorage.setItem('token', newToken);
  localStorage.setItem('role', newRole);
  localStorage.setItem('rollNo', newRollNo);
  localStorage.setItem('forceChangePassword', newForceChangePassword);

  setToken(newToken);
  setRole(newRole);
  setRollNo(newRollNo);
  setForceChangePassword(newForceChangePassword);
};

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('rollNo');
    setToken(null);
    setRole(null);
    setRollNo(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, rollNo, forceChangePassword, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
