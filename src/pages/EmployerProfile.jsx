import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import EmployerDashboardLayout from '../layouts/EmployerDashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function EmployerProfile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <EmployerDashboardLayout>
        <Container className="py-5">
          <p>Loading profile...</p>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  if (!user || user.user_type !== 'employer') {
    return (
      <EmployerDashboardLayout>
        <Container className="py-5">
          <Alert variant="danger">You are not authorized to view this page.</Alert>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  return (
    <EmployerDashboardLayout>
      <Container fluid className="py-4 px-3 px-md-5">
        <h3 className="mb-4 fw-bold">My Employer Profile</h3>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Row>
              <Col md={4} className="text-center">
                {user.profile_picture_url ? (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_API_URL}${user.profile_picture_url}`}
                    alt="Company Logo"
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light rounded-circle d-flex justify-content-center align-items-center mb-3" style={{ width: '150px', height: '150px' }}>
                    <span className="text-muted fs-1">🏢</span>
                  </div>
                )}
                <h4>{user.company_name || 'N/A'}</h4>
                <p className="text-muted">{user.full_name}</p>
              </Col>
              <Col md={8}>
                <h5>Contact Information</h5>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone_number || 'N/A'}</p>

                <h5 className="mt-4">Company Details</h5>
                <p><strong>About Company:</strong> {user.company_description || 'No company description provided yet.'}</p>
                <p><strong>Company Address:</strong> {user.company_address || 'N/A'}</p>

                {/* You can add an Edit Profile button here */}
                <Button variant="primary" className="mt-3" onClick={() => alert('Edit Profile functionality coming soon!')}>
                  Edit Profile
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </EmployerDashboardLayout>
  );
}

export default EmployerProfile;