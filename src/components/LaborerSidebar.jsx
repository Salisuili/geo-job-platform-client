import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaHome, FaFileAlt, FaUser } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function LaborerSidebar({ onLinkClick }) {
  const { user } = useAuth();
  const location = useLocation();

  const profileLink = user ? `/laborers/${user._id}` : '/profile';

  const navLinks = [
    { to: '/dashboard', icon: <FaHome />, text: 'Dashboard' },
    { to: '/my-applications', icon: <FaFileAlt />, text: 'My Applications' },
    { to: profileLink, icon: <FaUser />, text: 'My Profile' },
  ];

  const isNavLinkActive = (linkObject) => {
    if (linkObject.to === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    if (linkObject.to.startsWith('/laborers/') && user?._id) {
        return location.pathname === `/laborers/${user._id}`;
    }
    return location.pathname.startsWith(linkObject.to);
  };

  return (
    <div className="d-flex flex-column h-100 p-3" style={{ width: '250px' }}>
      <div style={{ overflowY: 'auto', flex: 1 }}>
        <div className="d-flex mb-4">
          <Link to="/" onClick={onLinkClick} style={{ textDecoration: 'none' }}>
            <img
              src={process.env.PUBLIC_URL + '/work_connect2.png'}
              alt="WorkConnect Logo"
              style={{ width: '180px', height: 'auto' }}
            />
          </Link>
        </div>

        <div className="mb-4">
          <h6 className="fw-bold mb-0 text-truncate">Welcome</h6>
          <small className="text-muted text-truncate">{user?.full_name || 'Laborer'}</small>
        </div>

        <Nav className="flex-column mb-3">
          {navLinks.map((link) => (
            <div key={link.to} className="nav-item-wrapper">
              <Nav.Link
                as={Link}
                to={link.to}
                onClick={onLinkClick}
                className={`py-2 rounded d-flex align-items-center mb-2 ${
                  isNavLinkActive(link) ? 'bg-primary text-white fw-bold' : 'text-dark'
                }`}
                style={{ width: '100%' }}
              >
                <span className="me-3" style={{ fontSize: '1.2rem' }}>{link.icon}</span>
                {link.text}
              </Nav.Link>
            </div>
          ))}
        </Nav>
      </div>
    </div>
  );
}

export default LaborerSidebar;