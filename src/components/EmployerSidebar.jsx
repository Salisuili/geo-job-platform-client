import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function EmployerSidebar({ handleClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/my-jobs", icon: <FaBriefcase />, text: "My Jobs" },
    { to: "/laborers", icon: <FaUsers />, text: "Laborers" },
    { to: "/payments", icon: <FaCreditCard />, text: "Payments" },
    { to: "/settings", icon: <FaCog />, text: "Settings" },
  ];

  const isNavLinkActive = (path) => {
    // Special handling for nested routes, e.g., /laborers/123 should still highlight /laborers
    if (path === '/my-jobs' && location.pathname.startsWith('/employer/jobs/')) {
        return true; // Highlight 'My Jobs' if on any job-related sub-page (edit, applicants)
    }
    if (path === '/laborers' && location.pathname.startsWith('/laborers/')) {
        return true;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    handleClose(); // Close offcanvas after logout
  };

  return (
    <>
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome, {user?.full_name || user?.company_name || 'Employer'}</h6>
        <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
      </div>
      <Nav className="flex-column flex-grow-1"> {/* flex-grow-1 ensures nav takes available space */}
        {navLinks.map(link => (
          <Nav.Link
            key={link.to}
            as={Link}
            to={link.to}
            onClick={handleClose} // Close offcanvas on link click
            className={`py-2 d-flex align-items-center ${isNavLinkActive(link.to) ? 'text-primary fw-bold' : 'text-dark'}`}
            style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive(link.to) ? '#e9ecef' : 'transparent' }}
          >
            <span className="me-2">{link.icon}</span> {link.text}
          </Nav.Link>
        ))}
        {/* Logout button */}
        <Nav.Link
          onClick={handleLogout}
          className="text-danger py-2 d-flex align-items-center mt-auto" // mt-auto pushes it to the bottom
          style={{ borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </>
  );
}

export default EmployerSidebar;