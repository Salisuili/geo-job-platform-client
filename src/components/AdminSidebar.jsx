// src/components/AdminDashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Container, Nav, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { FaBars, FaSignOutAlt } from 'react-icons/fa'; // Import FaBars and FaSignOutAlt
import { useAuth } from '../contexts/AuthContext'; // Import auth context
import AdminSidebarContent from './AdminSidebar'; // Import the AdminSidebar content
 
// Define common sidebar styles for consistency
const adminSidebarBaseStyles = {
  width: '300px', // Set to 300px for consistency with employer dashboard
  backgroundColor: '#fff',
  borderRight: 'none', // No border for consistency
  padding: '2rem 1.5rem',
  flexShrink: 0,
  flexDirection: 'column',
  justifyContent: 'space-between', // Maintain space-between for logout at bottom
  minHeight: '100vh', // Ensure it takes full height
};

function AdminDashboardLayout({ children }) {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  // Close Offcanvas automatically when location changes (for mobile navigation)
  useEffect(() => {
    handleCloseOffcanvas();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login'); // Redirect to login page after logout
    handleCloseOffcanvas(); // Close sidebar after logout
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>

      {/* --- Mobile-Specific Navbar with Hamburger Button --- */}
      <Navbar expand="md" className="d-md-none bg-white shadow-sm w-100 position-fixed top-0" style={{ zIndex: 1030 }}>
        <Container fluid>
          <Button variant="light" onClick={handleShowOffcanvas} className="border-0 p-0">
            <FaBars size={24} />
          </Button>
          <Navbar.Brand as={Link} to="/admin/dashboard" className="ms-3 fw-bold text-dark">
            Admin Dashboard
          </Navbar.Brand>
        </Container>
      </Navbar>

      {/* --- The Admin Sidebar (Offcanvas Component) --- */}
      {/* 'responsive="md"' makes it:
          - Function as a sliding sidebar on small screens (<md)
          - Be a static, visible sidebar on medium screens and up (>=md)
      */}
      <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start" responsive="md">
        <Offcanvas.Header closeButton className="d-md-none">
          <Offcanvas.Title>Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body style={{ ...adminSidebarBaseStyles, display: 'flex' }}>
          {/* We pass handleCloseOffcanvas to the AdminSidebarContent
              so it can close the sidebar when a link is clicked. */}
          <AdminSidebarContent handleClose={handleCloseOffcanvas} handleLogout={handleLogout} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* --- Main Content Area --- */}
      {/* Added paddingTop to account for the fixed mobile Navbar */}
      <div className="flex-grow-1" style={{ paddingTop: '56px' }}>
        {children}
      </div>
    </div>
  );
}

export default AdminDashboardLayout;