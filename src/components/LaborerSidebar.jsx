import React from 'react';
import { Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed

function LaborerSidebar({ onLinkClick }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/find-work', label: 'Find Work' },
        { to: '/my-applications', label: 'My Applications' },
        { to: '/messages', label: 'Messages' },
        { to: '/notifications', label: 'Notifications' },
        { to: '/profile', label: 'My Profile' },
        // Add more laborer-specific links here
    ];

    // Function to check if a link is active, handling nested paths
    const isActiveLink = (path) => {
        // Special handling for dashboard, which might be the root of the laborer section
        if (path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/')) {
            return true;
        }
        // General check for direct match or if it's a parent of the current path
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    return (
        <Nav className="flex-column flex-grow-1"> {/* flex-grow-1 ensures nav takes available space */}
            {user && ( // Display welcome message only if user is logged in
                <div className="mb-4 text-center">
                    <h6 className="fw-bold mb-0">Welcome, {user?.full_name || 'Laborer'}</h6>
                    <small className="text-muted">Laborer</small>
                </div>
            )}
            {navLinks.map(link => (
                <Nav.Link
                    key={link.to}
                    as={Link}
                    to={link.to}
                    onClick={onLinkClick} // Close offcanvas on link click
                    className={`text-white py-2 ${isActiveLink(link.to) ? 'bg-primary rounded' : 'hover-bg-secondary'}`}
                    style={{ '--bs-bg-opacity': '.25' }} // For hover effect on secondary background
                >
                    {link.label}
                </Nav.Link>
            ))}
        </Nav>
    );
}

export default LaborerSidebar;