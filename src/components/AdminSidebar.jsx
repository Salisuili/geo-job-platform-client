// src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog, FaBuilding, FaUserTie } from 'react-icons/fa'; // Added FaBuilding for employers, FaUserTie for laborers if desired, or stick to FaUsers
import { useAuth } from '../contexts/AuthContext';

function AdminSidebar({ onLinkClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/admin/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/admin/employers", icon: <FaBuilding />, text: "Employers" }, // <--- UPDATED THIS LINE
    { to: "/admin/laborers", icon: <FaUserTie />, text: "Laborers" },   // <--- UPDATED THIS LINE (or FaUsers)
    { to: "/admin/job-listings", icon: <FaBriefcase />, text: "Job Listings" }, // Renamed from "Jobs" for clarity if AdminJobListings is the target
    { to: "/admin/reports", icon: <FaChartBar />, text: "Reports" },
    { to: "/admin/settings", icon: <FaCog />, text: "Settings" },
  ];

  const isNavLinkActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }
    // Special handling for the new specific admin paths
    if (path === "/admin/employers" && location.pathname.startsWith("/admin/employers")) {
        return true;
    }
    if (path === "/admin/laborers" && location.pathname.startsWith("/admin/laborers")) {
        return true;
    }
    if (path === "/admin/job-listings" && location.pathname.startsWith("/admin/job-listings")) {
        return true;
    }
    // For other generic admin paths
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    if (onLinkClick) onLinkClick();
  };

  return (
    <div className="d-flex flex-column h-100">
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div className="d-flex mb-4">
          <img
            src={process.env.PUBLIC_URL + '/work_connect2.png'}
            alt="WorkConnect Logo"
            style={{ width: '180px', height: 'auto' }}
          />
        </div>

        <div className="mb-4">
          <h6 className="fw-bold mb-0">Welcome, {user?.full_name || user?.username || 'Admin'}</h6> {/* Added username fallback */}
          <small className="text-muted">{user?.user_type === 'admin' ? 'Admin' : 'User'}</small>
        </div>

        <Nav className="flex-column mb-3">
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

      <div className="mt-auto p-3 bg-white border-top">
        <Button
          variant="outline-danger"
          className="w-100 d-flex align-items-center justify-content-center"
          onClick={handleLogout}
        >
          <FaSignOutAlt className="me-2" /> Logout
        </Button>
      </div>
    </div>
  );
}

export default AdminSidebar;