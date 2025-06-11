import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa'; 
import { useAuth } from '../contexts/AuthContext'; 

import EmployerSidebar from '../components/EmployerSidebar'; 

const sidebarBaseStyles = {
  width: '300px', 
  backgroundColor: '#fff', 
  borderRight: 'none', 
  padding: '2rem 1.5rem',
  flexShrink: 0,
  flexDirection: 'column', 
};

function EmployerDashboardLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation(); 
  const navigate = useNavigate(); 

  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  useEffect(() => {
    handleCloseOffcanvas();
  }, [location.pathname]);

  const handleLayoutLogout = () => {
    logout(); 
    handleCloseOffcanvas();
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>

      <Navbar expand="md" className="d-md-none bg-white shadow-sm w-100 position-fixed top-0" style={{ zIndex: 1030 }}>
        <Container fluid>
          <Button variant="light" onClick={handleShowOffcanvas} className="border-0 p-0">
            <FaBars size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/dashboard" className="ms-3 fw-bold text-dark">
            Employer Dashboard
          </Navbar.Brand>
        </Container>
      </Navbar>

      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" responsive="md">
        <Offcanvas.Header closeButton className="d-md-none">
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body style={{ ...sidebarBaseStyles, display: 'flex' }}>
          <EmployerSidebar handleClose={handleCloseOffcanvas} />
        </Offcanvas.Body>
      </Offcanvas>

      <div className="flex-grow-1" style={{ paddingTop: '56px' }}>
        {children}
      </div>
    </div>
  );
}

export default EmployerDashboardLayout;