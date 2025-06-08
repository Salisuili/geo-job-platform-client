import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Added Link for future navigation if needed
import 'bootstrap/dist/css/bootstrap.min.css';
// Removed FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog, Nav, Form as they are handled by EmployerDashboardLayout
import { Container, Button, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; 
import EmployerDashboardLayout from '../components/EmployerDashboardLayout'; // Correctly imported
import defaultJobImage from '../../src/job.avif'; // Assuming this path is correct relative to src/pages/

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

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
    navigate(`/employer/jobs/${jobId}/applicants`); // Use navigate for actual routing
  };

  const handleEditJob = (jobId) => {
    console.log(`Edit Job ID: ${jobId}`);
    navigate(`/employer/jobs/${jobId}/edit`); // Use navigate for actual routing
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

  // --- Render based on loading state ---
  if (authLoading || loadingJobs) {
    return (
        <EmployerDashboardLayout> {/* Wrap loading state for consistent layout */}
            <Container fluid className="py-4 px-5 text-center flex-grow-1">
                <Spinner animation="border" role="status" className="mt-5">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-2">Loading your jobs...</p>
            </Container>
        </EmployerDashboardLayout>
    );
  }

  if (error) {
    return (
        <EmployerDashboardLayout> {/* Wrap error state for consistent layout */}
            <Container fluid className="py-4 px-5 flex-grow-1">
                <Alert variant="danger" className="mt-5">
                    <Alert.Heading>Error loading jobs!</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        </EmployerDashboardLayout>
    );
  }

  // If no jobs posted yet
  if (postedJobs.length === 0) {
    return (
      // The EmployerDashboardLayout component already provides the outer div and sidebar
      <EmployerDashboardLayout> 
        {/* Main Content Area - No jobs */}
        <Container fluid className="py-4 px-5 flex-grow-1">
          <h3 className="mb-4 fw-bold">My Posted Jobs</h3>
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">You haven't posted any jobs yet.</h5>
              <Button variant="primary" className="mt-3" onClick={() => navigate('/post-job')}>Post a New Job</Button>
            </Card.Body>
          </Card>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  // --- Render jobs if loaded and present ---
  return (
    // Wrap the entire content that needs the dashboard layout
    <EmployerDashboardLayout>
      {/* Main Content Area */}
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">My Posted Jobs</h3>
          {postedJobs.map((job) => (
            <Card key={job._id} className="mb-3 shadow-sm border-0">
              <Card.Body className="d-flex flex-column flex-md-row align-items-md-center">
                {/* Job Image & Details */}
                <div className="me-md-3 mb-3 mb-md-0 d-flex flex-row align-items-center">
                  <img
                    src={job.image_url || defaultJobImage} // Use job.image_url or fallback
                    alt={job.title}
                    className="rounded me-3"
                    style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                  />
                  <div>
                    <div className="d-flex align-items-center mb-1">
                      <h5 className="mb-0 me-2">{job.title}</h5>
                      <Badge bg={job.status === 'Active' ? 'success' : job.status === 'Filled' ? 'info' : 'secondary'} className="text-uppercase" style={{ fontSize: '0.75em' }}>
                        {job.status}
                      </Badge>
                    </div>
                    <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                      {job.job_type} | {job.location?.address_text || 'N/A'} | Posted {timeAgo(job.createdAt)}
                    </p>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                      {job.pay_type}: ${job.pay_rate_min} - ${job.pay_rate_max}
                    </p>
                  </div>
                </div>

                {/* Applicants and Actions */}
                <div className="ms-md-auto d-flex flex-column flex-md-row align-items-md-center justify-content-end w-100 w-md-auto">
                  <div className="d-flex flex-column align-items-md-end me-md-4 mb-3 mb-md-0 text-center text-md-end">
                    <h4 className="mb-0 fw-bold">{job.applicants_count || 0}</h4>
                    <small className="text-muted">Applicants</small>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleViewApplicants(job._id)}
                      className="p-0 mt-1"
                    >
                      View Applicants
                    </Button>
                  </div>
                  <div className="d-flex flex-row flex-md-column justify-content-around justify-content-md-center">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="mb-md-2 me-2 me-md-0"
                      onClick={() => handleEditJob(job._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDeleteJob(job._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
      </Container>
    </EmployerDashboardLayout>
  );
}

export default EmployerJobs;