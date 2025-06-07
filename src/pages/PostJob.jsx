import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog } from 'react-icons/fa';

import {
  Container,
  Row, // Row is still useful for layout, even if not for lat/long
  Col,
  Form,
  Button,
  Nav,
} from 'react-bootstrap';

function PostJob() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State to manage all form inputs
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobType, setJobType] = useState('');
  // MODIFIED: Only collect 'city' from the employer
  const [city, setCity] = useState(''); // Human-readable city
  const [payRateMin, setPayRateMin] = useState('');
  const [payRateMax, setPayRateMax] = useState('');
  const [payType, setPayType] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [requiredSkills, setRequiredSkills] = useState(''); // Input as comma-separated string
  const [imageUrl, setImageUrl] = useState('');

  // UI feedback states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Effect to redirect if not authenticated or not an employer
  React.useEffect(() => {
    if (!isAuthenticated) {
      alert("You need to log in to post a job.");
      navigate('/login');
    } else if (user && user.user_type !== 'employer' && user.user_type !== 'admin') {
      alert("Only employers or admins can post jobs.");
      navigate('/'); // Redirect to home or another appropriate page
    }
  }, [isAuthenticated, user, navigate]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Update validation: latitude and longitude are no longer required from frontend
    if (!jobTitle || !jobDescription || !jobType || !city || !payRateMin || !payRateMax || !payType) {
      setError('Please fill in all required fields, including the job city.');
      setLoading(false);
      return;
    }

    if (parseFloat(payRateMin) >= parseFloat(payRateMax)) {
      setError('Minimum pay rate must be less than maximum pay rate.');
      setLoading(false);
      return;
    }

    // Construct the job data payload for the backend
    const jobData = {
      employer_id: user._id, // Get employer ID from authenticated user
      title: jobTitle,
      description: jobDescription,
      job_type: jobType,
      // MODIFIED: Send only the city to the backend
      city: city,
      pay_rate_min: parseFloat(payRateMin),
      pay_rate_max: parseFloat(payRateMax),
      pay_type: payType,
      application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
      required_skills: requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : [],
      image_url: imageUrl || undefined,
      status: "Active", // Default status upon creation
    };

    console.log("Job Data to Post:", jobData); // For debugging

    try {
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`, // Send the user's token
        },
        body: JSON.stringify(jobData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Job posted successfully!');
        alert('Job posted successfully!');
        navigate('/my-jobs'); // Navigate to employer's jobs
        // Reset form fields after successful submission
        setJobTitle('');
        setJobDescription('');
        setJobType('');
        setCity(''); // Reset city
        setPayRateMin('');
        setPayRateMax('');
        setPayType('');
        setApplicationDeadline('');
        setRequiredSkills('');
        setImageUrl('');
      } else {
        setError(data.message || 'Failed to post job. Please try again.');
      }
    } catch (err) {
      console.error('Network error during job posting:', err);
      setError('Network error. Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Render nothing if not authenticated or not an employer (the useEffect handles redirect)
  if (!user || (user.user_type !== 'employer' && user.user_type !== 'admin')) {
      return null;
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>
      {/* Left Sidebar (No changes here) */}
      <div style={{
        width: '250px',
        backgroundColor: '#fff',
        borderRight: '1px solid #e9ecef',
        padding: '2rem 1.5rem',
        flexShrink: 0,
      }}>
        <div className="mb-4">
          <h5 className="fw-bold mb-0">Local Labor</h5>
          <small className="text-muted">{user.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
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
        <h3 className="mb-4 fw-bold">Post a New Job</h3>

        {error && <div className="alert alert-danger mt-3">{error}</div>}
        {success && <div className="alert alert-success mt-3">{success}</div>}

        <Form onSubmit={handleSubmit}>
          {/* Job Title */}
          <Form.Group className="mb-4" controlId="jobTitle">
            <Form.Label className="fw-bold">Job Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Landscaping, Plumbing, Tutoring"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            />
          </Form.Group>

          {/* Job Description */}
          <Form.Group className="mb-4" controlId="jobDescription">
            <Form.Label className="fw-bold">Job Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              placeholder="Describe the job in detail, including requirements, location, and expected duration."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            />
          </Form.Group>

          {/* Job Type */}
          <Form.Group className="mb-4" controlId="jobType">
            <Form.Label className="fw-bold">Job Type</Form.Label>
            <Form.Select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              required
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            >
              <option value="">Select Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Seasonal">Seasonal</option>
            </Form.Select>
          </Form.Group>

          {/* MODIFIED: Location Field - Only City */}
          <Form.Group className="mb-4" controlId="city">
            <Form.Label className="fw-bold">Job City</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Zaria, Kaduna"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            />
          </Form.Group>
          <small className="text-muted mb-3 d-block">
            * Laborers will be able to find jobs near their location based on the city you provide.
          </small>

          {/* Pay Rate Range and Type (No changes here) */}
          <Row className="mb-4">
            <Col>
              <Form.Group controlId="payRateMin">
                <Form.Label className="fw-bold">Min Pay Rate</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Min Pay"
                  value={payRateMin}
                  onChange={(e) => setPayRateMin(e.target.value)}
                  required
                  style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="payRateMax">
                <Form.Label className="fw-bold">Max Pay Rate</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Max Pay"
                  value={payRateMax}
                  onChange={(e) => setPayRateMax(e.target.value)}
                  required
                  style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="payType">
                <Form.Label className="fw-bold">Pay Type</Form.Label>
                <Form.Select
                  value={payType}
                  onChange={(e) => setPayType(e.target.value)}
                  required
                  style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
                >
                  <option value="">Select Type</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Fixed Price">Fixed Price</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {/* Application Deadline (No changes here) */}
          <Form.Group className="mb-4" controlId="applicationDeadline">
            <Form.Label className="fw-bold">Application Deadline (Optional)</Form.Label>
            <Form.Control
              type="date"
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            />
          </Form.Group>

          {/* Required Skills (No changes here) */}
          <Form.Group className="mb-4" controlId="requiredSkills">
            <Form.Label className="fw-bold">Required Skills (Comma-separated)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Plumbing, Electrical, Welding"
              value={requiredSkills}
              onChange={(e) => setRequiredSkills(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            />
          </Form.Group>

          {/* Job Image URL (No changes here) */}
          <Form.Group className="mb-4" controlId="imageUrl">
            <Form.Label className="fw-bold">Job Image URL (Optional)</Form.Label>
            <Form.Control
              type="url"
              placeholder="http://example.com/job_image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
            />
          </Form.Group>

          {/* Post Job Button (No changes here) */}
          <div className="d-flex justify-content-end mt-5">
            <Button
              variant="primary"
              type="submit"
              className="px-5 py-2"
              disabled={loading}
              style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd', borderRadius: '0.375rem' }}
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
}

export default PostJob;