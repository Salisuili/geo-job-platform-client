// src/pages/LaborerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaBriefcase, FaListAlt, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Make sure useAuth is imported
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function LaborerDashboard() {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth(); // 'user' is already available here!
  const navigate = useNavigate();
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [loadingApplicationsCount, setLoadingApplicationsCount] = useState(true);
  const [errorApplicationsCount, setErrorApplicationsCount] = useState(null);

  useEffect(() => {
    const fetchApplicationsCount = async () => {
      if (authLoading || !isAuthenticated || !token || user?.user_type !== 'laborer') {
        if (!authLoading && (!isAuthenticated || user?.user_type !== 'laborer')) {
          logout();
          navigate('/login');
        }
        setLoadingApplicationsCount(false);
        return;
      }

      setLoadingApplicationsCount(true);
      setErrorApplicationsCount(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/my-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          setErrorApplicationsCount("Access denied: You don't have permission to view your application data.");
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch application count: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        setApplicationsCount(data.applications.length);
      } catch (err) {
        console.error("Error fetching application count:", err);
        setErrorApplicationsCount(err.message);
      } finally {
        setLoadingApplicationsCount(false);
      }
    };

    fetchApplicationsCount();
  }, [user, token, isAuthenticated, authLoading, navigate, logout]);

  
  const profileLink = user ? `/laborers/${user._id}` : '/profile'; 

  return (
    <Container fluid className="py-4 px-5 flex-grow-1">
      <h3 className="mb-4 fw-bold">Laborer Dashboard</h3>
      <Row className="mb-4">
        {/* Card for Applied Jobs Count */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaListAlt size={30} className="text-primary me-3" />
                <h5 className="card-title mb-0">Applied Jobs</h5>
              </div>
              {loadingApplicationsCount ? (
                <div className="text-center">
                  <Spinner animation="border" size="sm" />
                  <p className="mb-0 mt-2">Loading...</p>
                </div>
              ) : errorApplicationsCount ? (
                <Alert variant="danger" className="py-2 px-3 m-0">
                  <small>Error: {errorApplicationsCount}</small>
                </Alert>
              ) : (
                <>
                  <p className="card-text fs-2 fw-bold text-dark">{applicationsCount}</p>
                  <p className="card-text text-muted">Total jobs you have applied for.</p>
                  <Link to="/my-applications" className="btn btn-sm btn-outline-primary mt-2">
                    View All Applications
                  </Link>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Card for Find Jobs */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaBriefcase size={30} className="text-success me-3" />
                <h5 className="card-title mb-0">Discover New Jobs</h5>
              </div>
              <p className="card-text fs-2 fw-bold text-dark">Explore</p>
              <p className="card-text text-muted">Find new opportunities that match your skills.</p>
              <Link to="/find-work" className="btn btn-sm btn-outline-success mt-2">
                Browse Jobs
              </Link>
            </Card.Body>
          </Card>
        </Col>

        {/* Card for Profile Management - MODIFIED LINK HERE */}
        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaUser size={30} className="text-info me-3" />
                <h5 className="card-title mb-0">My Profile</h5>
              </div>
              <p className="card-text fs-2 fw-bold text-dark">Update</p>
              <p className="card-text text-muted">Manage your personal information and skills.</p>
              <Link to={profileLink} className="btn btn-sm btn-outline-info mt-2"> {/* Use the dynamic profileLink */}
                View Profile
              </Link>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LaborerDashboard;