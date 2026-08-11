import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [userMode, setUserMode] = useState('donor'); // 'donor' or 'accepter'

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // Initialize mode based on saved preference or default to donor
      const savedMode = localStorage.getItem('userMode');
      if (savedMode) setUserMode(savedMode);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userMode');
  };

  const toggleUserMode = (mode) => {
    setUserMode(mode);
    localStorage.setItem('userMode', mode);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, userMode, toggleUserMode }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
