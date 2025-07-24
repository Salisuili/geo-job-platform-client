import React, { useState } from 'react';
import { Container, Row, Col, Offcanvas, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import LaborerSidebar from '../components/LaborerSidebar';

function LaborerDashboardLayout({ children }) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <Container className="text-center my-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading User...</span>
                </Spinner>
            </Container>
        );
    }

    if (!user || user.user_type !== 'laborer') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Desktop Sidebar */}
            <div className="d-none d-md-flex flex-column bg-white" style={{ width: '250px', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
                <LaborerSidebar />
                <div className="p-3 border-top">
                    <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>

            {/* Mobile Offcanvas */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} placement="start">
                <Offcanvas.Header closeButton className="bg-primary text-white">
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="p-0 d-flex flex-column">
                    <LaborerSidebar onLinkClick={handleCloseOffcanvas} />
                    <div className="p-3 border-top">
                        <Button variant="outline-danger" className="w-100" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <Container fluid className="p-0 flex-grow-1 d-flex flex-column">
                <Row className="bg-white shadow-sm p-3 align-items-center">
                    <Col xs="auto" className="d-md-none">
                        <Button variant="outline-primary" onClick={handleShowOffcanvas}>
                            ☰ Menu
                        </Button>
                    </Col>
                    <Col>
                        <h4 className="m-0">Welcome, {user?.full_name || 'Laborer'}!</h4>
                    </Col>
                    <Col xs="auto" className="d-none d-md-block">
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Col>
                </Row>
                <Row className="flex-grow-1 p-3">
                    <Col>
                        {children}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default LaborerDashboardLayout;