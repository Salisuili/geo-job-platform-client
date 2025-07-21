import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function AdminSidebar({ onLinkClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/admin/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/admin/users", icon: <FaUsers />, text: "Users" },
    { to: "/admin/jobs", icon: <FaBriefcase />, text: "Jobs" },
    { to: "/admin/reports", icon: <FaChartBar />, text: "Reports" },
    { to: "/admin/settings", icon: <FaCog />, text: "Settings" },
  ];

  const isNavLinkActive = (path) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    if (onLinkClick) onLinkClick();
  };

  return (
    <div className="d-flex flex-column h-100">
      {/* Scrollable Content */}
      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Logo Block */}
        <div className="d-flex mb-4">
          <img
            src={process.env.PUBLIC_URL + '/work_connect2.png'}
            alt="WorkConnect Logo"
            style={{ width: '180px', height: 'auto' }}
          />
        </div>

        <div className="mb-4">
          <h6 className="fw-bold mb-0">Welcome</h6>
          <small className="text-muted">{user?.user_type === 'admin' ? 'Admin' : 'User'}</small>
        </div>

        {/* Navigation */}
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

      {/* Sticky Logout Button */}
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