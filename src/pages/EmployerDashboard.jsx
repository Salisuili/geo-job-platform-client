import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import { FaBriefcase, FaUsers, FaChartLine } from 'react-icons/fa'; 
import { Link, useNavigate } from 'react-router-dom'; 
import EmployerDashboardLayout from '../components/EmployerDashboardLayout';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function EmployerDashboard() {
  const { user, token, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [jobCount, setJobCount] = useState(0);
  const [loadingJobCount, setLoadingJobCount] = useState(true);
  const [errorJobCount, setErrorJobCount] = useState(null);

  useEffect(() => {
    const fetchJobsCount = async () => {
      if (authLoading || !isAuthenticated || !token) {
        if (!authLoading && !isAuthenticated) {
          logout(); // Clear any stale auth data
          navigate('/login');
        }
        setLoadingJobCount(false); // Stop loading if we're not fetching
        return;
      }

      setLoadingJobCount(true);
      setErrorJobCount(null);

      try {
        // Use the same endpoint as in your EmployerJobs.js
        const response = await fetch(`${API_BASE_URL}/api/jobs/my-jobs`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401 || response.status === 403) {
          setErrorJobCount("Access denied: You don't have permission to view job data.");
          logout(); // Log out on unauthorized access
          navigate('/login');
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch job count: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        // The backend `getEmployerJobs` returns an array of jobs. We just need its length.
        setJobCount(data.length);
      } catch (err) {
        console.error("Error fetching job count:", err);
        setErrorJobCount(err.message);
      } finally {
        setLoadingJobCount(false);
      }
    };

    fetchJobsCount();
  }, [user, token, isAuthenticated, authLoading, navigate, logout]); // Depend on auth state changes

  return (
    <EmployerDashboardLayout>
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Employer Dashboard</h3>
        <Row className="mb-4">
          {/* Card for Posted Jobs Count */}
          <Col md={6} lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaBriefcase size={30} className="text-primary me-3" />
                  <h5 className="card-title mb-0">Posted Jobs</h5>
                </div>
                {loadingJobCount ? (
                  <div className="text-center">
                    <Spinner animation="border" size="sm" />
                    <p className="mb-0 mt-2">Loading...</p>
                  </div>
                ) : errorJobCount ? (
                  <Alert variant="danger" className="py-2 px-3 m-0">
                    <small>Error: {errorJobCount}</small>
                  </Alert>
                ) : (
                  <>
                    <p className="card-text fs-2 fw-bold text-dark">{jobCount}</p>
                    <p className="card-text text-muted">Total jobs you have posted.</p>
                    {/* Link to the EmployerJobs.js page */}
                    <Link to="/my-jobs" className="btn btn-sm btn-outline-primary mt-2">
                      View All Jobs
                    
                    </Link>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Example Card 2: Total Applicants (Placeholder - requires new API endpoint) */}
          <Col md={6} lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaUsers size={30} className="text-info me-3" />
                  <h5 className="card-title mb-0">Total Applicants</h5>
                </div>
                <p className="card-text fs-2 fw-bold text-dark">XX</p> {/* Placeholder */}
                <p className="card-text text-muted">Across all your jobs.</p>
                <Button variant="outline-info" size="sm" className="mt-2" disabled>
                  Manage Applicants
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Example Card 3: Performance Metrics (Placeholder) */}
          <Col md={6} lg={4} className="mb-4">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <div className="d-flex align-items-center mb-3">
                  <FaChartLine size={30} className="text-success me-3" />
                  <h5 className="card-title mb-0">Metrics</h5>
                </div>
                <p className="card-text fs-2 fw-bold text-dark">YY%</p> {/* Placeholder */}
                <p className="card-text text-muted">Job fill rate this month.</p>
                <Button variant="outline-success" size="sm" className="mt-2" disabled>
                  View Reports
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </EmployerDashboardLayout>
  );
}

export default EmployerDashboard;