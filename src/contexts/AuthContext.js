// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // In a real app, you'd check localStorage for a token,
  // or make an API call to verify session on app load.
  const [user, setUser] = useState(null); // null if not logged in, object if logged in
  const [loading, setLoading] = useState(true); // To indicate if auth check is in progress

  useEffect(() => {
    // Simulate checking for a logged-in user (e.g., from a token in localStorage)
    const storedUser = JSON.parse(localStorage.getItem('currentUser'));
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false); // Auth check complete
  }, []);

  const login = (userData) => {
    // In a real app, this would involve sending credentials to backend,
    // receiving a token/user data, and storing it (e.g., in localStorage).
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const logout = () => {
    // In a real app, this might also involve an API call to invalidate session.
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Helper getters
  const isAuthenticated = !!user;
  const isAdmin = user && user.user_type === 'admin';
  const isEmployer = user && user.user_type === 'employer';
  const isLaborer = user && user.user_type === 'laborer';

  if (loading) {
    // You could render a loading spinner here
    return <div>Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, isEmployer, isLaborer, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};