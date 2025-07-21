import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Button, Offcanvas, Navbar } from 'react-bootstrap';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from '../components/AdminSidebar';

function AdminDashboardLayout({ children }) {
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const location = useLocation();

  const handleCloseOffcanvas = () => setShowOffcanvas(false);
  const handleShowOffcanvas = () => setShowOffcanvas(true);

  useEffect(() => {
    handleCloseOffcanvas();
  }, [location.pathname]);

  return (
    <div className="d-flex" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Mobile Navbar */}
      <Navbar bg="white" className="d-md-none shadow-sm px-3" fixed="top">
        <Button variant="light" onClick={handleShowOffcanvas} className="border-0 p-0">
          <FaBars size={20} />
        </Button>
        <Navbar.Brand as={Link} to="/admin/dashboard" className="ms-3 fw-bold text-dark">Admin Panel</Navbar.Brand>
      </Navbar>

      {/* Desktop Sidebar */}
      <div
        className="d-none d-md-block"
        style={{
          width: '280px',
          backgroundColor: '#fff',
          borderRight: '1px solid #e0e0e0',
          padding: '20px',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
        }}
      >
        <AdminSidebar />
      </div>

      {/* Mobile Offcanvas Sidebar */}
      <Offcanvas 
        show={showOffcanvas} 
        onHide={handleCloseOffcanvas} 
        placement="start" 
        className="d-md-none"
        style={{ width: '280px' }}
      >
        <Offcanvas.Header closeButton className="border-bottom">
          <Offcanvas.Title className="fw-bold">Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0 d-flex flex-column">
          <AdminSidebar onLinkClick={handleCloseOffcanvas} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 pt-5 pt-md-0" style={{ overflowX: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

export default AdminDashboardLayout;