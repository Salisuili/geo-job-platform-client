import React from 'react';
import { Navbar, Nav, Container, Form, FormControl, Button } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; // Using react-router-dom for navigation
import { useAuth } from '../contexts/AuthContext'; // Import useAuth hook

function PublicNavbar() {
  const { isAuthenticated, user, logout } = useAuth(); // Get isAuthenticated, user, and logout from AuthContext
  const navigate = useNavigate(); // For programmatic navigation after logout

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <div className="d-flex align-items-center gap-2 text-dark">
            <div className="me-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 48 48"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
              </svg>
            </div>
            <h2 className="h5 fw-bold mb-0">WorkConnect</h2>
          </div>
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

          {/* Conditional Rendering based on authentication status */}
          {!isAuthenticated ? (
            // Show Sign Up and Login buttons if not authenticated
            <>
              <Button as={Link} to="/signup" variant="outline-primary" className="me-2 px-4 py-2">
                Sign Up
              </Button>
              <Button as={Link} to="/login" variant="primary" className="px-4 py-2" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}>
                Login
              </Button>
            </>
          ) : (
            // Show Dashboard link and Logout button if authenticated
            <>
              {/* Optional: Add a link to the user's dashboard based on their role */}
              {user && user.user_type === 'laborer' && (
                <Button as={Link} to="/dashboard" variant="outline-success" className="me-2 px-4 py-2">
                  Dashboard
                </Button>
              )}
              {user && user.user_type === 'employer' && (
                <Button as={Link} to="/my-jobs" variant="outline-success" className="me-2 px-4 py-2">
                  My Jobs
                </Button>
              )}
              {user && user.user_type === 'admin' && (
                <Button as={Link} to="/admin/dashboard" variant="outline-success" className="me-2 px-4 py-2">
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