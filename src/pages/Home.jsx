import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 

import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Container, Form, Button, Card, Accordion, Row, Col, Pagination as BSPagination } from 'react-bootstrap';

import defaultJobImage from '../job.avif'; 

function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/jobs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Empty dependency array means this runs once on mount

  // Placeholder for filter states and functions (will be implemented later)
  const [filterLocation, setFilterLocation] = useState('');
  const [filterJobType, setFilterJobType] = useState([]);
  const [filterDatePosted, setFilterDatePosted] = useState('');
  const [filterMinPay, setFilterMinPay] = useState('');
  const [filterMaxPay, setFilterMaxPay] = useState('');

  const handleApplyFilters = () => {
    alert("Filter functionality will be implemented later!");
    // This is where you would trigger a new fetch with filter parameters
  };

  // Helper to format date
  const formatDate = (isoString) => {
    if (!isoString) return 'Date not available';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Helper to display time ago (simple version, can be made more robust)
  const timeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    const now = new Date();
    const postedDate = new Date(dateString);
    const seconds = Math.floor((now - postedDate) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  };


  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>

      {/* Main Content */}
      <Container fluid className="my-4">
        <Row>
          {/* Filters Column */}
          <Col lg={3}>
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Filters</h5>
                <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen>
                  <Accordion.Item eventKey="0">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Job Type</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                      <Form.Group controlId="jobTypeFullTime" className="mb-2">
                        <Form.Check type="checkbox" label="Full-time" />
                      </Form.Group>
                      <Form.Group controlId="jobTypePartTime" className="mb-2">
                        <Form.Check type="checkbox" label="Part-time" />
                      </Form.Group>
                      <Form.Group controlId="jobTypeContract" className="mb-2">
                        <Form.Check type="checkbox" label="Contract" />
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="1">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Location</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                      <Form.Control type="text" placeholder="e.g., New York"
                        value={filterLocation}
                        onChange={(e) => setFilterLocation(e.target.value)}
                      />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Date Posted</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                      <Form.Group controlId="datePosted">
                        <Form.Select
                          value={filterDatePosted}
                          onChange={(e) => setFilterDatePosted(e.target.value)}
                        >
                          <option value="">Any Time</option>
                          <option value="24h">Last 24 hours</option>
                          <option value="3d">Last 3 days</option>
                          <option value="7d">Last 7 days</option>
                          <option value="30d">Last 30 days</option>
                        </Form.Select>
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="3">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Pay Rate</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                      <Form.Control
                        type="number"
                        placeholder="Min Pay"
                        className="mb-2"
                        value={filterMinPay}
                        onChange={(e) => setFilterMinPay(e.target.value)}
                      />
                      <Form.Control
                        type="number"
                        placeholder="Max Pay"
                        value={filterMaxPay}
                        onChange={(e) => setFilterMaxPay(e.target.value)}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <Button
                  variant="primary"
                  className="w-100 mt-4"
                  style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Job Listings Column */}
          <Col lg={9}>
            <h3 className="mb-3">Available Jobs</h3>

            {loading && <p>Loading jobs...</p>}
            {error && <p className="text-danger">Error: {error}</p>}
            {!loading && jobs.length === 0 && <p>No jobs found.</p>}

            {!loading && !error && jobs.map(job => (
              <Card key={job._id} className="mb-3 shadow-sm border-0">
                <Card.Body className="d-flex align-items-start">
                  <div className="me-3">
                    <img
                      src={job.image_url || defaultJobImage} // Use job.image_url or fallback to default
                      alt={job.title}
                      className="rounded"
                      style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                      Posted {timeAgo(job.createdAt)} in {job.location.address_text || 'N/A'}
                    </Card.Text>
                    <Card.Title className="mb-2 h5">{job.title}</Card.Title>
                    <Card.Text className="text-secondary mb-1">
                      {job.description}
                    </Card.Text>
                    <Card.Text className="text-primary fw-bold mb-3">
                      Pay: ${job.pay_rate_min} - ${job.pay_rate_max} per {job.pay_type}
                    </Card.Text>
                    <Button variant="outline-primary" size="sm">
                      View Job
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-4">
              <BSPagination>
                <BSPagination.Prev>
                  <FaChevronLeft />
                </BSPagination.Prev>
                <BSPagination.Item active>{1}</BSPagination.Item>
                <BSPagination.Item>{2}</BSPagination.Item>
                <BSPagination.Item>{3}</BSPagination.Item>
                <BSPagination.Item>{4}</BSPagination.Item>
                <BSPagination.Item>{5}</BSPagination.Item>
                <BSPagination.Next>
                  <FaChevronRight />
                </BSPagination.Next>
              </BSPagination>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;