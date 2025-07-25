// src/pages/EmployerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaBriefcase, FaUsers, FaChartLine } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function EmployerDashboard() {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [jobCount, setJobCount] = useState(0);
  const [totalApplicantsCount, setTotalApplicantsCount] = useState(0);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);
  const [errorDashboardData, setErrorDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading || !isAuthenticated || !token) {
        if (!authLoading && !isAuthenticated) {
          logout();
          navigate('/login');
        }
        setLoadingDashboardData(false);
        return;
      }

      setLoadingDashboardData(true);
      setErrorDashboardData(null);

      try {
        const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          setErrorDashboardData("Access denied: You don't have permission to view this data.");
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch dashboard data: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();

        setJobCount(data.length);

        const calculatedTotalApplicants = data.reduce((sum, job) => sum + (job.applicants_count || 0), 0);
        setTotalApplicantsCount(calculatedTotalApplicants);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setErrorDashboardData(err.message);
      } finally {
        setLoadingDashboardData(false);
      }
    };

    fetchDashboardData();
  }, [user, token, isAuthenticated, authLoading, navigate, logout]);

  if (authLoading || loadingDashboardData) {
    return (
      <Container fluid className="py-4 px-5 text-center flex-grow-1">
        <Spinner animation="border" role="status" className="mt-5">
          <span className="visually-hidden">Loading Dashboard...</span>
        </Spinner>
        <p className="mt-2">Loading dashboard data...</p>
      </Container>
    );
  }

  if (errorDashboardData) {
    return (
      <Container fluid className="py-4 px-5 flex-grow-1">
        <Alert variant="danger" className="mt-5">
          <Alert.Heading>Error loading dashboard!</Alert.Heading>
          <p>{errorDashboardData}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-5 flex-grow-1">
      <h3 className="mb-4 fw-bold">Employer Dashboard</h3>
      <Row className="mb-4">
        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaBriefcase size={30} className="text-primary me-3" />
                <h5 className="card-title mb-0">Posted Jobs</h5>
              </div>
              <>
                <p className="card-text fs-2 fw-bold text-dark">{jobCount}</p>
                <p className="card-text text-muted">Total jobs you have posted.</p>
                <Link to="/my-jobs" className="btn btn-sm btn-outline-primary mt-2">
                  View All Jobs
                </Link>
              </>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaUsers size={30} className="text-info me-3" />
                <h5 className="card-title mb-0">Total Applicants</h5>
              </div>
              <p className="card-text fs-2 fw-bold text-dark">{totalApplicantsCount}</p>
              <p className="card-text text-muted">Across all your jobs.</p>
              <Button
                variant="outline-info"
                size="sm"
                className="mt-2"
                onClick={() => navigate('/employer/all-applicants')}
              >
                Manage Applicants
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={4} className="mb-4">
          <Card className="shadow-sm border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <FaChartLine size={30} className="text-success me-3" />
                <h5 className="card-title mb-0">Metrics</h5>
              </div>
              <p className="card-text fs-2 fw-bold text-dark">YY%</p>
              <p className="card-text text-muted">Job fill rate this month.</p>
              <Button variant="outline-success" size="sm" className="mt-2" disabled>
                View Reports
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EmployerDashboard;
