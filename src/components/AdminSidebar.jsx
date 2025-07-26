// src/components/AdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Button } from 'react-bootstrap';
import { FaHome, FaUsers, FaBriefcase, FaBuilding, FaUserCircle, FaSignOutAlt } from 'react-icons/fa'; // Adjusted icons
import { useAuth } from '../contexts/AuthContext';

function AdminSidebar({ onLinkClick }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navLinks = [
        { to: "/admin/dashboard", icon: <FaHome />, text: "Dashboard" },
        { to: "/admin/employers", icon: <FaBuilding />, text: "Employers" },
        { to: "/admin/laborers", icon: <FaUsers />, text: "Laborers" },
        { to: "/admin/job-listings", icon: <FaBriefcase />, text: "Job Listings" },
        { to: "/admin/profile", icon: <FaUserCircle />, text: "My Profile" }, // Direct link to admin's own profile
    ];

    const isNavLinkActive = (linkPath) => {
        // Special handling for dashboard, which might be the exact path
        if (linkPath === "/admin/dashboard") {
            return location.pathname === linkPath;
        }
        // For other links, check if the current path starts with the link path
        return location.pathname.startsWith(linkPath);
    };

    const handleLogout = () => {
        logout();
        if (onLinkClick) onLinkClick(); // Close offcanvas on logout for mobile
    };

    return (
        <div className="d-flex flex-column h-100 p-3">
            {/* Logo and Brand */}
            <div className="d-flex mb-4">
                <Link to="/" onClick={onLinkClick} style={{ textDecoration: 'none' }}>
                    <img
                        src={process.env.PUBLIC_URL + '/work_connect2.png'}
                        alt="WorkConnect Logo"
                        style={{ width: '180px', height: 'auto' }}
                    />
                </Link>
            </div>

            {/* Welcome Message */}
            <div className="mb-4">
                <h6 className="fw-bold mb-0">Welcome, {user?.full_name || user?.username || 'Admin'}</h6>
                <small className="text-muted">{user?.user_type === 'admin' ? 'Admin' : 'User'}</small>
            </div>

            {/* Navigation Links */}
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

            {/* Logout Button (at the bottom) */}
            <div className="mt-auto p-3 border-top">
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
