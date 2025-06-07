import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FaBell, FaUserCircle } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../contexts/AuthContext'; 

const DEFAULT_USER_PIC = 'https://via.placeholder.com/32x32?text=User'; 

function AuthenticatedNavbar() {
  const { user, isEmployer, logout } = useAuth(); 
  const navigate = useNavigate(); 

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

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
          {user?.user_type === 'employer' ? (
            <Nav.Link as={Link} to="/my-jobs" className="mx-2">My Jobs</Nav.Link>
          ) : user?.user_type === 'laborer' ? (
            <Nav.Link as={Link} to="/my-applications" className="mx-2">My Applications</Nav.Link> // Example for laborer
          ) : null}

          <Nav.Link as={Link} to="/messages" className="mx-2">Messages</Nav.Link>
          <Nav.Link as={Link} to="/notifications" className="mx-2">
            <FaBell style={{ fontSize: '1.2rem', color: '#6c757d' }} />
          </Nav.Link>
          {isEmployer && ( // Conditional rendering for "Post a Job" button (only for employers)
            <Button as={Link} to="/post-job" variant="primary" className="me-2 px-4 py-2" style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}>
              Post a Job
            </Button>
          )}
          {user?.user_type === 'admin' && ( // Conditional rendering for "Admin Dashboard" (only for admins)
            <Button as={Link} to="/admin-dashboard" variant="info" className="me-2 px-4 py-2">
              Admin Dashboard
            </Button>
          )}
          <Nav.Link as={Link} to="/profile" className="mx-2"> {/* Link to user's main profile */}
            {user?.profile_picture_url ? ( // Check if profile_picture_url exists
              <img
                src={user.profile_picture_url}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
            ) : (
              // Fallback to online placeholder if no profile picture
              <img
                src={DEFAULT_USER_PIC} // Use the defined online placeholder
                alt="Profile Placeholder"
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
              // Or if you prefer the icon: <FaUserCircle style={{ fontSize: '1.5rem', color: '#6c757d' }} />
            )}
          </Nav.Link>
          <Button variant="danger" size="sm" onClick={handleLogout} className="ms-2"> {/* Use handleLogout */}
            Logout
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AuthenticatedNavbar;