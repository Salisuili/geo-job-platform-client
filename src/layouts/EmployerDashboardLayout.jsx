import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

import EmployerSidebar from '../components/EmployerSidebar';

function EmployerDashboardLayout({ children }) {
  const { logout, user } = useAuth(); // Destructure user to pass to sidebar
  const location = useLocation();
  const navigate = useNavigate();

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  // Close offcanvas when route changes
  useEffect(() => {
    handleCloseOffcanvas();
  }, [location.pathname]);

  const handleLayoutLogout = () => {
    logout();
    handleCloseOffcanvas();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <div className="d-flex" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navbar for small screens (d-md-none means hidden on medium and up) */}
      <Navbar expand="md" className="d-md-none bg-white shadow-sm w-100 position-fixed top-0" style={{ zIndex: 1030 }}>
        <Container fluid>
          <Button variant="light" onClick={handleShowOffcanvas} className="border-0 p-0 me-3">
            <FaBars size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-dark">
            Local Labor
          </Navbar.Brand>
          {/* Optional: Add user info or logout button here for small screens if needed */}
        </Container>
      </Navbar>

      {/* Sidebar for large screens (d-none means hidden by default, d-md-flex means flex on medium and up) */}
      <div
        className="d-none d-md-flex" // Hide by default, show as flex on medium screens and up
        style={{
          width: '280px', // Adjust sidebar width as needed
          backgroundColor: '#fff',
          borderRight: '1px solid #e9ecef',
          padding: '2rem 1.5rem',
          flexShrink: 0,
          flexDirection: 'column',
          height: '100vh', // Ensure it takes full height
          position: 'sticky', // Makes it stick to the top
          top: 0,
        }}
      >
        <EmployerSidebar handleClose={handleCloseOffcanvas} /> {/* No need to pass user explicitly, useAuth will provide it */}
      </div>

      {/* Offcanvas for small screens */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" className="d-md-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className="fw-bold">Local Labor</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="d-flex flex-column">
          <EmployerSidebar handleClose={handleCloseOffcanvas} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content Area */}
      <div className="flex-grow-1" style={{ paddingTop: '56px' }}> {/* Add padding-top to account for fixed navbar on small screens */}
        {children}
      </div>
    </div>
  );
}

export default EmployerDashboardLayout;