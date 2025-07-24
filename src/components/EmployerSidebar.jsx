// src/components/EmployerSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function EmployerSidebar({ onLinkClick }) {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not defined (e.g., still loading), default to a safe path for profileLink
  const profileLink = user ? `/profile` : '/profile'; // Changed to '/profile' as it handles both types

  const navLinks = [
    { to: "/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/my-jobs", icon: <FaBriefcase />, text: "My Jobs" },
    { to: "/employer/laborers", icon: <FaUsers />, text: "Laborers" }, // <--- UPDATED THIS LINE
    { to: "/payments", icon: <FaCreditCard />, text: "Payments" },
    { to: "/settings", icon: <FaCog />, text: "Settings" },
    { to: profileLink, icon: <FaUser />, text: "My Profile" },
  ];

  const isNavLinkActive = (linkObject) => {
    // Special handling for dashboard, allowing it to be active for base path
    if (linkObject.to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    // Handle generic /profile route for both user types
    if (linkObject.to === '/profile' && location.pathname === '/profile') {
      return true;
    }
    // Handle the specific employer/laborers route correctly
    if (linkObject.to === '/employer/laborers' && location.pathname.startsWith('/employer/laborers')) {
      return true;
    }
    // Fallback for other direct path matches
    return location.pathname.startsWith(linkObject.to);
  };

  return (
    <>
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome, {user?.full_name || user?.company_name || 'Employer'}</h6>
        <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
      </div>
      <Nav className="flex-column flex-grow-1">
        {navLinks.map(link => (
          <Nav.Link
            key={link.to}
            as={Link}
            to={link.to}
            onClick={onLinkClick} // Close offcanvas on link click
            className={`py-2 rounded d-flex align-items-center mb-2 ${isNavLinkActive(link) ? 'bg-primary text-white fw-bold' : 'text-dark'}`}
            style={{ width: '100%' }} // Ensure it matches laborer sidebar width style
          >
            <span className="me-3" style={{ fontSize: '1.2rem' }}>{link.icon}</span> {link.text}
          </Nav.Link>
        ))}
      </Nav>
    </>
  );
}

export default EmployerSidebar;