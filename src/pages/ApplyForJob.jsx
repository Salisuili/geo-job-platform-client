// src/pages/ApplyForJob.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import LaborerDashboardLayout from '../layouts/LaborerDashboardLayout'; // Assuming laborer layout
import axios from 'axios'; // For handling file uploads

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function ApplyForJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  const [jobTitle, setJobTitle] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch job title on component mount
  useEffect(() => {
    const fetchJobTitle = async () => {
      if (!isAuthenticated || authLoading) return; // Wait for auth state

      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch job details.');
        }
        const data = await response.json();
        setJobTitle(data.title);
      } catch (err) {
        console.error("Error fetching job title:", err);
        setError(err.message || "Could not load job title.");
      }
    };

    if (isAuthenticated && user?.user_type === 'laborer') {
      fetchJobTitle();
    } else if (!authLoading && (!isAuthenticated || user?.user_type !== 'laborer')) {
      alert("You must be logged in as a laborer to apply for jobs.");
      navigate('/login'); // Redirect if not authorized
    }
  }, [jobId, isAuthenticated, authLoading, user, token, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!resumeFile) {
      setError('Please upload your resume.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    if (coverLetterFile) {
      formData.append('coverLetter', coverLetterFile);
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/jobs/${jobId}/apply`, // Use the job-specific apply endpoint
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Axios sets this automatically for FormData
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setSuccess(response.data.message || 'Application submitted successfully!');
      // Clear form fields
      setResumeFile(null);
      setCoverLetterFile(null);
      document.getElementById('formResume').value = '';
      document.getElementById('formCoverLetter').value = '';
      setTimeout(() => navigate('/my-applications'), 2000); // Redirect to applied jobs page
    } catch (err) {
      console.error('Application submission error:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !isAuthenticated || user?.user_type !== 'laborer') {
    return (
      <LaborerDashboardLayout>
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  return (
    <LaborerDashboardLayout>
      <Container className="my-4">
        <Card className="shadow-sm p-4">
          <Card.Title className="mb-4">Apply for: {jobTitle || 'Loading Job...'}</Card.Title>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formResume" className="mb-3">
              <Form.Label>Upload Resume <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setResumeFile(e.target.files[0])}
                required
              />
              <Form.Text className="text-muted">PDF, DOC, DOCX files only (Max 10MB).</Form.Text>
            </Form.Group>

            <Form.Group controlId="formCoverLetter" className="mb-4">
              <Form.Label>Upload Cover Letter (Optional)</Form.Label>
              <Form.Control
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setCoverLetterFile(e.target.files[0])}
              />
              <Form.Text className="text-muted">PDF, DOC, DOCX files only (Max 10MB).</Form.Text>
            </Form.Group>

            <Row>
              <Col>
                <Button variant="primary" type="submit" disabled={loading} className="w-100">
                  {loading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  ) : (
                    'Submit Application'
                  )}
                </Button>
              </Col>
              <Col>
                <Button variant="outline-secondary" onClick={() => navigate(-1)} disabled={loading} className="w-100">
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Container>
    </LaborerDashboardLayout>
  );
}

export default ApplyForJob;