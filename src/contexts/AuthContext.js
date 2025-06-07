import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      return parsedUser;
    } catch (error) {
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(!!user);
  const [loading, setLoading] = useState(user === null);
  useEffect(() => {
    setIsAuthenticated(!!user);
    setLoading(false); 
  }, [user]); 

  
  const isAdmin = user?.user_type === 'admin';
  const isEmployer = user?.user_type === 'employer';
  const isLaborer = user?.user_type === 'laborer';

  const login = (data) => {
    if (data && data.token && data._id) {
      setUser(data); 
      localStorage.setItem('user', JSON.stringify(data));
    } else {
      setUser(null); // Ensure user is null on malformed data
      localStorage.removeItem('user'); // Clear potentially bad data
    }
  };

  const logout = () => {
    setUser(null); 
    localStorage.removeItem('user'); 
  };

  const authContextValue = {
    user, 
    isAuthenticated,
    loading, 
    isAdmin,
    isEmployer,
    isLaborer,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);