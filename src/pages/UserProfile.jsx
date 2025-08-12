// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { FaTrashAlt, FaArrowLeft, FaEdit } from 'react-icons/fa'; // Import FaEdit icon
import { useAuth } from '../contexts/AuthContext';
import EditProfileModal from '../components/EditProfileModal'; // Import the new modal component

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function UserProfile() {
  const { user, token, isAuthenticated, loading: authLoading, logout, refreshUser } = useAuth(); // Add refreshUser
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false); // State to control modal visibility

  const fetchUserProfile = async () => {
    if (authLoading || !isAuthenticated) {
      if (!authLoading && !isAuthenticated) {
        console.warn("Unauthorized access attempt to UserProfile. Redirecting.");
        navigate('/login');
      }
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile.');
      }

      setProfileData(data);

    } catch (err) {
      console.error("Error fetching user profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [user, token, isAuthenticated, authLoading, navigate, logout]); // Re-fetch when user/token/auth status changes

  const handleEditSuccess = () => {
    setShowEditModal(false); // Close modal on successful edit
    refreshUser(); // Refresh user context to get latest data
    fetchUserProfile(); // Re-fetch profile data to update the display
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
          method: 'DELETE', // Assuming you have a DELETE route on the backend
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete account.');
        }

        alert("Account deleted successfully.");
        logout(); // Log out the user after deletion
        navigate('/login'); // Redirect to login page

      } catch (err) {
        console.error("Error deleting account:", err);
        setError(err.message);
        alert(`Error deleting account: ${err.message}`);
      }
    }
  };

  if (loading) {
    return (
      <Container fluid className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading profile...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-5">
        <Alert variant="danger">
          <h4>Error loading your profile!</h4>
          <p>{error}</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </Alert>
      </Container>
    );
  }

  if (!profileData) {
    return (
      <Container fluid className="py-5">
        <Alert variant="info">No profile data found.</Alert>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </Container>
    );
  }

  // Determine profile picture URL
  const profilePicture = profileData.profile_picture_url
    ? `${API_BASE_URL}${profileData.profile_picture_url.startsWith('/uploads/') ? profileData.profile_picture_url : `/uploads/profile_pictures/${profileData.profile_picture_url.split('/').pop()}`}`
    : `https://via.placeholder.com/40x40?text=${profileData.full_name ? profileData.full_name.charAt(0) : 'U'}`;


  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <div className="d-flex align-items-center justify-content-between mb-4"> {/* Added justify-content-between */}
            <Button
              variant="link"
              onClick={() => navigate(-1)}
              className="me-3 p-0"
            >
              <FaArrowLeft size={20} />
            </Button>
            <h3 className="mb-0 fw-bold">Account</h3>
            <Button
              variant="primary"
              onClick={() => setShowEditModal(true)} // Open the edit modal
              className="d-flex align-items-center ms-auto" // Pushes button to the right
            >
              <FaEdit className="me-2" />
              Edit Profile
            </Button>
          </div>

          {/* Profile Information Section */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Profile</h5>
              <Row className="mb-3 align-items-center">
                <Col sm={3} className="text-muted">Profile Picture</Col>
                <Col sm={9}>
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="rounded-circle"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                  />
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Username</Col>
                <Col sm={9}>{profileData.username || 'N/A'}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Full Name</Col>
                <Col sm={9}>{profileData.full_name || 'N/A'}</Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Email</Col>
                <Col sm={9}>
                  <a href={`mailto:${profileData.email}`} className="text-decoration-none">
                    {profileData.email || 'N/A'}
                  </a>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Phone</Col>
                <Col sm={9}>{profileData.phone_number || 'N/A'}</Col>
              </Row>

              {/* Laborer-specific fields */}
              {profileData.user_type === 'laborer' && (
                <>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Bio</Col>
                    <Col sm={9}>{profileData.bio || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Hourly Rate</Col>
                    <Col sm={9}>{profileData.hourly_rate ? `₦${profileData.hourly_rate.toLocaleString()}` : 'N/A'}</Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Availability</Col>
                    <Col sm={9}>
                      <Badge bg={profileData.is_available ? "success" : "secondary"}>
                        {profileData.is_available ? "Available" : "Not Available"}
                      </Badge>
                    </Col>
                  </Row>
                  <Row className="mb-3">
                    <Col sm={3} className="text-muted">Skills</Col>
                    <Col sm={9}>
                      <div className="d-flex flex-wrap gap-2">
                        {profileData.skills && Array.isArray(profileData.skills) && profileData.skills.length > 0 ? (
                          profileData.skills.map((skill, index) => (
                            <Badge key={index} bg="primary" pill>
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          'N/A'
                        )}
                      </div>
                    </Col>
                  </Row>
                </>
              )}

              {/* Employer-specific fields */}
              {profileData.user_type === 'employer' && (
                <>
                  <Row className="mb-2">
                    <Col sm={3} className="text-muted">Company Name</Col>
                    <Col sm={9}>{profileData.company_name || 'N/A'}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col sm={3} className="text-muted">Company Description</Col>
                    <Col sm={9}>{profileData.company_description || 'N/A'}</Col>
                  </Row>
                </>
              )}

              <Row className="mb-3">
                <Col sm={3} className="text-muted">Member Since</Col>
                <Col sm={9}>
                  {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Account Management Section */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3 fw-bold">Account Management</h5>
              <Row className="mb-3">
                <Col sm={3} className="text-muted">Account Type</Col>
                <Col sm={9}>
                  <Badge bg="info">
                    {profileData.user_type.charAt(0).toUpperCase() + profileData.user_type.slice(1)}
                  </Badge>
                </Col>
              </Row>
              <Row>
                <Col className="d-flex justify-content-end">
                  <Button
                    variant="danger"
                    onClick={handleDeleteAccount}
                    className="d-flex align-items-center"
                  >
                    <FaTrashAlt className="me-2" />
                    Delete Account
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Edit Profile Modal */} 
          {profileData && (
            <EditProfileModal
              show={showEditModal}
              handleClose={() => setShowEditModal(false)}
              profileData={profileData}
              onSaveSuccess={handleEditSuccess}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default UserProfile;