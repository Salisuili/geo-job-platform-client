import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaSignOutAlt, FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext'; // To handle logout

// Define the base width for the sidebar
const SIDEBAR_WIDTH = '280px'; // Adjust this width as needed to match your design

function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { to: "/admin/dashboard", icon: <FaHome />, text: "Dashboard" },
    { to: "/admin/users", icon: <FaUsers />, text: "Users" },
    { to: "/admin/jobs", icon: <FaBriefcase />, text: "Jobs" },
    { to: "/admin/reports", icon: <FaChartBar />, text: "Reports" }, // Example path
    { to: "/admin/settings", icon: <FaCog />, text: "Settings" },   // Example path
  ];

  const handleLogout = () => {
    logout(); // AuthContext's logout should handle navigation to /login
  };

  return (
    <div style={{
      width: SIDEBAR_WIDTH,
      backgroundColor: '#fff', // White background as per image
      borderRight: '1px solid #e0e0e0', // Subtle border
      padding: '20px', // Some padding
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Push logout to bottom
      minHeight: '100vh', // Ensure it takes full viewport height
      boxShadow: '2px 0 5px rgba(0,0,0,0.05)', // Subtle shadow
      position: 'sticky', // Makes it sticky at the top
      top: 0,
      left: 0,
      zIndex: 1000 // Ensure it's above other content
    }}>
      {/* Top Section: Logo/Brand */}
      <div className="mb-5">
        <h4 className="fw-bold text-dark text-center">Local Labor</h4>
        {/* You can replace this with an actual logo image if you have one */}
      </div>

      {/* Navigation Links */}
      <Nav className="flex-column mb-auto"> {/* mb-auto pushes remaining content to bottom */}
        {navLinks.map((link) => (
          <Nav.Link
            key={link.to}
            as={Link}
            to={link.to}
            className={`py-2 px-3 rounded d-flex align-items-center ${location.pathname === link.to ? 'bg-primary text-white fw-bold' : 'text-dark'}`}
            style={location.pathname === link.to ? {backgroundColor: '#007bff'} : {}} // Primary color for active
          >
            <span className="me-3" style={{ fontSize: '1.2rem' }}>{link.icon}</span>{link.text}
          </Nav.Link>
        ))}
      </Nav>

      {/* Logout Button */}
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