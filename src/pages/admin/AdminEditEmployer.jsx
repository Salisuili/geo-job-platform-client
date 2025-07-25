// src/pages/admin/AdminEditEmployer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminEditEmployer() {
    const { id } = useParams(); // Get employer ID from URL
    const navigate = useNavigate();
    const { token, user, loading: authLoading } = useAuth(); // Destructure authLoading from useAuth

    const [employerData, setEmployerData] = useState({
        company_name: '',
        email: '',
        phone_number: '',
        address_text: '',
        company_description: '',
        user_type: 'employer' // Should remain 'employer' for this page
    });
    const [loading, setLoading] = useState(true); // Local loading state for data fetch
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch employer data
    const fetchEmployer = useCallback(async () => {
        setLoading(true); // Start local loading
        setError(null); // Clear previous errors
        setSuccess(null); // Clear previous success messages

        if (!token) {
            setError('Authentication token missing. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/employers/${id}`, {
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
            setEmployerData({
                company_name: data.company_name || '',
                email: data.email || '',
                phone_number: data.phone_number || '',
                address_text: data.address_text || '',
                company_description: data.company_description || '',
                user_type: data.user_type || 'employer'
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch employer data.');
            console.error("Error fetching employer:", err);
        } finally {
            setLoading(false); // End local loading
        }
    }, [id, token]); // Dependencies: id and token

    useEffect(() => {
        // Only attempt to fetch if auth is NOT loading, user is an admin, and we have a token.
        // This ensures fetchEmployer runs only when the auth state is stable and correct.
        if (!authLoading && user && user.user_type === 'admin' && token) {
            fetchEmployer();
        } else if (!authLoading && (!user || user.user_type !== 'admin')) {
            // If auth has finished loading AND user is null OR user is not an admin,
            // then they are not authorized to view this page.
            setError('You are not authorized to view this page. Please log in as an admin.');
            setLoading(false); // Stop local loading
        }
        // Dependencies for this useEffect:
        // - id: changes when navigating to a different employer
        // - token: changes on login/logout
        // - user: changes when auth state changes (e.g., user object becomes available)
        // - authLoading: ensures we wait for auth context to initialize
        // - fetchEmployer: a stable useCallback, so it won't cause infinite loops itself
    }, [id, token, user, authLoading, fetchEmployer]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployerData(prevData => ({
            ...prevData,
            [name]: value
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

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/employers/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(employerData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSuccess(data.message || 'Employer updated successfully!');
            // Optionally navigate back after a short delay
            setTimeout(() => navigate('/admin/employers'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to update employer.');
            console.error("Error updating employer:", err);
        } finally {
            setSubmitting(false);
        }
    };

    // Conditional rendering for initial loading or auth loading
    if (authLoading || loading) { // Use both authLoading and local loading
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="ms-2">Loading employer data...</p>
            </Container>
        );
    }

    // Conditional rendering for authorization errors
    if (error && error.includes('authorized')) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    {error}
                </Alert>
            </Container>
        );
    }

    // Conditional rendering for other errors (e.g., 404 from backend)
    if (error) {
        return (
            <Container className="py-4">
                <Alert variant="danger">
                    Error: {error}
                    <Button variant="link" onClick={() => navigate('/admin/employers')} className="ms-3">Go Back</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Edit Employer</h2>
            <Card className="shadow-sm p-4">
                <Form onSubmit={handleSubmit}>
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Form.Group className="mb-3" controlId="company_name">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="company_name"
                            value={employerData.company_name}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={employerData.email}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="phone_number">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone_number"
                            value={employerData.phone_number}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="address_text">
                        <Form.Label>Address Text</Form.Label>
                        <Form.Control
                            type="text"
                            name="address_text"
                            value={employerData.address_text}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="company_description">
                        <Form.Label>Company Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            name="company_description"
                            value={employerData.company_description}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {/* Admin can potentially change user_type, though it's usually fixed for employer edit */}
                    {/* <Form.Group className="mb-3" controlId="user_type">
                        <Form.Label>User Type</Form.Label>
                        <Form.Control
                            as="select"
                            name="user_type"
                            value={employerData.user_type}
                            onChange={handleChange}
                            required
                        >
                            <option value="employer">Employer</option>
                            <option value="laborer">Laborer</option>
                            <option value="admin">Admin</option>
                        </Form.Control>
                    </Form.Group> */}

                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : 'Save Changes'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/employers')} className="ms-2">
                        Cancel
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default AdminEditEmployer;
