// src/pages/LaborerList.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
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
        console.log("LaborerList: Authentication state not ready or token missing. Skipping fetch.");
        if (!authLoading && !isAuthenticated) {
            console.log("LaborerList: Auth loading finished and not authenticated. Redirecting to login.");
            logout();
            navigate('/login');
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log(`Attempting to fetch laborers from: ${API_BASE_URL}/api/users/laborers`);
        const response = await fetch(`${API_BASE_URL}/api/users/laborers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("API Response Status for /api/users/laborers:", response.status);

        if (response.status === 401 || response.status === 403) {
          console.error("LaborerList: Unauthorized or Forbidden access to /api/users/laborers. Check backend access roles.");
          setError("Access denied: You don't have permission to view this content.");
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorDetails = await response.text();
          console.error(`HTTP error! Status: ${response.status}. Details: ${errorDetails}`);
          throw new Error(`Failed to fetch laborers: ${response.status} - ${errorDetails || response.statusText}`);
        }

        const data = await response.json();
        console.log("Raw data received from /api/users/laborers:", data);

        setLaborers(data);

      } catch (err) {
        console.error("Failed to fetch laborers (catch block):", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLaborers();
  }, [user, token, isAuthenticated, authLoading, navigate, logout]);

  if (authLoading || loading) {
    return (
      <Container fluid className="py-4 px-5 text-center flex-grow-1">
        <Spinner animation="border" role="status" className="mt-5">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading laborers...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4 px-5 flex-grow-1">
        <Alert variant="danger" className="mt-5">
          <Alert.Heading>Error loading laborers!</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Please try again later or contact support.</p>
        </Alert>
      </Container>
    );
  }

  if (laborers.length === 0) {
    return (
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Browse Laborers</h3>
        <Card className="text-center py-5 shadow-sm border-0">
          <Card.Body>
            <h5 className="text-muted">No laborers found at the moment.</h5>
            <p>This could be because no laborers are registered, or due to an access issue. Check console for errors.</p>
            <Button variant="outline-primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-5 flex-grow-1">
      <h3 className="mb-4 fw-bold">Browse Laborers</h3>
      <Row>
        {laborers.map(laborer => (
          <Col key={laborer._id} sm={6} md={4} lg={3} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body className="d-flex flex-column align-items-center text-center">
                <img
                  // Corrected image source logic:
                  // If profile_picture_url exists and is a relative path (doesn't start with http), prepend API_BASE_URL.
                  // Otherwise, use profile_picture_url directly (which could be an absolute URL or null/undefined).
                  // Fallback to a placeholder if profile_picture_url is null/undefined.
                  src={
                    laborer.profile_picture_url && !laborer.profile_picture_url.startsWith('http')
                      ? `${API_BASE_URL}${laborer.profile_picture_url}`
                      : laborer.profile_picture_url || 'https://via.placeholder.com/80' // Fallback if no URL
                  }
                  alt={laborer.full_name || laborer.username || 'Laborer'}
                  className="rounded-circle mb-3"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <h5 className="mb-1">{laborer.full_name || laborer.username}</h5>
                <p className="text-muted mb-1">{laborer.bio || laborer.skills?.join(', ') || 'N/A'}</p>
                <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                  {laborer.current_location && laborer.current_location.coordinates
                      ? `Lat: ${laborer.current_location.coordinates[1].toFixed(2)}, Lng: ${laborer.current_location.coordinates[0].toFixed(2)}`
                      : 'Location N/A'}
                </p>
                <p className="text-warning mb-3">
                  <FaStar /> {laborer.overallRating ? laborer.overallRating.toFixed(1) : 'No Ratings'}
                </p>
                <Button
                  variant="primary"
                  as={Link}
                  to={`/laborers/${laborer._id}`}
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
  );
}

export default LaborerList;
