// src/pages/admin/AdminProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_AVATAR_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='30' fill='%23757575'%3EAdmin%3C/text%3E%3C/svg%3E";

function AdminProfile() {
    const { token, user, loading: authLoading, refreshUser } = useAuth();
    const [profileData, setProfileData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        username: '',
        profile_picture_url: '', // This will store the URL returned from backend
        user_type: ''
    });
    const [profileImageFile, setProfileImageFile] = useState(null); // State for the new image file
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null); // CORRECTED: Changed 'null' to 'useState(null)'

    const fetchAdminProfile = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Authentication token missing. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setProfileData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                username: data.username || '',
                // Ensure profile_picture_url is correctly prefixed if it's a relative path
                // Fallback to DEFAULT_AVATAR_URL if no URL is provided from backend
                profile_picture_url: data.profile_picture_url && !data.profile_picture_url.startsWith('http')
                    ? `${API_BASE_URL}${data.profile_picture_url}`
                    : data.profile_picture_url || DEFAULT_AVATAR_URL,
                user_type: data.user_type || ''
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch profile data.');
            console.error("Error fetching admin profile:", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (!authLoading && user && user.user_type === 'admin' && token) {
            fetchAdminProfile();
        } else if (!authLoading && (!user || user.user_type !== 'admin')) {
            setError('You are not authorized to view this page. Please log in as an admin.');
            setLoading(false);
        }
    }, [user, authLoading, token, fetchAdminProfile]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        // The input field's name is 'profileImage', but we will append it as 'profile_picture' in FormData
        if (name === 'profileImage') {
            setProfileImageFile(files[0]);
            // Optionally, update profile_picture_url for instant preview
            if (files[0]) {
                setProfileData(prevData => ({
                    ...prevData,
                    profile_picture_url: URL.createObjectURL(files[0])
                }));
            } else {
                // If file input is cleared, revert to current stored URL or default
                setProfileData(prevData => ({
                    ...prevData,
                    profile_picture_url: user?.profile_picture_url && !user.profile_picture_url.startsWith('http')
                        ? `${API_BASE_URL}${user.profile_picture_url}`
                        : user?.profile_picture_url || DEFAULT_AVATAR_URL
                }));
            }
        } else {
            setProfileData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Authentication token missing. Please log in.');
            setSubmitting(false);
            return;
        }

        const formData = new FormData();
        formData.append('full_name', profileData.full_name);
        formData.append('email', profileData.email);
        formData.append('phone_number', profileData.phone_number);

        if (profileImageFile) {
            
            formData.append('profile_picture', profileImageFile);
        } else if (profileData.profile_picture_url === DEFAULT_AVATAR_URL && user?.profile_picture_url) {
           
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // 'Content-Type': 'multipart/form-data' is NOT set here.
                    // When using FormData, the browser automatically sets the correct Content-Type,
                    // including the boundary. Manually setting it will cause issues.
                },
                body: formData, // Send FormData directly
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            setSuccess(data.message || 'Profile updated successfully!');
            // Refresh user context to reflect changes in the sidebar/navbar
            refreshUser();
            // Clear the file input after successful upload
            setProfileImageFile(null);
            // Update the displayed URL to the new one from the backend response if available
            if (data.profile && data.profile.profile_picture_url) {
                setProfileData(prevData => ({
                    ...prevData,
                    profile_picture_url: `${API_BASE_URL}${data.profile.profile_picture_url}`
                }));
            } else if (data.profile && !data.profile.profile_picture_url) {
                // If backend indicates image was removed or not set, revert to default
                setProfileData(prevData => ({
                    ...prevData,
                    profile_picture_url: DEFAULT_AVATAR_URL
                }));
            }

        } catch (err) {
            setError(err.message || 'Failed to update profile.');
            console.error("Error updating admin profile:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading profile...</span>
                </Spinner>
                <p className="ms-2">Loading admin profile data...</p>
            </Container>
        );
    }

    if (error && error.includes('authorized')) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    Error: {error}
                    <Button variant="link" onClick={() => window.location.reload()} className="ms-3">Retry</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Admin Profile</h2>
            <Card className="shadow-sm p-4">
                <Form onSubmit={handleSubmit}>
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="text-center mb-4">
                        <img
                            src={profileData.profile_picture_url} // Use state URL directly
                            alt="Profile"
                            className="rounded-circle"
                            style={{ width: '150px', height: '150px', objectFit: 'cover', border: '2px solid #ddd' }}
                            // Removed onError handler as base64 SVG will not fail
                        />
                        <Form.Group controlId="profileImage" className="mt-3">
                            <Form.Label>Upload Profile Picture</Form.Label>
                            <Form.Control
                                type="file"
                                name="profileImage" // Keep input name as profileImage for handleChange logic
                                accept="image/*"
                                onChange={handleChange}
                            />
                            <small className="text-muted mt-1 d-block">Upload a new image to change your profile picture.</small>
                        </Form.Group>
                    </div>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="full_name">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="full_name"
                                    value={profileData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="email">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={profileData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="username">
                                <Form.Label>Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={profileData.username}
                                    readOnly // Username is usually not editable
                                    disabled // Disable the input
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="phone_number">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone_number"
                                    value={profileData.phone_number}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="user_type">
                        <Form.Label>User Type</Form.Label>
                        <Form.Control
                            type="text"
                            name="user_type"
                            value={profileData.user_type}
                            readOnly // User type should not be editable by the user
                            disabled
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : 'Save Changes'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default AdminProfile;
