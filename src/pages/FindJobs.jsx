import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge, Form } from 'react-bootstrap';
import LaborerDashboardLayout from '../layouts/LaborerDashboardLayout'; // Adjusted import path
import defaultJobImage from '../assets/images/default-job.jpg'; // Ensure this image exists

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function FindJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [jobType, setJobType] = useState('');
  const [city, setCity] = useState('');
  const [minPay, setMinPay] = useState('');
  const [maxPay, setMaxPay] = useState('');
  const [datePosted, setDatePosted] = useState('');
  const [skills, setSkills] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    let queryParams = new URLSearchParams();

    if (jobType) queryParams.append('jobType', jobType);
    if (city) queryParams.append('city', city);
    if (minPay) queryParams.append('minPay', minPay);
    if (maxPay) queryParams.append('maxPay', maxPay);
    if (datePosted) queryParams.append('datePosted', datePosted);
    if (skills) queryParams.append('skills', skills);

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs.');
      }

      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []); // Initial fetch, filters apply on button click

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  if (loading) {
    return (
      <LaborerDashboardLayout>
        <Container fluid className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading jobs...</span>
          </Spinner>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  if (error) {
    return (
      <LaborerDashboardLayout>
        <Container fluid className="py-5">
          <Alert variant="danger">
            <h4>Error loading jobs!</h4>
            <p>{error}</p>
            <Button onClick={fetchJobs}>Try Again</Button>
          </Alert>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  return (
    <LaborerDashboardLayout>
      <Container fluid className="py-4 px-3 px-md-5">
        <h3 className="mb-4 fw-bold">Find Jobs</h3>

        {/* Filters Section */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Card.Title className="mb-3">Filter Jobs</Card.Title>
            <Form onSubmit={handleFilterSubmit}>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Job Type</Form.Label>
                    <Form.Select value={jobType} onChange={(e) => setJobType(e.target.value)}>
                      <option value="">Any</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Temporary">Temporary</option>
                      <option value="Internship">Internship</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>City</Form.Label>
                    <Form.Control type="text" placeholder="e.g., Lagos" value={city} onChange={(e) => setCity(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Minimum Pay</Form.Label>
                    <Form.Control type="number" placeholder="e.g., 50000" value={minPay} onChange={(e) => setMinPay(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Maximum Pay</Form.Label>
                    <Form.Control type="number" placeholder="e.g., 100000" value={maxPay} onChange={(e) => setMaxPay(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Date Posted</Form.Label>
                    <Form.Select value={datePosted} onChange={(e) => setDatePosted(e.target.value)}>
                      <option value="">Any Time</option>
                      <option value="24h">Last 24 Hours</option>
                      <option value="3d">Last 3 Days</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Skills (comma-separated)</Form.Label>
                    <Form.Control type="text" placeholder="e.g., carpentry, plumbing" value={skills} onChange={(e) => setSkills(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col xs={12} className="d-flex justify-content-end">
                  <Button variant="primary" type="submit">
                    Apply Filters
                  </Button>
                  <Button variant="outline-secondary" className="ms-2" onClick={() => {
                    setJobType(''); setCity(''); setMinPay(''); setMaxPay(''); setDatePosted(''); setSkills('');
                    // Optionally, re-fetch jobs without filters immediately
                    setTimeout(fetchJobs, 0);
                  }}>
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Job Listings */}
        {jobs.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">No jobs found matching your criteria.</h5>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {jobs.map((job) => (
              <Col key={job._id}>
                <Card className="shadow-sm border-0 h-100 d-flex flex-column">
                  <Card.Img
                    variant="top"
                    src={job.image_url ? `${API_BASE_URL}${job.image_url.startsWith('/uploads/') ? job.image_url : `/uploads/job_images/${job.image_url}`}` : defaultJobImage}
                    alt={job.title}
                    style={{ height: '180px', objectFit: 'cover' }}
                  />
                  <Card.Body className="flex-grow-1 d-flex flex-column">
                    <Card.Title className="mb-1">{job.title}</Card.Title>
                    <Card.Subtitle className="mb-2 text-muted small">
                      {job.employer_id?.company_name || 'Individual Employer'}
                    </Card.Subtitle>
                    <Card.Text className="text-muted small mb-2">
                      {job.job_type} | {job.city}
                    </Card.Text>
                    <Card.Text className="fw-bold mb-3">
                      {job.pay_type}: N{job.pay_rate_min} - N{job.pay_rate_max}
                    </Card.Text>
                    <div className="mt-auto d-flex flex-column gap-2">
                      <Button
                        variant="primary"
                        onClick={() => navigate(`/jobs/${job._id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </LaborerDashboardLayout>
  );
}

export default FindJobs;