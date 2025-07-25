// src/layouts/EmployerDashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Offcanvas, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate, useLocation } from 'react-router-dom';

import EmployerSidebar from '../components/EmployerSidebar';

function EmployerDashboardLayout({ children }) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally, show an error message to the user
        }
    };

    // Close offcanvas when route changes
    useEffect(() => {
        handleCloseOffcanvas();
    }, [location.pathname]);

    // Show loading spinner while authentication is in progress
    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading User...</span>
                </Spinner>
            </Container>
        );
    }

    // Redirect if user is not authenticated or not an employer
    if (!user || user.user_type !== 'employer') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Desktop Sidebar */}
            <div
                className="d-none d-md-flex flex-column bg-white"
                style={{
                    width: '300px', 
                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
                }}
            >
                <EmployerSidebar onLinkClick={handleCloseOffcanvas} />
                <div className="p-3 border-top">
                    <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>

            {/* Mobile Offcanvas (Sidebar) */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start">
                <Offcanvas.Header closeButton className="bg-primary text-white">
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0 d-flex flex-column">
                    <EmployerSidebar onLinkClick={handleCloseOffcanvas} />
                    {/* Logout button inside mobile offcanvas */}
                    <div className="p-3 border-top">
                        <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <Container fluid className="p-0 flex-grow-1 d-flex flex-column">
                {/* Top Bar for Welcome and Logout (responsive) */}
                <Row className="bg-white shadow-sm p-3 align-items-center m-0">
                    <Col xs="auto" className="d-md-none">
                        <Button variant="outline-primary" onClick={handleShowOffcanvas}>
                            ☰ Menu
                        </Button>
                    </Col>
                    <Col>
                        <h4 className="m-0 text-truncate">Welcome, {user?.company_name || user?.full_name || 'Employer'}!</h4>
                    </Col>
                    <Col xs="auto" className="d-none d-md-block">
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Col>
                </Row>
                {/* Content area */}
                <Row className="flex-grow-1 p-3 m-0">
                    <Col>
                        {children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default EmployerDashboardLayout;