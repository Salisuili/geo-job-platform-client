import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <--- IMPORT useLocation

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); // <--- INITIALIZE useLocation here

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

  const [token, setToken] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      return parsedUser ? parsedUser.token : null;
    } catch (error) {
      console.error("Failed to get token from localStorage:", error);
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    const parsedUser = storedUser ? JSON.parse(storedUser) : null;

    const newIsAuthenticated = !!parsedUser && !!(parsedUser.token || storedToken);
    setIsAuthenticated(newIsAuthenticated);
    setUser(parsedUser);
    setToken(parsedUser ? parsedUser.token || storedToken : null);

    // --- IMPORTANT: Initial Redirection Logic ---
    // This ensures users land on their dashboard if they refresh while logged in
    if (newIsAuthenticated && parsedUser) {
        // Use location.pathname from useLocation hook
        if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
            if (parsedUser.user_type === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (parsedUser.user_type === 'employer') {
                navigate('/dashboard', { replace: true });
            }
            // For laborer, you might navigate to a laborer-specific dashboard
            // else if (parsedUser.user_type === 'laborer') {
            //     navigate('/jobs', { replace: true });
            // }
        }
    }

    setLoading(false);
  }, [navigate, location]); // <--- Add 'location' to dependencies

  const isAdmin = user?.user_type === 'admin';
  const isEmployer = user?.user_type === 'employer';
  const isLaborer = user?.user_type === 'laborer';

  const login = (data) => {
    if (data && data.token) {
      setUser(data);
      setToken(data.token);
      localStorage.setItem('user', JSON.stringify(data));

      if (data.user_type === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (data.user_type === 'employer') {
        navigate('/my-jobs', { replace: true }); // Changed to my-jobs as per App.jsx
      } else if (data.user_type === 'laborer') {
          navigate('/jobs', { replace: true }); // Changed to jobs as per App.jsx
      } else {
        navigate('/', { replace: true });
      }
    } else {
      console.error("Login data missing token or user type:", data);
      setUser(null);
      setToken(null);
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
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