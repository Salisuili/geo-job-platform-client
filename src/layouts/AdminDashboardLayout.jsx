import React, { useState, useEffect } from 'react'; // Import useEffect
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { Container, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';

function AdminDashboardLayout({ children }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation(); // Initialize useLocation

  const handleCloseSidebar = () => setShowSidebar(false);
  const handleShowSidebar = () => setShowSidebar(true);

  // Close Offcanvas automatically when the route changes (important for mobile navigation)
  useEffect(() => {
    handleCloseSidebar();
  }, [location.pathname]); // Dependency on location.pathname to re-run when route changes

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}> {/* Added display:flex here for overall layout */}
      {/* --- Mobile Navbar with Hamburger (Visible on small screens only) --- */}
      {/* d-md-none hides this Navbar on medium and larger screens */}
      <Navbar bg="white" className="d-md-none shadow-sm px-3" fixed="top">
        <Button variant="light" onClick={handleShowSidebar} className="border-0">
          <FaBars size={20} />
        </Button>
        <Navbar.Brand as={Link} to="/admin/dashboard" className="ms-3 fw-bold text-dark">Admin Panel</Navbar.Brand>
      </Navbar>

      {/* --- Offcanvas Sidebar for Small Screens (Hidden on md and up) --- */}
      {/* d-md-none hides the Offcanvas itself on medium and larger screens */}
      <Offcanvas show={showSidebar} onHide={handleCloseSidebar} responsive="md" className="d-md-none">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0"> {/* AdminSidebar has its own padding */}
          {/* AdminSidebar for mobile, pass onLinkClick prop */}
          <AdminSidebar onLinkClick={handleCloseSidebar} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* --- Desktop Sidebar (Visible on medium and large screens only) --- */}
      {/* d-none hides on xs-sm, d-md-block makes it a block on md and up */}
      {/* The AdminSidebar component already contains its fixed width, background, etc. */}
      <div className="d-none d-md-block">
        <AdminSidebar /> {/* AdminSidebar for desktop, no onLinkClick needed here */}
      </div>

      {/* --- Main Content --- */}
      {/* flex-grow-1 ensures it takes remaining horizontal space */}
      {/* pt-md-0 pt-5: pt-5 for mobile (to account for fixed Navbar), pt-0 for desktop */}
      <div className="flex-grow-1 p-4 pt-md-0" style={{ paddingTop: '56px' }}> {/* Adjusted paddingTop for mobile Navbar */}
        {children}
      </div>
    </div>
  );
}

export default AdminDashboardLayout;