import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// You would need to install react-icons: npm install react-icons
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Container, Form, Button, Card, Accordion, Row, Col, Pagination as BSPagination } from 'react-bootstrap';

function Home() {
  // Dummy job data for display
  const jobs = [
    {
      id: 1,
      posted: '2 days ago',
      title: 'Landscaping Assistant',
      description: 'Seeking a reliable assistant for landscaping tasks. Experience preferred but not required. Must be able to lift heavy objects and work outdoors.',
      image: '../../public/job.avif', // Placeholder image
    },
    {
      id: 2,
      posted: '1 week ago',
      title: 'House Cleaning',
      description: 'Looking for a thorough house cleaner for a 3-bedroom house. Must have own supplies and transportation. Flexible hours.',
      image: 'https://via.placeholder.com/150x100?text=Cleaning+Supplies', // Placeholder image
    },
    {
      id: 3,
      posted: '3 days ago',
      title: 'Event Setup Crew',
      description: 'Need help setting up for a large event. Tasks include arranging tables, chairs, and decorations. Must be available on weekends.',
      image: 'https://via.placeholder.com/150x100?text=Event+Setup', // Placeholder image
    },
    {
      id: 4,
      posted: '5 days ago',
      title: 'Delivery Driver',
      description: 'Seeking a delivery driver for a local restaurant. Must have a valid driver\'s license and reliable vehicle. Part-time hours available.',
      image: 'https://via.placeholder.com/150x100?text=Delivery+Driver', // Placeholder image
    },
  ];

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
                      <Form.Control type="text" placeholder="e.g., New York" />
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="2">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Date Posted</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                      <Form.Group controlId="datePosted">
                        <Form.Select>
                          <option>Last 24 hours</option>
                          <option>Last 3 days</option>
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                        </Form.Select>
                      </Form.Group>
                    </Accordion.Body>
                  </Accordion.Item>

                  <Accordion.Item eventKey="3">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Pay Rate</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                      <Form.Control type="number" placeholder="Min Pay" className="mb-2" />
                      <Form.Control type="number" placeholder="Max Pay" />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>

                <Button variant="primary" className="w-100 mt-4" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}>
                  Apply Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Job Listings Column */}
          <Col lg={9}>
            <h3 className="mb-3">Available Jobs</h3>
            {jobs.map(job => (
              <Card key={job.id} className="mb-3 shadow-sm border-0">
                <Card.Body className="d-flex align-items-start">
                  <div className="me-3">
                    <img
                      src={job.image}
                      alt={job.title}
                      className="rounded"
                      style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                      Posted {job.posted}
                    </Card.Text>
                    <Card.Title className="mb-2 h5">{job.title}</Card.Title>
                    <Card.Text className="text-secondary mb-3">
                      {job.description}
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