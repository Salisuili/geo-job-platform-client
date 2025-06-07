import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assuming AuthContext is in src/contexts

function SignUp() {
  // State for all form fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState(''); // Added username field
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState(''); // 'laborer' or 'employer'
  const [phoneNumber, setPhoneNumber] = useState(''); // Added phone_number
  // Laborer specific fields
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [skills, setSkills] = useState(''); // Comma-separated string for now
  // Employer specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyDescription, setCompanyDescription] = useState(''); // Added company_description

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth(); // Get the login function from AuthContext
  const navigate = useNavigate(); // For redirection

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setLoading(true);
    setError('');

    // Basic validation
    if (!fullName || !username || !email || !password || !userType) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    // Construct the data payload based on user_type
    let userData = {
      full_name: fullName,
      username,
      email,
      password,
      user_type: userType,
      phone_number: phoneNumber || undefined, // Only send if not empty
    };

    if (userType === 'laborer') {
      userData.bio = bio;
      userData.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : undefined;
      userData.skills = skills ? skills.split(',').map(s => s.trim()) : [];
    } else if (userType === 'employer') {
      userData.company_name = companyName;
      userData.company_description = companyDescription || undefined;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful signup
        login(data); // Store user data and token in AuthContext
        alert('Account created successfully!');
        // Redirect based on user type or to a dashboard
        if (data.user_type === 'laborer') {
          navigate('/jobs'); // Redirect laborers to jobs listing
        } else if (data.user_type === 'employer') {
          navigate('/my-jobs'); // Redirect employers to their posted jobs
        } else {
            navigate('/'); // Fallback
        }
      } else {
        // Handle errors from the backend (e.g., email already exists)
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Network error during signup:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      {/* Sign Up Form */}
      <div className="container d-flex flex-grow-1 justify-content-center align-items-center py-5">
        <div className="w-100" style={{ maxWidth: '500px' }}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">Create your account</h2>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Username" // Added username input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="email"
                className="form-control form-control-lg"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
             <div className="mb-3">
              <input
                type="tel" // Use tel for phone numbers
                className="form-control form-control-lg"
                placeholder="Phone Number (Optional)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <div className="mb-3 d-flex justify-content-around">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType" // Changed name from 'role' to 'userType' for consistency
                  id="laborer"
                  value="laborer"
                  checked={userType === 'laborer'}
                  onChange={(e) => setUserType(e.target.value)}
                  required
                />
                <label className="form-check-label" htmlFor="laborer">
                  I'm a laborer
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="userType"
                  id="employer"
                  value="employer"
                  checked={userType === 'employer'}
                  onChange={(e) => setUserType(e.target.value)}
                  required
                />
                <label className="form-check-label" htmlFor="employer">
                  I'm an employer
                </label>
              </div>
            </div>

            {/* Conditional fields based on user type */}
            {userType === 'laborer' && (
              <>
                <div className="mb-3">
                  <textarea
                    className="form-control form-control-lg"
                    placeholder="Brief Bio (e.g., your experience)"
                    rows="3"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>
                <div className="mb-3">
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    placeholder="Hourly Rate (e.g., 25.00)"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Skills (comma-separated, e.g., 'Plumbing, Electrical')"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                  />
                </div>
              </>
            )}

            {userType === 'employer' && (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <textarea
                    className="form-control form-control-lg"
                    placeholder="Company Description (Optional)"
                    rows="3"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                  ></textarea>
                </div>
              </>
            )}

            <div className="d-grid mb-3">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? 'Signing Up...' : 'Sign Up'}
              </button>
            </div>

            <p className="text-center text-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-decoration-underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignUp;