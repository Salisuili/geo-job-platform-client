// src/pages/admin/AdminEditJob.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminEditJob() {
    const { id } = useParams(); // Get job ID from URL
    const navigate = useNavigate();
    const { token, user, loading: authLoading } = useAuth();

    const [jobData, setJobData] = useState({
        title: '',
        description: '',
        job_type: '',
        pay_rate_min: '',
        pay_rate_max: '',
        pay_type: 'Hourly', // Default or fetch from existing job
        city: '',
        state: '',
        country: '',
        address_text: '',
        coordinates: [], // NEW: Add coordinates to state, assuming [longitude, latitude]
        status: 'Active', // Default or fetch from existing job
        image_url: ''
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Fetch job data
    const fetchJob = useCallback(async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (!token) {
            setError('Authentication token missing. Please log in.');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${id}`, {
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
            setJobData({
                title: data.title || '',
                description: data.description || '',
                job_type: data.job_type || '',
                pay_rate_min: data.pay_rate_min || '',
                pay_rate_max: data.pay_rate_max || '',
                pay_type: data.pay_type || 'Hourly',
                city: data.location?.city || '',
                state: data.location?.state || '',
                country: data.location?.country || '',
                address_text: data.location?.address_text || '',
                coordinates: data.location?.coordinates || [], // NEW: Fetch coordinates
                status: data.status || 'Active',
                image_url: data.image_url || ''
            });
        } catch (err) {
            setError(err.message || 'Failed to fetch job data.');
            console.error("Error fetching job:", err);
        } finally {
            setLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        if (!authLoading && user && user.user_type === 'admin' && token) {
            fetchJob();
        } else if (!authLoading && (!user || user.user_type !== 'admin')) {
            setError('You are not authorized to view this page. Please log in as an admin.');
            setLoading(false);
        }
    }, [id, token, user, authLoading, fetchJob]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJobData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle change for coordinates (e.g., if you add input fields for them)
    const handleCoordinateChange = (index, value) => {
        setJobData(prevData => {
            const newCoordinates = [...prevData.coordinates];
            newCoordinates[index] = parseFloat(value);
            return {
                ...prevData,
                coordinates: newCoordinates
            };
        });
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
            const payload = {
                ...jobData,
                pay_rate_min: parseFloat(jobData.pay_rate_min),
                pay_rate_max: parseFloat(jobData.pay_rate_max),
                // NEW: Send location as a nested object, including coordinates
                location: {
                    city: jobData.city,
                    state: jobData.state,
                    country: jobData.country,
                    address_text: jobData.address_text,
                    coordinates: jobData.coordinates.length === 2 && jobData.coordinates[0] !== null && jobData.coordinates[1] !== null
                        ? jobData.coordinates // Only send if valid coordinates exist
                        : undefined // Don't send if empty or invalid
                }
            };

            // Remove top-level location fields if they are now nested
            delete payload.city;
            delete payload.state;
            delete payload.country;
            delete payload.address_text;
            delete payload.coordinates; // Remove top-level coordinates as they are nested under location

            const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${id}`, {
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
            setSuccess(data.message || 'Job updated successfully!');
            setTimeout(() => navigate('/admin/job-listings'), 2000);
        } catch (err) {
            setError(err.message || 'Failed to update job.');
            console.error("Error updating job:", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading job data...</span>
                </Spinner>
                <p className="ms-2">Loading job data...</p>
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
                    <Button variant="link" onClick={() => navigate('/admin/job-listings')} className="ms-3">Go Back</Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            <h2 className="mb-4">Edit Job Listing</h2>
            <Card className="shadow-sm p-4">
                <Form onSubmit={handleSubmit}>
                    {success && <Alert variant="success">{success}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="title">
                                <Form.Label>Job Title</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={jobData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="job_type">
                                <Form.Label>Job Type</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="job_type"
                                    value={jobData.job_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Temporary">Temporary</option>
                                    <option value="Seasonal">Seasonal</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="description">
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            name="description"
                            value={jobData.description}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="pay_rate_min">
                                <Form.Label>Minimum Pay</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="pay_rate_min"
                                    value={jobData.pay_rate_min}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="pay_rate_max">
                                <Form.Label>Maximum Pay</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="pay_rate_max"
                                    value={jobData.pay_rate_max}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group className="mb-3" controlId="pay_type">
                                <Form.Label>Pay Type</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="pay_type"
                                    value={jobData.pay_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Hourly">Hourly</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Annually">Annually</option>
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="city">
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    value={jobData.city}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="state">
                                <Form.Label>State</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="state"
                                    value={jobData.state}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="country">
                                <Form.Label>Country</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="country"
                                    value={jobData.country}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="address_text">
                                <Form.Label>Address Text</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address_text"
                                    value={jobData.address_text}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    {/* NEW: Input fields for Coordinates */}
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="longitude">
                                <Form.Label>Longitude</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    name="longitude"
                                    value={jobData.coordinates[0] !== undefined ? jobData.coordinates[0] : ''}
                                    onChange={(e) => handleCoordinateChange(0, e.target.value)}
                                    placeholder="e.g., 7.6912"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3" controlId="latitude">
                                <Form.Label>Latitude</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    name="latitude"
                                    value={jobData.coordinates[1] !== undefined ? jobData.coordinates[1] : ''}
                                    onChange={(e) => handleCoordinateChange(1, e.target.value)}
                                    placeholder="e.g., 10.9876"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3" controlId="status">
                        <Form.Label>Job Status</Form.Label>
                        <Form.Control
                            as="select"
                            name="status"
                            value={jobData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Closed">Closed</option>
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="image_url">
                        <Form.Label>Image URL (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="image_url"
                            value={jobData.image_url}
                            onChange={handleChange}
                            placeholder="e.g., /uploads/job_images/your_image.jpg"
                        />
                        {jobData.image_url && (
                            <div className="mt-2">
                                <img src={`${API_BASE_URL}${jobData.image_url.startsWith('/uploads/') ? jobData.image_url : `/uploads/job_images/${jobData.image_url}`}`} alt="Job Preview" style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }} />
                            </div>
                        )}
                    </Form.Group>

                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? <Spinner animation="border" size="sm" className="me-2" /> : 'Save Changes'}
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/admin/job-listings')} className="ms-2">
                        Cancel
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}

export default AdminEditJob;
