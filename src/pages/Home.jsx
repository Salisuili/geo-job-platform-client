import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// You would need to install react-icons: npm install react-icons
import { FaSearch, FaChevronDown, FaChevronUp, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Navbar, Nav, Container, Form, FormControl, Button, Card, Accordion, Row, Col, Pagination as BSPagination } from 'react-bootstrap';

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
      {/* Navbar */}
      <Navbar bg="white" expand="lg" className="border-bottom py-3">
        <Container fluid>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            <img
              src="https://via.placeholder.com/30x30?text=L"
              alt="Local Labor Logo"
              className="me-2"
            />
            <span className="fw-bold">Local Labor</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#home" className="mx-2 active">Home</Nav.Link>
              <Nav.Link href="#jobs" className="mx-2">Jobs</Nav.Link>
              <Nav.Link href="#services" className="mx-2">Services</Nav.Link>
              <Nav.Link href="#about" className="mx-2">About Us</Nav.Link>
            </Nav>
            <Form className="d-flex align-items-center mx-3">
              <div className="position-relative">
                <FormControl
                  type="search"
                  placeholder="Search"
                  className="me-2 ps-4"
                  aria-label="Search"
                  style={{ borderRadius: '0.375rem', backgroundColor: '#f0f2f5', border: 'none' }}
                />
                <FaSearch className="position-absolute" style={{ left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
              </div>
            </Form>
            <Button variant="primary" className="me-2 px-4 py-2" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}>
              Post a Job
            </Button>
            <img
              src="https://via.placeholder.com/40x40?text=P"
              alt="Profile"
              className="rounded-circle"
            />
          </Navbar.Collapse>
        </Container>
      </Navbar>

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