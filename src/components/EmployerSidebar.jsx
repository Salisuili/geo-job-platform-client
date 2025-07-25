// src/components/EmployerSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
// Import FaClipboardList for the new Applicants link
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog, FaUser, FaClipboardList } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function EmployerSidebar({ onLinkClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/my-jobs", icon: <FaBriefcase />, text: "My Jobs" },
    // NEW: Link to a theoretical "All Applicants Overview" page
    { to: "/employer/all-applicants", icon: <FaClipboardList />, text: "Applicants" }, // <--- NEW LINK ADDED
    { to: "/employer/laborers", icon: <FaUsers />, text: "Find Laborers" },
    { to: "/payments", icon: <FaCreditCard />, text: "Payments" },
    { to: "/profile", icon: <FaUser />, text: "My Profile" },
  ];

  const isNavLinkActive = (linkPath) => {
    if (linkPath === '/dashboard') {
      return location.pathname === linkPath || location.pathname === '/';
    }
    // Handle the new 'Applicants' link's active state
    // It should be active if we are on /employer/all-applicants
    // OR if we are on a specific job's applicants page (/employer/jobs/:jobId/applicants)
    if (linkPath === '/employer/all-applicants') {
      return location.pathname.startsWith('/employer/all-applicants') ||
             location.pathname.startsWith('/employer/jobs/'); // This covers the specific JobApplicants page
    }
    // General case for other links
    return location.pathname.startsWith(linkPath);
  };

  return (
    <div className="d-flex flex-column h-100 p-3">
      {/* Logo Block */}
      <div className="d-flex mb-4">
        <Link to="/" onClick={onLinkClick} style={{ textDecoration: 'none' }}>
          <img
            src={process.env.PUBLIC_URL + '/work_connect2.png'}
            alt="WorkConnect Logo"
            style={{ width: '180px', height: 'auto' }}
          />
        </Link>
      </div>

      {/* Welcome Message Block */}
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome, {user?.company_name || user?.full_name || 'Employer'}</h6>
        <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'Admin'}</small>
      </div>

      {/* Navigation */}
      <Nav className="flex-column flex-grow-1">
        {navLinks.map((link) => (
          <Nav.Link
            key={link.to}
            as={Link}
            to={link.to}
            onClick={onLinkClick}
            className={`py-2 px-3 rounded d-flex align-items-center mb-2 ${
              isNavLinkActive(link.to) ? 'bg-primary text-white fw-bold' : 'text-dark'
            }`}
          >
            <span className="me-3" style={{ fontSize: '1.2rem' }}>{link.icon}</span>
            {link.text}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}

export default EmployerSidebar;