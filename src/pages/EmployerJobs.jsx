import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog } from 'react-icons/fa';
import { Container, Row, Col, Form, Button, Nav, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth to get user token and auth state

import defaultJobImage from '../../src/job.avif';

function EmployerJobs() {
  // Destructure 'isAuthenticated' and 'loading' from useAuth
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [postedJobs, setPostedJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true); // Renamed from 'loading' to avoid conflict with authLoading
  const [error, setError] = useState(null);

  // Helper function to format date to "X days/weeks/months ago"
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
      // --- CRUCIAL FIX: Wait for auth context to finish loading AND ensure user is authenticated with a token ---
      if (authLoading || !isAuthenticated || !token) {
        console.log("EmployerJobs: Authentication state not ready or token missing. Skipping fetch.", { authLoading, isAuthenticated, token });
        if (!authLoading && !isAuthenticated) { // If auth loading is done and still not authenticated, redirect
            logout(); // Ensure consistent logout
            navigate('/login');
        }
        setLoadingJobs(false); // Set local loading to false as we're not fetching yet
        return; // Prevent the fetch call from happening
      }

      // If we reach here, auth is ready and token is present
      setLoadingJobs(true); // Start loading state for jobs
      setError(null); // Clear previous errors

      try {
        const response = await fetch('http://localhost:5000/api/jobs/my-jobs', {
          headers: {
            'Authorization': `Bearer ${token}` // Send the token in the Authorization header
          }
        });

        if (response.status === 401 || response.status === 403) {
            // Handle unauthorized/forbidden access, e.g., token expired or role mismatch (though PrivateRoute should catch most role issues)
            console.error("EmployerJobs: Unauthorized or Forbidden access. Logging out.");
            logout(); // Clear token and redirect to login
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
        setLoadingJobs(false); // Ensure loading state is false after fetch attempt
      }
    };

    fetchEmployerJobs();
    // Add authLoading, isAuthenticated to dependencies to re-run when auth state changes
  }, [user, token, isAuthenticated, authLoading, navigate, logout]);


  const handleViewApplicants = (jobId) => {
    console.log(`View Applicants for Job ID: ${jobId}`);
    alert(`Navigating to applicants for job ID: ${jobId}`);
    // In a real app, this would navigate to a page listing applicants for this job
  };

  const handleEditJob = (jobId) => {
    console.log(`Edit Job ID: ${jobId}`);
    alert(`Navigating to edit form for job ID: ${jobId}`);
    // In a real app, this would navigate to the PostJob form pre-filled with job data
  };

  const handleDeleteJob = async (jobId) => {
    if (!token) { // Ensure token is present before attempting delete
        alert("Not authorized to delete job: Token missing.");
        return;
    }

    if (window.confirm(`Are you sure you want to delete job ID: ${jobId}?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
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

        // Remove the deleted job from the state to update UI
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
  if (authLoading || loadingJobs) { // Check both auth loading and job loading
    return <p className="text-center mt-5">Loading your jobs...</p>;
  }

  if (error) {
    return <p className="text-danger text-center mt-5">Error loading jobs: {error}</p>;
  }

  // If no jobs posted yet
  if (postedJobs.length === 0) {
    return (
      <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>
        {/* Left Sidebar - keep as is */}
        <div style={{ width: '250px', backgroundColor: '#fff', borderRight: '1px solid #e9ecef', padding: '2rem 1.5rem', flexShrink: 0, }}>
          <div className="mb-4">
            <h5 className="fw-bold mb-0">Local Labor</h5>
            <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
          </div>
          <Nav className="flex-column">
            <Nav.Link href="#dashboard" className="text-dark py-2 d-flex align-items-center" style={{ borderRadius: '0.375rem' }}>
              <FaHome className="me-2" /> Dashboard
            </Nav.Link>
            <Nav.Link href="#jobs" className="text-dark py-2 d-flex align-items-center" style={{ backgroundColor: '#e9ecef', borderRadius: '0.375rem', fontWeight: 'bold' }}>
              <FaBriefcase className="me-2" /> Jobs
            </Nav.Link>
            <Nav.Link href="#laborers" className="text-dark py-2 d-flex align-items-center" style={{ borderRadius: '0.375rem' }}>
              <FaUsers className="me-2" /> Laborers
            </Nav.Link>
            <Nav.Link href="#payments" className="text-dark py-2 d-flex align-items-center" style={{ borderRadius: '0.375rem' }}>
              <FaCreditCard className="me-2" /> Payments
            </Nav.Link>
            <Nav.Link href="#settings" className="text-dark py-2 d-flex align-items-center" style={{ borderRadius: '0.375rem' }}>
              <FaCog className="me-2" /> Settings
            </Nav.Link>
          </Nav>
        </div>

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
      </div>
    );
  }

  // --- Render jobs if loaded and present ---
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>
      {/* Left Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#fff',
        borderRight: '1px solid #e9ecef',
        padding: '2rem 1.5rem',
        flexShrink: 0,
      }}>
        <div className="mb-4">
          <h5 className="fw-bold mb-0">Local Labor</h5>
          <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
        </div>
        <Nav className="flex-column">
          <Nav.Link href="#dashboard" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaHome className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link href="#jobs" className="text-dark py-2 d-flex align-items-center"
            style={{ backgroundColor: '#e9ecef', borderRadius: '0.375rem', fontWeight: 'bold' }}>
            <FaBriefcase className="me-2" /> Jobs
          </Nav.Link>
          <Nav.Link href="#laborers" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaUsers className="me-2" /> Laborers
          </Nav.Link>
          <Nav.Link href="#payments" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaCreditCard className="me-2" /> Payments
          </Nav.Link>
          <Nav.Link href="#settings" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaCog className="me-2" /> Settings
          </Nav.Link>
        </Nav>
      </div>

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
    </div>
  );
}

export default EmployerJobs;