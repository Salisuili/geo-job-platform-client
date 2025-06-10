import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      return parsedUser;
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
      localStorage.removeItem('user'); 
      return null;
    }
  });

  const [token, setToken] = useState(user ? user.token : null);

  const [isAuthenticated, setIsAuthenticated] = useState(!!user && !!(user ? user.token : null)); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    setIsAuthenticated(!!user && !!user.token);
    setToken(user ? user.token : null); 
    setLoading(false); 
  }, [user]); 

  const isAdmin = user?.user_type === 'admin';
  const isEmployer = user?.user_type === 'employer';
  const isLaborer = user?.user_type === 'laborer';

  const login = (data) => {
    if (data && data.token && data._id) {
      setUser(data);
      setToken(data.token); 
      localStorage.setItem('user', JSON.stringify(data));
    } else {
      setUser(null);
      setToken(null); 
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null); 
    localStorage.removeItem('user');
  };

  const authContextValue = {
    user,
    token, 
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