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
      localStorage.removeItem('user'); // Clear corrupted data
      return null;
    }
  });

  // ********** IMPORTANT ADDITION: The 'token' state **********
  const [token, setToken] = useState(user ? user.token : null);
  // ************************************************************

  const [isAuthenticated, setIsAuthenticated] = useState(!!user && !!(user ? user.token : null)); // Check if user and user.token exist
  const [loading, setLoading] = useState(true); // Start loading as true for initial check

  useEffect(() => {
    // This effect ensures isAuthenticated and token state are correctly set
    // after the initial load from localStorage or subsequent user changes.
    setIsAuthenticated(!!user && !!user.token);
    setToken(user ? user.token : null); // Ensure token state is updated from user object
    setLoading(false); // Auth loading is complete after checking local storage
  }, [user]); // Depend on 'user' changing to trigger re-evaluation

  const isAdmin = user?.user_type === 'admin';
  const isEmployer = user?.user_type === 'employer';
  const isLaborer = user?.user_type === 'laborer';

  const login = (data) => {
    if (data && data.token && data._id) {
      setUser(data);
      setToken(data.token); // ********** Set the token state here **********
      localStorage.setItem('user', JSON.stringify(data));
      // The useEffect above will handle setIsAuthenticated and setLoading based on the new user/token
    } else {
      setUser(null);
      setToken(null); // ********** Clear token state on malformed data **********
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null); // ********** Clear token state on logout **********
    localStorage.removeItem('user');
  };

  const authContextValue = {
    user,
    token, // ********** EXPOSE THE TOKEN HERE so consuming components can access it **********
    isAuthenticated,
    loading, // This is 'authLoading' in your LaborerList component
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