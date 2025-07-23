// src/pages/AppliedJobs.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import LaborerDashboardLayout from '../layouts/LaborerDashboardLayout'; // Assuming this layout exists
import 'bootstrap/dist/css/bootstrap.min.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_JOB_IMAGE_PATH = '/uploads/job_images/geo_job_default.jpg'; // Corrected path for default image

function AppliedJobs() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();

  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyApplications = async () => {
      if (authLoading || !isAuthenticated) {
        if (!authLoading && !isAuthenticated) {
          console.warn("Unauthorized access attempt to MyApplications. Redirecting.");
          navigate('/login');
        }
        setLoadingApplications(false);
        return;
      }

      if (user?.user_type !== 'laborer') {
        console.warn("Forbidden access attempt to MyApplications by non-laborer. Redirecting.");
        navigate('/laborer/dashboard');
        setLoadingApplications(false);
        return;
      }

      setLoadingApplications(true);
      setError(null);

      try {
        // Assuming backend endpoint /api/applications/my-applications fetches applications for the logged-in laborer
        const response = await fetch(`${API_BASE_URL}/api/applications/my-applications`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch your applications.');
        }

        setApplications(data.applications);

      } catch (err) {
        console.error("Error fetching my applications:", err);
        setError(err.message);
      } finally {
        setLoadingApplications(false);
      }
    };

    fetchMyApplications();
  }, [user, token, isAuthenticated, authLoading, navigate]);

  if (loadingApplications || authLoading) {
    return (
      <LaborerDashboardLayout>
        <Container fluid className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading applications...</span>
          </Spinner>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  if (error) {
    return (
      <LaborerDashboardLayout>
        <Container fluid className="py-5">
          <Alert variant="danger">
            <h4>Error loading your applications!</h4>
            <p>{error}</p>
            <Button onClick={() => navigate('/laborer/dashboard')}>Go to Dashboard</Button>
          </Alert>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Reviewed': return 'primary';
      case 'Interview Scheduled': return 'info';
      case 'Accepted': return 'success';
      case 'Rejected': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <LaborerDashboardLayout>
      <Container fluid className="py-4 px-3 px-md-5">
        <h3 className="mb-4 fw-bold">My Job Applications</h3>

        {applications.length === 0 ? (
          <Card className="text-center py-5 shadow-sm border-0">
            <Card.Body>
              <h5 className="text-muted">You haven't applied for any jobs yet.</h5>
              <Button variant="primary" className="mt-3" as={Link} to="/">
                Browse Jobs
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {applications.map((application) => (
              <Col key={application._id}>
                <Card className="shadow-sm border-0 h-100 d-flex flex-column">
                  {application.job_id ? (
                    <>
                      <Card.Img
                        variant="top"
                        src={application.job_id.image_url ? `${API_BASE_URL}${application.job_id.image_url.startsWith('/uploads/') ? application.job_id.image_url : `/uploads/job_images/${application.job_id.image_url}`}` : `${API_BASE_URL}${DEFAULT_JOB_IMAGE_PATH}`}
                        alt={application.job_id.title}
                        style={{ height: '180px', objectFit: 'cover' }}
                      />
                      <Card.Body className="flex-grow-1 d-flex flex-column">
                        <Card.Title className="mb-1">{application.job_id.title}</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted small">
                          {application.job_id.company_name || 'Employer'}
                        </Card.Subtitle>
                        <Card.Text className="text-muted small mb-2">
                            {application.job_id.job_type} | {application.job_id.city}
                        </Card.Text>
                        <Card.Text className="fw-bold mb-3">
                            {application.job_id.pay_type}: N{application.job_id.pay_rate_min} - N{application.job_id.pay_rate_max}
                        </Card.Text>

                        <div className="mt-auto pt-3 border-top">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <Badge bg={getStatusVariant(application.status)} className="p-2">
                              Status: {application.status}
                            </Badge>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              as={Link}
                              to={`/jobs/${application.job_id._id}`}
                            >
                              View Job
                            </Button>
                          </div>
                          <p className="text-muted small mb-0">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
                        </div>
                      </Card.Body>
                    </>
                  ) : (
                    <Card.Body className="text-center d-flex flex-column justify-content-center">
                        <Alert variant="secondary">Job details no longer available for this application.</Alert>
                        <p className="text-muted small">Applied on: {new Date(application.createdAt).toLocaleDateString()}</p>
                        <Badge bg={getStatusVariant(application.status)} className="p-2 mt-2">
                            Status: {application.status}
                        </Badge>
                    </Card.Body>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </LaborerDashboardLayout>
  );
}

export default AppliedJobs;