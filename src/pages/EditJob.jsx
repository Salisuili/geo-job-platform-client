// src/pages/EditJob.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
// Assuming this is the correct path based on your previous input
const DEFAULT_JOB_IMAGE_PATH = '/uploads/geo_job_default.jpg';


function EditJob() {
  const { jobId } = useParams(); // Get job ID from URL
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  // State to manage form inputs, initialized with empty values
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobType, setJobType] = useState('');
  const [city, setCity] = useState('');
  const [payRateMin, setPayRateMin] = useState('');
  const [payRateMax, setPayRateMax] = useState('');
  const [payType, setPayType] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('');
  const [jobImageFile, setJobImageFile] = useState(null); // For new image upload
  const [currentImageUrl, setCurrentImageUrl] = useState(''); // To display current image
  const [jobStatus, setJobStatus] = useState('Active'); // Job status

  // UI feedback states
  const [loading, setLoading] = useState(true); // Initial loading for fetching job data
  const [submitting, setSubmitting] = useState(false); // Loading for form submission
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Effect to fetch job details when component mounts or jobId changes
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (authLoading || !isAuthenticated || !token) {
        if (!authLoading && !isAuthenticated) {
          // No console.warn here, redirect silently
          navigate('/login');
        }
        setLoading(false);
        return;
      }

      // Ensure only employer or admin can access this page
      if (user?.user_type !== 'employer' && user?.user_type !== 'admin') {
        // No console.warn here, redirect silently
        navigate('/dashboard'); // Or to a generic unauthorized page
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to fetch job details.');
        }

        const job = result.job; // Assuming the backend returns { job, hasApplied }

        // Populate form fields with fetched data
        setJobTitle(job.title || '');
        setJobDescription(job.description || '');
        setJobType(job.job_type || '');
        setCity(job.city || '');
        setPayRateMin(job.pay_rate_min || '');
        setPayRateMax(job.pay_rate_max || '');
        setPayType(job.pay_type || '');
        setApplicationDeadline(job.application_deadline ? new Date(job.application_deadline).toISOString().split('T')[0] : '');
        setRequiredSkills(job.required_skills ? job.required_skills.join(', ') : '');
        
        // Corrected image URL logic for current image display
        const fetchedImageUrl = job.image_url
            ? (job.image_url === DEFAULT_JOB_IMAGE_PATH || job.image_url.startsWith('/uploads/'))
                ? `${API_BASE_URL}${job.image_url}`
                : `${API_BASE_URL}/uploads/job_images/${job.image_url}` // Fallback for old structure if needed
            : `${API_BASE_URL}${DEFAULT_JOB_IMAGE_PATH}`;
        setCurrentImageUrl(fetchedImageUrl);

        setJobStatus(job.status || 'Active');

      } catch (err) {
        console.error("Error fetching job details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId, user, token, isAuthenticated, authLoading, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!jobTitle || !jobDescription || !jobType || !city || !payRateMin || !payRateMax || !payType) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }
    if (parseFloat(payRateMin) >= parseFloat(payRateMax)) {
      setError('Minimum pay rate must be less than maximum pay rate.');
      setSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('title', jobTitle);
    formData.append('description', jobDescription);
    formData.append('job_type', jobType);
    formData.append('city', city);
    formData.append('pay_rate_min', parseFloat(payRateMin));
    formData.append('pay_rate_max', parseFloat(payRateMax));
    formData.append('pay_type', payType);
    if (applicationDeadline) {
      formData.append('application_deadline', new Date(applicationDeadline).toISOString());
    }
    if (requiredSkills) {
      formData.append('required_skills', requiredSkills);
    }
    if (jobImageFile) {
      formData.append('jobImage', jobImageFile); // Append new image file if selected
    }
    formData.append('status', jobStatus); // Include job status

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
        method: 'PUT', // Use PUT for updates
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Job updated successfully!');
        alert('Job updated successfully!'); // Using alert as per previous pattern, consider custom modal for better UX
        navigate('/my-jobs'); // Go back to employer's job list
      } else {
        setError(data.message || 'Failed to update job. Please try again.');
      }
    } catch (err) {
      console.error('Network error during job update:', err);
      setError('Network error. Could not connect to the server.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Container fluid className="py-4 px-5 text-center flex-grow-1">
        <Spinner animation="border" role="status" className="mt-5">
          <span className="visually-hidden">Loading job details...</span>
        </Spinner>
        <p className="mt-2">Loading job details for editing...</p>
      </Container>
    );
  }

  if (error && !submitting) { // Show error if fetching failed, or if submission failed
    return (
      <Container fluid className="py-4 px-5 flex-grow-1">
        <Alert variant="danger" className="mt-5">
          <Alert.Heading>Error loading job!</Alert.Heading>
          <p>{error}</p>
          <Button onClick={() => navigate('/my-jobs')}>Back to My Jobs</Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-5 flex-grow-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold">Edit Job Posting</h3>
        <Button variant="outline-secondary" size="sm" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      {error && submitting && <div className="alert alert-danger mt-3">{error}</div>}
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

        {/* Location Field - City */}
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

        {/* Pay Rate Range and Type */}
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

        {/* Application Deadline */}
        <Form.Group className="mb-4" controlId="applicationDeadline">
          <Form.Label className="fw-bold">Application Deadline (Optional)</Form.Label>
          <Form.Control
            type="date"
            value={applicationDeadline}
            onChange={(e) => setApplicationDeadline(e.target.value)}
            style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
          />
        </Form.Group>

        {/* Required Skills */}
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

        {/* Current Job Image Display */}
        {currentImageUrl && (
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold">Current Job Image</Form.Label>
            <div>
              <img src={currentImageUrl} alt="Current Job" style={{ maxWidth: '200px', height: 'auto', borderRadius: '8px' }} />
            </div>
          </Form.Group>
        )}

        {/* Job Image Upload Field */}
        <Form.Group className="mb-4" controlId="jobImage">
          <Form.Label className="fw-bold">Upload New Job Image (Optional)</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e) => setJobImageFile(e.target.files[0])}
            style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
          />
          <small className="text-muted mt-1 d-block">Upload a new image to replace the current one.</small>
        </Form.Group>

        {/* Job Status Dropdown */}
        <Form.Group className="mb-4" controlId="jobStatus">
          <Form.Label className="fw-bold">Job Status</Form.Label>
          <Form.Select
            value={jobStatus}
            onChange={(e) => setJobStatus(e.target.value)}
            required
            style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef', padding: '0.75rem 1rem', borderRadius: '0.375rem' }}
          >
            <option value="Active">Active</option>
            <option value="Filled">Filled</option>
            <option value="Closed">Closed</option>
          </Form.Select>
        </Form.Group>

        {/* Submit Button */}
        <div className="d-flex justify-content-end mt-5">
          <Button
            variant="primary"
            type="submit"
            className="px-5 py-2"
            disabled={submitting}
            style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd', borderRadius: '0.375rem' }}
          >
            {submitting ? 'Updating Job...' : 'Update Job'}
          </Button>
        </div>
      </Form>
    </Container>
  );
}

export default EditJob;
