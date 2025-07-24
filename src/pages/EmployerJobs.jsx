// src/pages/EmployerJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Button, Card, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
// import EmployerDashboardLayout from '../layouts/EmployerDashboardLayout'; // REMOVE THIS IMPORT (already removed, good!)

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_JOB_IMAGE_PATH = '/uploads/job_images/geo_job_default.jpg';

function EmployerJobs() {
    const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();
    const [postedJobs, setPostedJobs] = useState([]);
    const [loadingJobs, setLoadingJobs] = useState(true);
    const [error, setError] = useState(null);

    const timeAgo = (date) => {
        if (!date) return 'N/A';
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 604800; // weeks
        if (interval > 1) return Math.floor(interval) + " weeks ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    useEffect(() => {
        const fetchEmployerJobs = async () => {
            if (authLoading || !isAuthenticated || !token) {
                console.log("EmployerJobs: Authentication state not ready or token missing. Skipping fetch.", { authLoading, isAuthenticated, token });
                if (!authLoading && !isAuthenticated) {
                    logout();
                    navigate('/login');
                }
                setLoadingJobs(false);
                return;
            }

            setLoadingJobs(true);
            setError(null);
            try {
                // Ensure your backend's /api/jobs/my-jobs endpoint is modified
                // to include the applicants_count for each job.
                // If it's not, this front-end change won't magically make it appear.
                const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    console.error("EmployerJobs: Unauthorized or Forbidden access. Logging out.");
                    logout();
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setPostedJobs(data);
            } catch (err) {
                setError(err.message);
                console.error("Failed to fetch employer jobs:", err);
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchEmployerJobs();
    }, [user, token, isAuthenticated, authLoading, navigate, logout]);

    const handleViewApplicants = (jobId) => {
        console.log(`View Applicants for Job ID: ${jobId}`);
        navigate(`/employer/jobs/${jobId}/applicants`);
    };

    const handleEditJob = (jobId) => {
        console.log(`Edit Job ID: ${jobId}`);
        navigate(`/employer/jobs/${jobId}/edit`);
    };

    const handleDeleteJob = async (jobId) => {
        if (!token) {
            alert("Not authorized to delete job: Token missing.");
            return;
        }
        if (window.confirm(`Are you sure you want to delete job ID: ${jobId}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    logout();
                    navigate('/login');
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Failed to delete job: ${response.statusText}`);
                }

                setPostedJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
                alert(`Job ID ${jobId} deleted successfully.`);
            } catch (err) {
                setError(err.message);
                console.error("Error deleting job:", err);
                alert(`Error deleting job: ${err.message}`);
            }
        }
    };

    if (authLoading || loadingJobs) {
        return (
            <Container fluid className="py-4 px-5 text-center flex-grow-1">
                <Spinner animation="border" role="status" className="mt-5">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading your jobs...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="py-4 px-5 flex-grow-1">
                <Alert variant="danger" className="mt-5">
                    <Alert.Heading>Error loading jobs!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    if (postedJobs.length === 0) {
        return (
            <Container fluid className="py-4 px-5 flex-grow-1">
                <h3 className="mb-4 fw-bold">My Posted Jobs</h3>
                <Card className="text-center py-5 shadow-sm border-0">
                    <Card.Body>
                        <h5 className="text-muted">You haven't posted any jobs yet.</h5>
                        <Button variant="primary" className="mt-3" onClick={() => navigate('/post-job')}>Post a New Job</Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-5 flex-grow-1">
            <h3 className="mb-4 fw-bold">My Posted Jobs</h3>
            {postedJobs.map((job) => (
                <Card key={job._id} className="mb-3 shadow-sm border-0">
                    <Card.Body> {/* Removed d-flex flex-column flex-md-row from Card.Body */}
                        <Row className="align-items-center"> {/* Use Row for main layout */}
                            {/* Job Image & Details Column */}
                            <Col xs={12} md={7} lg={8} className="d-flex align-items-center mb-3 mb-md-0">
                                <img
                                    src={job.image_url ? `${API_BASE_URL}${job.image_url.startsWith('/uploads/') ? job.image_url : `/uploads/job_images/${job.image_url}`}` : `${API_BASE_URL}${DEFAULT_JOB_IMAGE_PATH}`}
                                    alt={job.title}
                                    className="rounded me-3"
                                    style={{ width: '100px', height: '80px', objectFit: 'cover', flexShrink: 0 }} // flexShrink to prevent image from shrinking
                                />
                                <div>
                                    <div className="d-flex flex-wrap align-items-center mb-1"> {/* flex-wrap for title and badge */}
                                        <h5 className="mb-0 me-2 text-break">{job.title}</h5> {/* text-break for long titles */}
                                        <Badge bg={job.status === 'Active' ? 'success' : job.status === 'Filled' ? 'info' : 'secondary'} className="text-uppercase" style={{ fontSize: '0.75em' }}>
                                            {job.status}
                                        </Badge>
                                    </div>
                                    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                                        {job.job_type} | {job.city || 'N/A'} | Posted {timeAgo(job.createdAt)}
                                    </p>
                                    <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                                        {job.pay_type}: N{job.pay_rate_min} - N{job.pay_rate_max}
                                    </p>
                                </div>
                            </Col>

                            {/* Applicants Count Column */}
                            <Col xs={6} md={2} lg={1} className="text-center text-md-end mb-3 mb-md-0">
                                <h4 className="mb-0 fw-bold">{job.applicants_count || 0}</h4> {/* Ensure this data comes from backend */}
                                <small className="text-muted d-block">Applicants</small>
                                <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => handleViewApplicants(job._id)}
                                    className="p-0 mt-1 text-decoration-none" // Remove underline by default
                                >
                                    View Applicants
                                </Button>
                            </Col>

                            {/* Action Buttons Column */}
                            <Col xs={6} md={3} lg={3} className="d-flex flex-column flex-sm-row flex-md-column justify-content-end align-items-center align-items-md-end">
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    className="w-100 mb-2 mb-sm-0 me-sm-2 mb-md-2 me-md-0" // Control button width and margins
                                    onClick={() => handleEditJob(job._id)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="w-100" // Control button width
                                    onClick={() => handleDeleteJob(job._id)}
                                >
                                    Delete
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
}

export default EmployerJobs;