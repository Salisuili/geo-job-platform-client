// src/components/AdminSidebar.jsx (No changes needed, use your existing code)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function AdminSidebar({ onLinkClick }) { // Correctly receives onLinkClick prop
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/admin/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/admin/users", icon: <FaUsers />, text: "Users" },
    { to: "/admin/jobs", icon: <FaBriefcase />, text: "Jobs" },
    { to: "/admin/reports", icon: <FaChartBar />, text: "Reports" },
    { to: "/admin/settings", icon: <FaCog />, text: "Settings" },
  ];

  const handleLogout = () => {
    logout();
    if (onLinkClick) {
      onLinkClick(); // Close sidebar if onLinkClick is provided (for mobile)
    }
  };

  return (
    <div
      style={{
        width: '280px',
        backgroundColor: '#fff',
        borderRight: '1px solid #e0e0e0',
        padding: '20px',
        display: 'flex', // This flex property is fine as it applies to internal layout
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100vh', // This minHeight will apply when the sidebar is visible
        boxShadow: '2px 0 5px rgba(0,0,0,0.05)',
      }}
    >

      <div className="d-flex align-items-center gap-2 text-dark">
            <div className="me-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 48 48"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" />
              </svg>
            </div>
            <h2 className="h5 fw-bold mb-0">WorkConnect</h2>
          </div>
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome</h6>
        <small className="text-muted">{user?.user_type === 'admin' ? 'Admin' : 'User'}</small>
      </div>

      {/* Navigation */}
      <Nav className="flex-column mb-auto">
        {navLinks.map((link) => (
          <Nav.Link
            key={link.to}
            as={Link}
            to={link.to}
            onClick={onLinkClick} // Apply onLinkClick to close the sidebar on link click
            className={`py-2 px-3 rounded d-flex align-items-center ${
              location.pathname === link.to ? 'bg-primary text-white fw-bold' : 'text-dark'
            }`}
            style={location.pathname === link.to ? {backgroundColor: '#007bff'} : {}}
          >
            <span className="me-3" style={{ fontSize: '1.2rem' }}>{link.icon}</span>
            {link.text}
          </Nav.Link>
        ))}
      </Nav>

      {/* Logout */}
      <div className="mt-4">
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