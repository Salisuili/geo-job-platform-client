import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

// Define common sidebar styles as an object to apply consistently
const sidebarBaseStyles = {
  width: '300px', // INCREASED WIDTH as requested
  backgroundColor: '#fff', // Already white, ensuring it stays white
  borderRight: 'none', // REMOVED BORDER to eliminate potential "grey" line
  padding: '2rem 1.5rem',
  flexShrink: 0,
  flexDirection: 'column', // This will be used with display: flex
};

function EmployerDashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // State to control the visibility of the Offcanvas sidebar (for mobile)
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  // Handlers for showing/hiding the Offcanvas
  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  // Automatically close the Offcanvas when the route changes (useful for mobile navigation)
  useEffect(() => {
    handleCloseOffcanvas();
  }, [location.pathname]);

  // Function to determine if a Nav.Link is currently active for styling
  const isNavLinkActive = (path) => {
    // Special handling for /laborers to be active when on a specific laborer profile
    if (path === '/laborers' && location.pathname.startsWith('/laborers/')) {
      return true;
    }
    // Retaining the original path check for '/my-jobs'
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
    handleCloseOffcanvas(); // Close sidebar after logout
  };

  // --- Helper Component for Sidebar Navigation Content ---
  const SidebarNavContent = ({ handleClose }) => (
    <>
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome</h6>
        <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
      </div>
      <Nav className="flex-column flex-grow-1">
        <Nav.Link
          as={Link}
          to="/dashboard"
          onClick={handleClose} // Close sidebar on click (for mobile)
          className={`py-2 d-flex align-items-center ${isNavLinkActive('/dashboard') ? 'text-primary fw-bold' : 'text-dark'}`}
          style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive('/dashboard') ? '#e9ecef' : 'transparent' }}
        >
          <FaHome className="me-2" /> Dashboard
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/my-jobs" // Original path kept as requested
          onClick={handleClose} // Close sidebar on click (for mobile)
          className={`py-2 d-flex align-items-center ${isNavLinkActive('/my-jobs') ? 'text-primary fw-bold' : 'text-dark'}`}
          style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive('/my-jobs') ? '#e9ecef' : 'transparent' }}
        >
          <FaBriefcase className="me-2" /> Jobs
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/laborers"
          onClick={handleClose} // Close sidebar on click (for mobile)
          className={`py-2 d-flex align-items-center ${isNavLinkActive('/laborers') ? 'text-primary fw-bold' : 'text-dark'}`}
          style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive('/laborers') ? '#e9ecef' : 'transparent' }}
        >
          <FaUsers className="me-2" /> Laborers
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/payments"
          onClick={handleClose} // Close sidebar on click (for mobile)
          className={`py-2 d-flex align-items-center ${isNavLinkActive('/payments') ? 'text-primary fw-bold' : 'text-dark'}`}
          style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive('/payments') ? '#e9ecef' : 'transparent' }}
        >
          <FaCreditCard className="me-2" /> Payments
        </Nav.Link>
        <Nav.Link
          as={Link}
          to="/settings"
          onClick={handleClose} // Close sidebar on click (for mobile)
          className={`py-2 d-flex align-items-center ${isNavLinkActive('/settings') ? 'text-primary fw-bold' : 'text-dark'}`}
          style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive('/settings') ? '#e9ecef' : 'transparent' }}
        >
          <FaCog className="me-2" /> Settings
        </Nav.Link>
      </Nav>
      {/* Logout button - pushed to bottom of sidebar */}
      <Nav.Link
        onClick={handleLogout}
        className="text-danger py-2 d-flex align-items-center mt-auto"
        style={{ borderRadius: '0.375rem', cursor: 'pointer' }}
      >
        <FaSignOutAlt className="me-2" /> Logout
      </Nav.Link>
    </>
  );

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>

      {/* --- Mobile-Specific Navbar with Hamburger Button --- */}
      {/* This Navbar will only appear on screens smaller than 'md' (768px) */}
      <Navbar expand="md" className="d-md-none bg-white shadow-sm w-100 position-fixed top-0" style={{ zIndex: 1030 }}>
        <Container fluid>
          <Button variant="light" onClick={handleShowOffcanvas} className="border-0 p-0">
            <FaBars size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/dashboard" className="ms-3 fw-bold text-dark">
            Dashboard
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* --- The ONE and ONLY Sidebar (Offcanvas Component) --- */}
      {/* 'responsive="md"' makes the Offcanvas handle both mobile and desktop behavior:
          - On screens < md: it's a sliding off-canvas sidebar (hidden by default, toggleable).
          - On screens >= md: it becomes a static, visible sidebar that pushes content.
      */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" responsive="md">
        {/* Offcanvas.Header will show the close button only on small screens */}
        <Offcanvas.Header closeButton className="d-md-none">
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>

        {/* Offcanvas.Body applies the exact original sidebar styles and ensures flex display */}
        <Offcanvas.Body style={{ ...sidebarBaseStyles, display: 'flex' }}>
          <SidebarNavContent handleClose={handleCloseOffcanvas} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* --- Main Content Area --- */}
      {/* Renders the child components passed to EmployerDashboardLayout */}
      {/* Added paddingTop to account for the fixed mobile Navbar */}
      <div className="flex-grow-1" style={{ paddingTop: '56px' }}>
        {children}
      </div>
    </div>
  );
}

export default EmployerDashboardLayout;