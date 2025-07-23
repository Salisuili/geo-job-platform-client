import React, { useState } from 'react';
import { Container, Row, Col, Offcanvas, Button, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { useNavigate, Navigate } from 'react-router-dom'; // CORRECTED: Added Navigate here
import LaborerSidebar from '../components/LaborerSidebar'; // Adjust path as needed

function LaborerDashboardLayout({ children }) {
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const { user, loading, logout } = useAuth(); // Assuming useAuth provides user object and logout
    const navigate = useNavigate();

    const handleCloseOffcanvas = () => setShowOffcanvas(false);
    const handleShowOffcanvas = () => setShowOffcanvas(true);

    const handleLogout = async () => {
        try {
            await logout(); // Call the logout function from AuthContext
            navigate('/login'); // Redirect to login page after logout
        } catch (error) {
            console.error('Logout failed:', error);
            // Optionally show an error message to the user
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

    // This Navigate is used to redirect if the user is not a laborer.
    // While PrivateRoute handles most cases, this is an additional safeguard
    // if the component is somehow rendered directly without proper role.
    if (!user || user.user_type !== 'laborer') {
        return <Navigate to="/login" replace />;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
            {/* Sidebar for larger screens */}
            <div className="d-none d-md-block bg-dark text-white p-3" style={{ width: '250px', flexShrink: 0 }}>
                <LaborerSidebar />
            </div>

            {/* Offcanvas for smaller screens */}
            <Offcanvas show={showOffcanvas} onHide={handleCloseOffcanvas} responsive="md" className="bg-dark text-white">
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>Laborer Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex flex-column">
                    <LaborerSidebar onLinkClick={handleCloseOffcanvas} />
                    <div className="mt-auto p-3"> {/* Push logout to bottom */}
                        <Button variant="outline-light" className="w-100" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content Area */}
            <Container fluid className="p-0 flex-grow-1 d-flex flex-column">
                <Row className="bg-white shadow-sm p-3 mb-3 align-items-center">
                    <Col xs="auto" className="d-md-none">
                        <Button variant="outline-dark" onClick={handleShowOffcanvas}>
                            ☰ Menu
                        </Button>
                    </Col>
                    <Col>
                        <h4 className="m-0">Welcome, {user?.full_name || 'Laborer'}!</h4>
                    </Col>
                    <Col xs="auto" className="d-none d-md-block"> {/* Logout button for larger screens */}
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