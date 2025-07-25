// src/pages/AllJobApplicationsOverview.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Card, Badge, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaUsers, FaFolderOpen } from 'react-icons/fa'; // Icons for applicants and view job

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_JOB_IMAGE_PATH = '/uploads/job_images/geo_job_default.jpg';

function AllJobApplicationsOverview() {
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
                console.log("AllJobApplicationsOverview: Authentication state not ready or token missing. Skipping fetch.", { authLoading, isAuthenticated, token });
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
                // This endpoint should ideally return jobs with an applicants_count
                const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 401 || response.status === 403) {
                    console.error("AllJobApplicationsOverview: Unauthorized or Forbidden access. Logging out.");
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
                console.error("Failed to fetch employer jobs for overview:", err);
            } finally {
                setLoadingJobs(false);
            }
        };

        fetchEmployerJobs();
    }, [user, token, isAuthenticated, authLoading, navigate, logout]);

    const handleViewApplicants = (jobId) => {
        navigate(`/employer/jobs/${jobId}/applicants`);
    };

    if (authLoading || loadingJobs) {
        return (
            <Container fluid className="py-4 px-5 text-center flex-grow-1">
                <Spinner animation="border" role="status" className="mt-5">
                    <span className="visually-hidden">Loading jobs for applicants overview...</span>
                </Spinner>
                <p className="mt-2">Loading your jobs...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container fluid className="py-4 px-5 flex-grow-1">
                <Alert variant="danger" className="mt-5">
                    <Alert.Heading>Error loading jobs for applicants overview!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    if (postedJobs.length === 0) {
        return (
            <Container fluid className="py-4 px-5 flex-grow-1">
                <h3 className="mb-4 fw-bold">Job Applications Overview</h3>
                <Card className="text-center py-5 shadow-sm border-0">
                    <Card.Body>
                        <h5 className="text-muted">You haven't posted any jobs yet, so no applications to review.</h5>
                        <Button variant="primary" className="mt-3" onClick={() => navigate('/post-job')}>Post a New Job</Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4 px-5 flex-grow-1">
            <h3 className="mb-4 fw-bold">Job Applications Overview</h3>
            <Row>
                {postedJobs.map((job) => (
                    <Col key={job._id} xs={12} className="mb-3">
                        <Card className="shadow-sm border-0">
                            <Card.Body className="d-flex flex-column flex-md-row align-items-md-center">
                                {/* Job Image & Details */}
                                <div className="me-md-3 mb-3 mb-md-0 d-flex align-items-center flex-grow-1">
                                    <img
                                        src={job.image_url ? `${API_BASE_URL}${job.image_url.startsWith('/uploads/') ? job.image_url : `/uploads/job_images/${job.image_url}`}` : `${API_BASE_URL}${DEFAULT_JOB_IMAGE_PATH}`}
                                        alt={job.title}
                                        className="rounded me-3"
                                        style={{ width: '80px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
                                    />
                                    <div>
                                        <h5 className="mb-0">{job.title}</h5>
                                        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                                            {job.job_type} | {job.city || 'N/A'} | Posted {timeAgo(job.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Applicants Count & View Button */}
                                <div className="d-flex flex-column flex-sm-row align-items-center ms-md-auto">
                                    <div className="text-center me-sm-3 mb-2 mb-sm-0">
                                        <h4 className="mb-0 fw-bold">{job.applicants_count || 0}</h4>
                                        <small className="text-muted">Applicants</small>
                                    </div>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        onClick={() => handleViewApplicants(job._id)}
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <FaFolderOpen className="me-2" /> View Applicants
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
}

export default AllJobApplicationsOverview;
