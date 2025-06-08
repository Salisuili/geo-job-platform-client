import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import EmployerDashboardLayout from '../components/EmployerDashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function LaborerList() {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [laborers, setLaborers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLaborers = async () => {
      if (authLoading || !isAuthenticated || !token) {
        console.log("LaborerList: Authentication state not ready or token missing. Skipping fetch.", { authLoading, isAuthenticated, token });
        if (!authLoading && !isAuthenticated) {
            logout();
            navigate('/login');
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // *** IMPORTANT CHANGE: Using /api/users based on your controller ***
        const response = await fetch(`${API_BASE_URL}/api/users`, { // Endpoint for all users
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401 || response.status === 403) {
          console.error("LaborerList: Unauthorized or Forbidden access. Logging out.");
          // *** WARNING: If the logged-in user is an 'employer' and not an 'admin',
          // this route will likely return 401/403 based on your userController.
          // You might need a backend route specifically for employers to browse laborers. ***
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        // *** IMPORTANT CHANGE: Filter data on the frontend to show only laborers ***
        const filteredLaborers = data.filter(user => user.user_type === 'laborer');
        setLaborers(filteredLaborers);
      } catch (err) {
        console.error("Failed to fetch laborers:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLaborers();
  }, [user, token, isAuthenticated, authLoading, navigate, logout]);

  // --- Conditional Rendering ---
  if (authLoading || loading) {
    return (
      <EmployerDashboardLayout>
        <Container fluid className="py-4 px-5 text-center flex-grow-1">
          <Spinner animation="border" role="status" className="mt-5">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading laborers...</p>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  if (error) {
    return (
      <EmployerDashboardLayout>
        <Container fluid className="py-4 px-5 flex-grow-1">
          <Alert variant="danger" className="mt-5">
            <Alert.Heading>Error loading laborers!</Alert.Heading>
            <p>{error}</p>
            <hr />
            <p className="mb-0">Please try again later or contact support. Remember, this page might require admin access depending on backend routing.</p>
          </Alert>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  if (laborers.length === 0) {
    return (
      <EmployerDashboardLayout>
        <Container fluid className="py-4 px-5 flex-grow-1">
          <h3 className="mb-4 fw-bold">Browse Laborers</h3>
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">No laborers found at the moment.</h5>
              <p>Check back later or adjust your search criteria.</p>
              <Button variant="outline-primary" onClick={() => navigate('/employer/dashboard')}>
                Go to Dashboard
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  return (
    <EmployerDashboardLayout>
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Browse Laborers</h3>
        <Row>
          {laborers.map(laborer => (
            <Col key={laborer._id} sm={6} md={4} lg={3} className="mb-4"> {/* Using laborer._id as key */}
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="d-flex flex-column align-items-center text-center">
                  <img
                    src={laborer.profile_picture_url || 'https://via.placeholder.com/80'} // Use profile_picture_url from backend
                    alt={laborer.full_name} // Use full_name for alt text
                    className="rounded-circle mb-3"
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  />
                  <h5 className="mb-1">{laborer.full_name || laborer.username}</h5> {/* Display full_name first, then username */}
                  <p className="text-muted mb-1">{laborer.bio || laborer.skills?.join(', ') || 'N/A'}</p> {/* Show bio or skills */}
                  <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>{laborer.location?.address_text || 'Location N/A'}</p> {/* Assuming location is an object or add a proper field */}
                  <p className="text-warning mb-3">
                    <FaStar /> {laborer.overallRating ? laborer.overallRating.toFixed(1) : 'No Ratings'}
                  </p>
                  <Button
                    variant="primary"
                    as={Link}
                    to={`/laborers/${laborer._id}/ratings`} // Link to laborer's profile using _id
                    className="mt-auto"
                  >
                    View Profile & Ratings
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </EmployerDashboardLayout>
  );
}

export default LaborerList;