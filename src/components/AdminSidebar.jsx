// src/components/AdminSidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Import auth context

function AdminSidebar() {
  const { logout } = useAuth(); // To handle logout from admin section

  return (
    <div style={{
      width: '250px',
      backgroundColor: '#fff',
      borderRight: '1px solid #e9ecef',
      padding: '2rem 1.5rem',
      flexShrink: 0,
      minHeight: '100vh', // Ensure it takes full height
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Push logout to bottom
    }}>
      <div> {/* Top part of sidebar */}
        <div className="mb-4">
          <h5 className="fw-bold mb-0">Local Labor</h5>
          <small className="text-muted">Admin Panel</small> {/* Added for clarity */}
        </div>
        <Nav className="flex-column">
          <Nav.Link as={Link} to="/admin/dashboard" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaHome className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/users" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaUsers className="me-2" /> Users
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/jobs" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaBriefcase className="me-2" /> Jobs
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/reports" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaChartBar className="me-2" /> Reports
          </Nav.Link>
          <Nav.Link as={Link} to="/admin/settings" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaCog className="me-2" /> Settings
          </Nav.Link>
        </Nav>
      </div>
      {/* Logout button at the bottom of the sidebar */}
      <Nav className="flex-column">
        <Nav.Link onClick={logout} className="text-danger py-2 d-flex align-items-center"
          style={{ borderRadius: '0.375rem' }}>
          <FaCog className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </div>
  );
}

export default AdminSidebar;