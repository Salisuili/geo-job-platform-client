import React from 'react';
import { Container, Badge, Button, Row, Col, Card, Alert } from 'react-bootstrap';
import LaborerDashboardLayout from '../layouts/LaborerDashboardLayout';
import { useAuth } from '../contexts/AuthContext';

function LaborerProfile() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <LaborerDashboardLayout>
        <Container className="py-5">
          <p>Loading profile...</p>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  if (!user || user.user_type !== 'laborer') {
    return (
      <LaborerDashboardLayout>
        <Container className="py-5">
          <Alert variant="danger">You are not authorized to view this page.</Alert>
        </Container>
      </LaborerDashboardLayout>
    );
  }

  return (
    <LaborerDashboardLayout>
      <Container fluid className="py-4 px-3 px-md-5">
        <h3 className="mb-4 fw-bold">My Laborer Profile</h3>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Row>
              <Col md={4} className="text-center">
                {user.profile_picture_url ? (
                  <img
                    src={`${process.env.REACT_APP_BACKEND_API_URL}${user.profile_picture_url}`}
                    alt="Profile"
                    className="img-fluid rounded-circle mb-3"
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                  />
                ) : (
                  <div className="bg-light rounded-circle d-flex justify-content-center align-items-center mb-3" style={{ width: '150px', height: '150px' }}>
                    <span className="text-muted fs-1">👤</span>
                  </div>
                )}
                <h4>{user.full_name}</h4>
                <p className="text-muted">{user.username}</p>
              </Col>
              <Col md={8}>
                <h5>Contact Information</h5>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone_number || 'N/A'}</p>

                <h5 className="mt-4">About Me</h5>
                <p>{user.bio || 'No bio provided yet.'}</p>

                <h5 className="mt-4">Skills</h5>
                {user.skills && user.skills.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} bg="primary">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p>No skills listed yet.</p>
                )}

                <h5 className="mt-4">Availability & Rate</h5>
                <p><strong>Available for Work:</strong> {user.is_available ? 'Yes' : 'No'}</p>
                <p><strong>Hourly Rate:</strong> N{user.hourly_rate || 'N/A'}</p>

                {/* You can add an Edit Profile button here */}
                <Button variant="primary" className="mt-3" onClick={() => alert('Edit Profile functionality coming soon!')}>
                  Edit Profile
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Container>
    </LaborerDashboardLayout>
  );
}

export default LaborerProfile;