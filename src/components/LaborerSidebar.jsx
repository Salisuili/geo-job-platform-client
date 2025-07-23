// src/components/sidebars/LaborerSidebar.jsx
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBriefcase, FaListAlt, FaCog, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const LaborerSidebar = ({ handleClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/laborer/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/", icon: <FaBriefcase />, text: "Find Jobs" }, // Link to the public home page for finding jobs
    { to: "/my-applications", icon: <FaListAlt />, text: "My Applications" },
    { to: "/laborer/profile", icon: <FaUserCircle />, text: "Profile" },
    // { to: "/laborer/settings", icon: <FaCog />, text: "Settings" }, // Example: if you add settings
  ];

  const isNavLinkActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    if (handleClose) handleClose(); // Close offcanvas after logout
  };

  return (
    <>
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome, {user?.full_name || 'Laborer'}</h6>
        <small className="text-muted">Laborer</small>
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

        {/* Logout Link */}
        <Nav.Link
          as="button"
          onClick={handleLogout}
          className="text-danger py-2 d-flex align-items-center mt-auto"
          style={{ borderRadius: '0.375rem', cursor: 'pointer' }}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </>
  );
};

export default LaborerSidebar;