// src/pages/admin/AdminEditLaborer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Spinner, Alert, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import icons for password visibility

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminEditLaborer() {
    const { id } = useParams(); // Get laborer ID from URL
    const navigate = useNavigate();
    const { token, user, loading: authLoading } = useAuth();

    const [laborerData, setLaborerData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        bio: '',
        hourly_rate: '',
        is_available: true,
        skills: [],
        user_type: 'laborer' // Should remain 'laborer' for this page
    });
    const [password, setPassword] = useState(''); // New state for the password field
    const [showPassword, setShowPassword] = useState(false); // State for password visibility

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch laborer data
    const fetchLaborer = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Authentication token missing. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/laborers/${id}`, {
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
            setLaborerData({
                full_name: data.full_name || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                bio: data.bio || '',
                hourly_rate: data.hourly_rate || '',
                is_available: data.is_available !== undefined ? data.is_available : true,
                skills: Array.isArray(data.skills) ? data.skills.join(', ') : '', // Convert array to comma-separated string
                user_type: data.user_type || 'laborer'
            });
            // Password field is not pre-filled for security reasons
            setPassword('');
        } catch (err) {
            setError(err.message || 'Failed to fetch laborer data.');
            console.error("Error fetching laborer:", err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        if (!authLoading && user && user.user_type === 'admin' && token) {
            fetchLaborer();
        } else if (!authLoading && (!user || user.user_type !== 'admin')) {
            setError('You are not authorized to view this page. Please log in as an admin.');
            setLoading(false);
        }
    }, [id, token, user, authLoading, fetchLaborer]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLaborerData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
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

        const payload = {
            ...laborerData,
            skills: laborerData.skills.split(',').map(s => s.trim()).filter(s => s !== '') // Convert string to array
        };

        if (password) { // Only add password to payload if it's not empty
            if (password.length < 6) {
                setError('New password must be at least 6 characters long.');
                setSubmitting(false);
                return;
            }
            payload.password = password;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/laborers/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSuccess(data.message || 'Laborer updated successfully!');
            setPassword(''); // Clear password field on success
            setTimeout(() => navigate('/admin/laborers'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to update laborer.');
            console.error("Error updating laborer:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="ms-2">Loading laborer data...</p>
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
                    <Button variant="link" onClick={() => navigate('/admin/laborers')} className="ms-3">Go Back</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Edit Laborer</h2>
            <Card className="shadow-sm p-4">
                <Form onSubmit={handleSubmit}>
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="full_name">
                                <Form.Label>Full Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="full_name"
                                    value={laborerData.full_name}
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
                                    value={laborerData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="phone_number">
                                <Form.Label>Phone Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="phone_number"
                                    value={laborerData.phone_number}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="hourly_rate">
                                <Form.Label>Hourly Rate (N)</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="hourly_rate"
                                    value={laborerData.hourly_rate}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="bio">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="bio"
                            value={laborerData.bio}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="skills">
                        <Form.Label>Skills (comma-separated)</Form.Label>
                        <Form.Control
                            type="text"
                            name="skills"
                            value={laborerData.skills}
                            onChange={handleChange}
                            placeholder="e.g., Plumbing, Carpentry, Electrician"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="is_available">
                        <Form.Check
                            type="checkbox"
                            label="Is Available"
                            name="is_available"
                            checked={laborerData.is_available}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* New Password Field */}
                    <Form.Group className="mb-4" controlId="password">
                        <Form.Label>New Password (Leave blank to keep current)</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button
                                variant="outline-secondary"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </Button>
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Enter a new password if you wish to change it. Minimum 6 characters.
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : 'Save Changes'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/laborers')} className="ms-2">
                        Cancel
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default AdminEditLaborer;
