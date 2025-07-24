import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Spinner, Alert, ListGroup, Form } from 'react-bootstrap';
// CORRECTED PATH: Assuming AuthContext is directly in src/contexts/AuthContext.js
import { useAuth } from '../contexts/AuthContext'; 

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
// Ensure this path is correct relative to your API_BASE_URL for images served statically
const DEFAULT_JOB_IMAGE_PATH = '/uploads/job_images/geo_job_default.jpg'; 

function JobDetails() {
    const { id } = useParams(); // Get the job ID from the URL parameters
    const navigate = useNavigate();
    const { user, isAuthenticated, token, loading: authLoading } = useAuth();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState(null); // 'applied', 'not_applied', or 'loading'
    const [isApplying, setIsApplying] = useState(false);
    const [applyError, setApplyError] = useState(null);
    const [resumeFile, setResumeFile] = useState(null); // State for resume file

    const fetchJobDetails = useCallback(async () => {
        setLoading(true);
        setError(null);
        if (!id) {
            setError("Job ID is missing from the URL.");
            setLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
                // Add headers for authenticated request, even for details
                // This allows the backend to check if the current user has applied
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json(); 
            
            // FIX 1: Set job data correctly from the nested 'job' object
            setJob(data.job); 
            // Also update application status from this same fetch if user is laborer
            if (isAuthenticated && user?.user_type === 'laborer') {
                 setApplicationStatus(data.hasApplied ? 'applied' : 'not_applied');
            } else {
                 setApplicationStatus(null); // Not applicable for non-laborers or unauthenticated
            }
            
        } catch (err) {
            setError(`Failed to fetch job details: ${err.message}`);
            console.error("Fetch job details error:", err);
        } finally {
            setLoading(false);
        }
    }, [id, isAuthenticated, user, token]); // Add isAuthenticated, user, token to dependencies

    // We can remove checkApplicationStatus as a separate fetch if getJobById returns hasApplied
    // However, if getJobById is public and doesn't return hasApplied for non-authenticated users
    // or you want a separate check, you can keep it, but adjust its call.
    // For now, let's simplify and rely on the getJobById response for hasApplied.
    /*
    const checkApplicationStatus = useCallback(async () => {
        if (!isAuthenticated || user?.user_type !== 'laborer' || !token || !id) {
            setApplicationStatus(null); 
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/my-applications`, {
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
            const applications = data.applications; // Corrected access
            const hasApplied = Array.isArray(applications) && applications.some(app => app.job_id && app.job_id._id === id);
            setApplicationStatus(hasApplied ? 'applied' : 'not_applied');
        } catch (err) {
            setError(`Failed to fetch application status: ${err.message}`);
            console.error("Check application status error:", err);
            setApplicationStatus(null); 
        }
    }, [id, isAuthenticated, user, token]);
    */


    useEffect(() => {
        fetchJobDetails();
    }, [fetchJobDetails]);

    // Removed the separate useEffect for checkApplicationStatus as it's now integrated
    /*
    useEffect(() => {
        if (!authLoading) {
            checkApplicationStatus();
        }
    }, [authLoading, checkApplicationStatus]);
    */


    const handleApply = async () => {
        if (!isAuthenticated) {
            alert('Please log in to apply for jobs.');
            navigate('/login');
            return;
        }
        if (user?.user_type !== 'laborer') {
            alert('Only laborers can apply for jobs.');
            return;
        }

        if (!resumeFile) {
            setApplyError("Please upload your resume to apply for this job.");
            alert("Please upload your resume to apply for this job."); 
            return;
        }

        setIsApplying(true);
        setApplyError(null); 

        const formData = new FormData();
        formData.append('jobId', id); 
        formData.append('resume', resumeFile); 

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/${id}/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData, 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            alert('Application submitted successfully!'); 
            setApplicationStatus('applied'); 
            setResumeFile(null); 
            // Optionally, clear the file input field visually
            document.getElementById('resumeUpload').value = '';

        } catch (err) {
            setApplyError(err.message);
            console.error("Job application error:", err);
            alert(`Failed to submit application: ${err.message}`); 
        } finally {
            setIsApplying(false);
        }
    };

    if (loading || authLoading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading job details...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="my-5">
                <Alert variant="danger">
                    <Alert.Heading>Error!</Alert.Heading>
                    <p>{error}</p>
                    <hr />
                    <p className="mb-0">Please try again later or contact support if the problem persists.</p>
                </Alert>
            </Container>
        );
    }

    if (!job) {
        return (
            <Container className="my-5 text-center">
                <Alert variant="info">
                    <Alert.Heading>Job Not Found</Alert.Heading>
                    <p>The job you are looking for does not exist or has been removed.</p>
                    <Button variant="primary" onClick={() => navigate('/')}>Back to Home</Button>
                </Alert>
            </Container>
        );
    }

    // Correctly construct the image URL. Ensure API_BASE_URL does not have a trailing slash
    // and DEFAULT_JOB_IMAGE_PATH or job.image_url starts with a leading slash.
    const jobImageSrc = job.image_url ? `${API_BASE_URL}${job.image_url}` : `${API_BASE_URL}${DEFAULT_JOB_IMAGE_PATH}`;

    return (
        <Container className="my-5">
            <Card className="shadow-lg border-0">
                <Card.Img
                    variant="top"
                    src={jobImageSrc}
                    alt={job.title}
                    style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
                <Card.Body>
                    <Card.Title as="h2" className="mb-3">{job.title}</Card.Title>
                    <Card.Subtitle className="mb-3 text-muted">
                        {/* Use optional chaining for nested properties like employer_id.company_name */}
                        {job.employer_id?.company_name || job.employer_id?.full_name || 'Employer Name N/A'} - {job.city}, {job.country}
                    </Card.Subtitle>

                    <ListGroup variant="flush" className="mb-4">
                        <ListGroup.Item>
                            <strong>Pay Rate:</strong> N{job.pay_rate_min} - N{job.pay_rate_max} per {job.pay_type}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <strong>Job Type:</strong> {job.job_type}
                        </ListGroup.Item>
                        <ListGroup.Item>
                            {/* Check if posted_at is valid before formatting */}
                            <strong>Date Posted:</strong> {job.posted_at ? new Date(job.posted_at).toLocaleDateString() : 'N/A'}
                        </ListGroup.Item>
                        {job.status && (
                            <ListGroup.Item>
                                <strong>Status:</strong> <span className={`text-${job.status === 'active' ? 'success' : 'secondary'}`}>{job.status.toUpperCase()}</span>
                            </ListGroup.Item>
                        )}
                        {job.location?.address_text && (
                            <ListGroup.Item>
                                <strong>Address:</strong> {job.location.address_text}
                            </ListGroup.Item>
                        )}
                    </ListGroup>

                    <h4>Job Description:</h4>
                    <Card.Text>
                        {job.description}
                    </Card.Text>

                    {job.requirements && job.requirements.length > 0 && (
                        <>
                            <h4>Requirements:</h4>
                            <ul>
                                {job.requirements.map((req, index) => (
                                    <li key={index}>{req}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    {job.responsibilities && job.responsibilities.length > 0 && (
                        <>
                            <h4>Responsibilities:</h4>
                            <ul>
                                {job.responsibilities.map((resp, index) => (
                                    <li key={index}>{resp}</li>
                                ))}
                            </ul>
                        </>
                    )}

                    <div className="mt-4">
                        {/* Resume Upload Field */}
                        {isAuthenticated && user?.user_type === 'laborer' && applicationStatus === 'not_applied' && (
                            <Form.Group controlId="resumeUpload" className="mb-3">
                                <Form.Label>Upload Your Resume (PDF only)</Form.Label>
                                <Form.Control
                                    type="file"
                                    accept=".pdf"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file && file.type === 'application/pdf') {
                                            setResumeFile(file);
                                            setApplyError(null); 
                                        } else {
                                            setResumeFile(null);
                                            setApplyError("Please select a PDF file for your resume.");
                                            e.target.value = null; // Clear the input visually
                                        }
                                    }}
                                />
                                {applyError && applyError.includes("resume") && (
                                    <Form.Text className="text-danger">{applyError}</Form.Text>
                                )}
                            </Form.Group>
                        )}

                        {isAuthenticated && user?.user_type === 'laborer' && applicationStatus === 'not_applied' && (
                            <Button
                                variant="success"
                                onClick={handleApply}
                                disabled={isApplying || !resumeFile} 
                            >
                                {isApplying ? (
                                    <>
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                                        Applying...
                                    </>
                                ) : (
                                    'Apply for this Job'
                                )}
                            </Button>
                        )}
                        {isAuthenticated && user?.user_type === 'laborer' && applicationStatus === 'applied' && (
                            <Button variant="info" disabled>
                                Applied
                            </Button>
                        )}
                        {!isAuthenticated && (
                            <Button variant="success" onClick={() => navigate('/login')}>
                                Login to Apply
                            </Button>
                        )}
                        {applyError && !applyError.includes("resume") && <Alert variant="danger" className="mt-3">{applyError}</Alert>}
                    </div>

                    <Button variant="outline-secondary" className="mt-3" onClick={() => navigate('/')}>
                        Back to Job Listings
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default JobDetails;