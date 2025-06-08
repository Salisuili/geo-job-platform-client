import React, { useState, useEffect } from "react"; // Add useEffect
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is in src/contexts

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const Login = () => {
  // State for form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State for UI feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user } = useAuth(); // Get login function and user object from AuthContext
  const navigate = useNavigate(); // For programmatic navigation

  // Add useEffect to redirect if already logged in (e.g., after refresh)
  useEffect(() => {
    // Only redirect if 'user' is already present in AuthContext and not in loading state
    // (The 'loading' check is handled by AuthContext, so if 'user' exists, it's considered loaded)
    if (user) {
      if (user.user_type === 'laborer') {
        navigate('/jobs');
      } else if (user.user_type === 'employer') {
        navigate('/dashboard');
      } else if (user.user_type === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/'); // Fallback
      }
    }
  }, [user, navigate]); // Depend on 'user' and 'navigate'

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }), // Send email and password
      });

      const data = await response.json();

      if (response.ok) {
        // Login successful
        login(data); // Call login function from AuthContext to store user info and token
        alert('Login successful!'); // Consider replacing with a non-blocking toast notification

        if (data.user_type === 'laborer') { // CORRECT: Access data.user_type directly
          navigate('/jobs');
        } else if (data.user_type === 'employer') { // CORRECT: Access data.user_type directly
          navigate('/my-jobs');
        } else if (data.user_type === 'admin') { // CORRECT: Access data.user_type directly
          navigate('/admin/dashboard');
        } else {
            navigate('/'); // Fallback
        }
      } else {
        // Login failed (e.g., invalid credentials)
        setError(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('Network error. Please check your connection or server status.');
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-light">
      <main className="flex-grow-1 d-flex justify-content-center align-items-center px-4 py-5">
        <div className="w-100" style={{ maxWidth: "480px" }}>
          <h2 className="text-center fw-bold mb-4">Welcome back</h2>
          {error && <div className="alert alert-danger mt-3">{error}</div>} {/* Display error */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-medium">
                Username or email
              </label>
              <input
                type="text"
                className="form-control form-control-lg"
                id="email"
                placeholder="Enter your username or email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label fw-medium">
                Password
              </label>
              <input
                type="password"
                className="form-control form-control-lg"
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3 text-end">
              <Link to="/forgot-password" className="text-decoration-underline text-muted small">
                Forgot password?
              </Link>
            </div>

            <div className="d-grid">
              <button type="submit" className="btn btn-primary btn-lg fw-bold" disabled={loading}>
                {loading ? 'Logging in...' : 'Log in'}
              </button>
            </div>

            <p className="text-center text-muted mt-3">
              Don't have an account?{' '}
              <Link to="/signup" className="text-decoration-underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;