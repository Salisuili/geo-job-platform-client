import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Import icons from react-icons
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog } from 'react-icons/fa';

// Import Bootstrap components
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Nav,
  Card,
  Badge // For job status
} from 'react-bootstrap';

function EmployerJobs() {
  // Dummy data for jobs posted by this employer, mirroring MongoDB 'jobs' schema
  const postedJobs = [
    {
      _id: "job_1",
      title: "Senior Backend Developer",
      description: "Seeking an experienced Backend Developer with expertise in Node.js and MongoDB. Must have strong API design skills.",
      job_type: "Full-time",
      location: "Remote",
      pay_rate_min: 7000.00,
      pay_rate_max: 10000.00,
      pay_type: "Monthly",
      posted_at: new Date(new Date().setDate(new Date().getDate() - 5)), // 5 days ago
      status: "Active",
      image_url: "https://via.placeholder.com/150x100?text=Development",
      applicants: 15 // Dummy count
    },
    {
      _id: "job_2",
      title: "Marketing Specialist",
      description: "Looking for a creative Marketing Specialist to manage our social media campaigns and content strategy.",
      job_type: "Part-time",
      location: "Lagos, Nigeria",
      pay_rate_min: 2000.00,
      pay_rate_max: 3500.00,
      pay_type: "Hourly",
      posted_at: new Date(new Date().setDate(new Date().getDate() - 10)), // 10 days ago
      status: "Active",
      image_url: "https://via.placeholder.com/150x100?text=Marketing",
      applicants: 8
    },
    {
      _id: "job_3",
      title: "Customer Support Representative",
      description: "Friendly and efficient Customer Support Rep needed for online chat and email support.",
      job_type: "Contract",
      location: "Abuja, Nigeria",
      pay_rate_min: 50000.00,
      pay_rate_max: 70000.00,
      pay_type: "Fixed Price",
      posted_at: new Date(new Date().setDate(new Date().getDate() - 20)), // 20 days ago
      status: "Filled",
      image_url: "https://via.placeholder.com/150x100?text=Support",
      applicants: 2
    },
    {
      _id: "job_4",
      title: "Graphic Designer (Temporary Project)",
      description: "Seeking a freelance Graphic Designer for a 2-week project to create marketing materials.",
      job_type: "Temporary",
      location: "Remote",
      pay_rate_min: 100000.00,
      pay_rate_max: 120000.00,
      pay_type: "Fixed Price",
      posted_at: new Date(new Date().setDate(new Date().getDate() - 30)), // 30 days ago
      status: "Expired",
      image_url: "https://via.placeholder.com/150x100?text=Design",
      applicants: 0
    },
  ];

  // Helper function to format date to "X days/weeks/months ago"
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 604800; // corrected to weeks
    if (interval > 1) return Math.floor(interval) + " weeks ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

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

  const handleDeleteJob = (jobId) => {
    if (window.confirm(`Are you sure you want to delete job ID: ${jobId}?`)) {
      console.log(`Delete Job ID: ${jobId}`);
      alert(`Job ID ${jobId} deleted (simulated).`);
      // In a real app, this would send a DELETE request to your backend
    }
  };

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
          <small className="text-muted">Employer</small>
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

        {postedJobs.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">You haven't posted any jobs yet.</h5>
              <Button variant="primary" className="mt-3">Post a New Job</Button>
            </Card.Body>
          </Card>
        ) : (
          postedJobs.map((job) => (
            <Card key={job._id} className="mb-3 shadow-sm border-0">
              <Card.Body className="d-flex flex-column flex-md-row align-items-md-center">
                {/* Job Image & Details */}
                <div className="me-md-3 mb-3 mb-md-0 d-flex flex-row align-items-center">
                  <img
                    src={job.image_url}
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
                      {job.job_type} | {job.location} | Posted {timeAgo(job.posted_at)}
                    </p>
                    <p className="text-secondary mb-0" style={{ fontSize: '0.9rem' }}>
                      {job.pay_type}: ${job.pay_rate_min} - ${job.pay_rate_max}
                    </p>
                  </div>
                </div>

                {/* Applicants and Actions */}
                <div className="ms-md-auto d-flex flex-column flex-md-row align-items-md-center justify-content-end w-100 w-md-auto">
                  <div className="d-flex flex-column align-items-md-end me-md-4 mb-3 mb-md-0 text-center text-md-end">
                    <h4 className="mb-0 fw-bold">{job.applicants}</h4>
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
          ))
        )}
      </Container>
    </div>
  );
}

export default EmployerJobs;