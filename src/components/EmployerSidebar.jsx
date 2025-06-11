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
    if (path === '/laborers' && location.pathname.startsWith('/laborers/')) {
      return true;
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout(); 
    handleClose(); 
  };

  return (
    <>
      <div className="mb-4">
        <h6 className="fw-bold mb-0">Welcome</h6>
        <small className="text-muted">{user?.user_type === 'employer' ? 'Employer' : 'User'}</small>
      </div>
      <Nav className="flex-column flex-grow-1"> 
        {navLinks.map(link => (
          <Nav.Link
            key={link.to}
            as={Link}
            to={link.to}
            onClick={handleClose} 
            className={`py-2 d-flex align-items-center ${isNavLinkActive(link.to) ? 'text-primary fw-bold' : 'text-dark'}`}
            style={{ borderRadius: '0.375rem', backgroundColor: isNavLinkActive(link.to) ? '#e9ecef' : 'transparent' }}
          >
            <span className="me-2">{link.icon}</span> {link.text}
          </Nav.Link>
        ))}
      </Nav>
      <Nav.Link
        onClick={handleLogout}
        className="text-danger py-2 d-flex align-items-center mt-auto" // mt-auto pushes it to the bottom
        style={{ borderRadius: '0.375rem', cursor: 'pointer' }}
      >
        <FaSignOutAlt className="me-2" /> Logout
      </Nav.Link>
    </>
  );
}

export default EmployerSidebar;