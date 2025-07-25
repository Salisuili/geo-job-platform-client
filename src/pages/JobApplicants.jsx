// src/pages/JobApplicants.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Dropdown, DropdownButton, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
// The EmployerDashboardLayout import is REMOVED as it's now handled by App.jsx routing
import { FaDownload, FaEnvelope } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function JobApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  const [jobTitle, setJobTitle] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateStatusError, setUpdateStatusError] = useState(null);

  const fetchApplicants = async () => {
    // Check authentication and user type before fetching
    if (authLoading || !isAuthenticated) {
      if (!authLoading && !isAuthenticated) {
        console.warn("Unauthorized access attempt to JobApplicants. Redirecting.");
        navigate('/login');
      }
      setLoading(false);
      return;
    }

    if (user?.user_type !== 'employer' && user?.user_type !== 'admin') {
      console.warn("Forbidden access attempt to JobApplicants by non-employer/admin. Redirecting.");
      navigate('/employer/dashboard'); // Or to a generic unauthorized page
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setUpdateStatusError(null); // Clear previous status update errors

    try {
      // Fetch applicants for this specific job
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch applicants.');
      }

      setJobTitle(data.jobTitle); // Assuming backend returns jobTitle
      setApplicants(data.applications); // Assuming backend returns applications array

    } catch (err) {
      console.error("Error fetching job applicants:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants when component mounts or dependencies change
  useEffect(() => {
    fetchApplicants();
  }, [jobId, user, token, isAuthenticated, authLoading, navigate]); // Added navigate to dependencies

  // Function to handle updating an applicant's status
  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdateStatusError(null); // Clear previous errors
    try {
      // CORRECTED API URL: Added '/jobs' segment as per backend routing
      const response = await fetch(`${API_BASE_URL}/api/jobs/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update application status.');
      }

      // Update the status in the local state to reflect changes immediately
      setApplicants(prevApplicants =>
        prevApplicants.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        )
      );

    } catch (err) {
      console.error("Error updating application status:", err);
      setUpdateStatusError(err.message);
    }
  };

  // Helper function to get Bootstrap badge variant based on status
  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Reviewed': return 'primary';
      case 'Interview Scheduled': return 'info';
      case 'Accepted': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  // Conditional rendering for loading state
  if (loading || authLoading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading applicants...</span>
        </Spinner>
      </Container>
    );
  }

  // Conditional rendering for error state
  if (error) {
    return (
      <Container fluid className="py-5">
        <Alert variant="danger">
          <h4>Error loading applicants!</h4>
          <p>{error}</p>
          <Button onClick={() => navigate('/my-jobs')}>Back to My Jobs</Button>
        </Alert>
      </Container>
    );
  }

  // Conditional rendering for no applicants found
  if (applicants.length === 0) {
    return (
      <Container fluid className="py-4 px-3 px-md-5">
        <h3 className="mb-4 fw-bold">Applicants for "{jobTitle}"</h3>
        <Button variant="secondary" className="mb-4" onClick={() => navigate('/my-jobs')}>
          Back to My Jobs
        </Button>
        <Card className="text-center py-5 shadow-sm border-0">
          <Card.Body>
            <h5 className="text-muted">No applicants for this job yet.</h5>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Main rendering of job applicants
  return (
    <Container fluid className="py-4 px-3 px-md-5">
      <h3 className="mb-4 fw-bold">Applicants for "{jobTitle}"</h3>
      <Button variant="secondary" className="mb-4" onClick={() => navigate('/my-jobs')}>
        Back to My Jobs
      </Button>

      {updateStatusError && <Alert variant="danger">{updateStatusError}</Alert>}

      <Row xs={1} md={2} lg={3} className="g-4">
        {applicants.map((application) => (
          <Col key={application._id}>
            <Card className="shadow-sm border-0 h-100 d-flex flex-column">
              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-2">{application.applicant_id?.full_name || 'N/A'}</Card.Title>
                <Card.Subtitle className="mb-2 text-muted small">
                  {application.applicant_id?.username || 'N/A'}
                </Card.Subtitle>
                <ListGroup variant="flush" className="flex-grow-1">
                  <ListGroup.Item className="px-0 py-1">Email: {application.applicant_id?.email || 'N/A'}</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-1">Phone: {application.applicant_id?.phone_number || 'N/A'}</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-1">Skills: {application.applicant_id?.skills?.join(', ') || 'N/A'}</ListGroup.Item>
                  <ListGroup.Item className="px-0 py-1">
                    Current Status: <Badge bg={getStatusVariant(application.status)} className="ms-1">{application.status}</Badge>
                  </ListGroup.Item>
                </ListGroup>

                <div className="d-flex flex-wrap justify-content-between align-items-center mt-3 pt-3 border-top">
                    <div className="d-flex flex-wrap mb-2 mb-md-0"> {/* Use flex-wrap here for buttons */}
                        {application.resume_url && (
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                href={`${API_BASE_URL}${application.resume_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="me-2 mb-2" // Added mb-2 for vertical spacing on wrap
                            >
                                <FaDownload /> Resume
                            </Button>
                        )}
                        {application.cover_letter_url && (
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                href={`${API_BASE_URL}${application.cover_letter_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mb-2" // Added mb-2
                            >
                                <FaDownload /> Cover Letter
                            </Button>
                        )}
                         {application.applicant_id?.email && (
                             <Button
                                 variant="outline-info"
                                 size="sm"
                                 href={`mailto:${application.applicant_id.email}`}
                                 className="ms-md-2 mb-2" // Adjusted margin for responsiveness
                             >
                                 <FaEnvelope /> Contact
                             </Button>
                         )}
                    </div>
                  <DropdownButton
                    id={`dropdown-status-${application._id}`}
                    title="Update Status"
                    variant="outline-primary"
                    size="sm"
                    align="end" // Align dropdown to end for better mobile experience
                  >
                    <Dropdown.Item onClick={() => handleStatusUpdate(application._id, 'Pending')}>Pending</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate(application._id, 'Reviewed')}>Reviewed</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate(application._id, 'Interview Scheduled')}>Interview Scheduled</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate(application._id, 'Accepted')}>Accepted</Dropdown.Item>
                    <Dropdown.Item onClick={() => handleStatusUpdate(application._id, 'Rejected')}>Rejected</Dropdown.Item>
                  </DropdownButton>
                </div>
                <p className="text-muted small mt-2 mb-0">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default JobApplicants;
