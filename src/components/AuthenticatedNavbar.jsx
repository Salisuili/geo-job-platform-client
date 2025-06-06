// src/components/AuthenticatedNavbar.jsx
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import auth context

function AuthenticatedNavbar() {
  const { user, isEmployer, logout } = useAuth(); // Get user and role from context

  return (
    <Navbar bg="white" expand="lg" className="border-bottom py-3">
      <Container>
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
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/find-work" className="mx-2">Find Work</Nav.Link>
          <Nav.Link as={Link} to="/my-jobs" className="mx-2">My Jobs</Nav.Link>
          <Nav.Link as={Link} to="/messages" className="mx-2">Messages</Nav.Link>
          <Nav.Link as={Link} to="/notifications" className="mx-2">
            <FaBell style={{ fontSize: '1.2rem', color: '#6c757d' }} />
          </Nav.Link>
          {isEmployer && ( // Conditional rendering for "Post a Job" button
            <Button as={Link} to="/post-job" variant="primary" className="me-2 px-4 py-2" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}>
              Post a Job
            </Button>
          )}
          <Nav.Link as={Link} to="/profile" className="mx-2"> {/* Link to user's main profile */}
            {user?.profile_picture_url ? (
              <img
                src={user.profile_picture_url}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
            ) : (
              <FaUserCircle style={{ fontSize: '1.5rem', color: '#6c757d' }} />
            )}
          </Nav.Link>
          <Button variant="outline-secondary" size="sm" onClick={logout} className="ms-2">
            Logout
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AuthenticatedNavbar;