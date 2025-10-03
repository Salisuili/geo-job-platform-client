import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa'; // Import icons
import { Button, Alert } from 'react-bootstrap'; // Import bootstrap components

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function SignUp() {
    // State for all form fields
    const [fullName, setFullName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState(''); // 'laborer' or 'employer'
    const [phoneNumber, setPhoneNumber] = useState('');
    
    // Laborer specific fields
    const [bio, setBio] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [skills, setSkills] = useState(''); // Comma-separated string
    
    // Employer specific fields
    const [companyName, setCompanyName] = useState('');
    const [companyDescription, setCompanyDescription] = useState('');

    // === NEW LOCATION STATES ===
    const [city, setCity] = useState('');
    const [coords, setCoords] = useState({ latitude: null, longitude: null });
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    // ===========================

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    // The function to get user's geo-location and reverse geocode it
    const getAndSetLocation = useCallback(() => {
        setLocationLoading(true);
        setLocationError(null);
        // Clear previous location states on refresh/retry
        setCity('');
        setCoords({ latitude: null, longitude: null });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoords({ latitude, longitude }); // Save GeoJSON coordinates

                    try {
                        // Reverse geocoding using Nominatim (OpenStreetMap)
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data.address) {
                            // Extract relevant location string
                            const cityName = data.address.city || data.address.town || data.address.village || data.address.state || '';
                            setCity(cityName); // Save human-readable city/state for manual display
                        } else {
                            setLocationError('Could not identify city name from coordinates.');
                        }
                    } catch (geoError) {
                        console.error("Reverse geocoding error:", geoError);
                        setLocationError('Error converting coordinates to city name.');
                    } finally {
                        setLocationLoading(false);
                    }
                },
                (error) => {
                    let message = 'Location access denied or unavailable. Please enter your location manually.';
                    if (error.code === error.PERMISSION_DENIED) {
                        message = 'Location permission was denied. Please enable it or enter your location manually.';
                    }
                    setLocationError(message);
                    setLocationLoading(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser. Please enter your location manually.');
            setLocationLoading(false);
        }
    }, []);

    // Effect to run location fetching when the component mounts
    useEffect(() => {
        getAndSetLocation();
    }, [getAndSetLocation]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Basic validation
        if (!fullName || !username || !email || !password || !userType) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        if (userType === 'laborer' && !city) {
            setError('Please set your location (City/Town) manually or via GPS to help employers find you.');
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
            phone_number: phoneNumber || undefined,
            city: city || undefined, // Include city for all users if available, or just laborers
        };

        if (userType === 'laborer') {
            userData.bio = bio;
            userData.hourly_rate = hourlyRate ? parseFloat(hourlyRate) : undefined;
            userData.skills = skills ? skills.split(',').map(s => s.trim()) : [];
            
            // Add GeoJSON object for MongoDB Geospatial index (long, lat format)
            if (coords.latitude && coords.longitude) {
                userData.current_location = {
                    type: 'Point',
                    // Note: GeoJSON stores coordinates as [longitude, latitude]
                    coordinates: [coords.longitude, coords.latitude] 
                };
            }
        } else if (userType === 'employer') {
            userData.company_name = companyName;
            userData.company_description = companyDescription || undefined;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
                login(data);
                alert('Account created successfully!');
                if (data.user_type === 'laborer') {
                    navigate('/jobs');
                } else if (data.user_type === 'employer') {
                    navigate('/my-jobs');
                } else {
                    navigate('/');
                }
            } else {
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
            <div className="container d-flex flex-grow-1 justify-content-center align-items-center py-5">
                <div className="w-100" style={{ maxWidth: '500px' }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">Create your account</h2>
                        {error && <div className="alert alert-danger mt-3">{error}</div>}
                    </div>
                    <form onSubmit={handleSubmit}>
                        {/* Basic Fields */}
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
                                placeholder="Username"
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
                                type="tel"
                                className="form-control form-control-lg"
                                placeholder="Phone Number (Optional)"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        
                        {/* User Type Radio Buttons */}
                        <div className="mb-3 d-flex justify-content-around">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="userType"
                                    id="laborer"
                                    value="laborer"
                                    checked={userType === 'laborer'}
                                    onChange={(e) => setUserType(e.target.value)}
                                    required
                                />
                                <label className="form-check-label" htmlFor="laborer">
                                    I'm a **Laborer**
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
                                    I'm an **Employer**
                                </label>
                            </div>
                        </div>

                        {/* Location Fields (Visible only for Laborer) */}
                        {userType === 'laborer' && (
                            <div className="mb-4 p-3 border rounded bg-white">
                                <h6 className="mb-3 d-flex align-items-center"><FaMapMarkerAlt className="me-2 text-primary" /> **Your Location** (Required for jobs)</h6>
                                
                                {locationLoading && (
                                    <Alert variant="info" className="p-2 small mb-2">
                                        <FaSyncAlt className="me-1 spinner-border spinner-border-sm" /> Fetching location...
                                    </Alert>
                                )}
                                
                                {locationError && (
                                    <Alert variant="warning" className="p-2 small mb-2">
                                        {locationError}
                                    </Alert>
                                )}

                                {coords.latitude && (
                                    <Alert variant="success" className="p-2 small mb-2">
                                        Location captured! Showing: **{city}**
                                    </Alert>
                                )}

                                <Button
                                    variant="outline-primary"
                                    onClick={getAndSetLocation}
                                    disabled={locationLoading}
                                    className="w-100 mb-2"
                                >
                                    <FaMapMarkerAlt className="me-1" /> {locationLoading ? 'Retrying...' : 'Use Current Location'}
                                </Button>

                                <input
                                    type="text"
                                    className="form-control form-control-lg"
                                    placeholder="City/Town (Enter manually if GPS failed)"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                />
                                <small className="form-text text-muted">This is how local employers will find you.</small>
                            </div>
                        )}


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

                        {/* Submit Button */}
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
