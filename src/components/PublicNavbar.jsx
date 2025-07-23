import React from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import InstallPWAButton from './InstallPWAButton'; // Import the InstallPWAButton component

function PublicNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src={process.env.PUBLIC_URL + '/work_connect2.png'}
            alt="WorkConnect Logo"
            style={{ height: '40px', width: 'auto' }}
          />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
            <Nav.Link as={Link} to="/jobs" className="mx-2">Jobs</Nav.Link>
            <Nav.Link as={Link} to="/services" className="mx-2">Services</Nav.Link>
            <Nav.Link as={Link} to="/about" className="mx-2">About Us</Nav.Link>
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

          {!isAuthenticated ? (
            <>
              <Button as={Link} to="/signup" variant="outline-primary" className="me-2 px-4 py-2">
                Sign Up
              </Button>
              <Button as={Link} to="/login" variant="primary" className="px-4 py-2" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}>
                Login
              </Button>
              <InstallPWAButton />
            </>
          ) : (
            <>
              {user && user.user_type === 'laborer' && (
                <Button as={Link} to="/laboradashboard" variant="outline-success" className="me-2 px-4 py-2">
                  Job Seeker Dashboard
                </Button>
              )}
              {user && user.user_type === 'employer' && (
                <Button as={Link} to="/my-jobs" variant="outline-success" className="me-2 px-4 py-2">
                  My Jobs
                </Button>
              )}
              {user && user.user_type === 'admin' && (
                <Button as={Link} to="/admin-dashboard" variant="outline-success" className="me-2 px-4 py-2">
                  Admin Dashboard
                </Button>
              )}
              <Button variant="danger" onClick={handleLogout} className="px-4 py-2">
                Logout
              </Button>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default PublicNavbar;