import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Import icons from react-icons. Ensure you have installed 'react-icons'
import { FaBell, FaRegUserCircle, FaTrashAlt } from 'react-icons/fa';

// Import Bootstrap components
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Card,
} from 'react-bootstrap';

function UserProfile() {
  // Dummy user data mirroring your MongoDB 'users' schema
  // In a real application, this data would be fetched from your backend API
  const userData = {
    _id: "user_id_from_db", // Example ObjectId or UUID
    profile_picture_url: 'https://via.placeholder.com/40x40?text=SB', // Placeholder for Sophia Bennett's profile pic
    full_name: 'Sophia Bennett',
    email: 'sophia.bennett@email.com',
    phone_number: '(555) 123-4567', // Stored as a string
    user_type: 'employer', // Enum: 'laborer', 'employer', 'admin'
    // Other fields from schema like username, password_hash, created_at, etc., would not be displayed here.
    // Laborer specific fields like 'title', 'bio', 'hourly_rate', 'is_available', 'joined_date'
    // would be present if user_type is 'laborer'.
  };

  const handleDeleteAccount = () => {
    // In a real application, this would trigger an API call to delete the user's account
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      console.log("Delete Account clicked for user:", userData.full_name);
      // Implement API call to delete account here
      alert("Account deletion process initiated (check console).");
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Navbar */}
      <Navbar bg="white" expand="lg" className="border-bottom py-3">
        <Container>
          <Navbar.Brand href="#home" className="d-flex align-items-center">
            <img
              src="https://via.placeholder.com/24x24?text=L" // Placeholder for Local Labor logo
              alt="Local Labor Logo"
              className="me-2"
            />
            <span className="fw-bold">Local Labor</span>
          </Navbar.Brand>
          <Nav className="ms-auto">
            <Nav.Link href="#findwork" className="mx-2">Find Work</Nav.Link>
            <Nav.Link href="#myjobs" className="mx-2">My Jobs</Nav.Link>
            <Nav.Link href="#messages" className="mx-2">Messages</Nav.Link>
            <Nav.Link href="#notifications" className="mx-2">
              <FaBell style={{ fontSize: '1.2rem', color: '#6c757d' }} />
            </Nav.Link>
            <Nav.Link href="#profile" className="mx-2">
              <img
                src={userData.profile_picture_url}
                alt="Profile"
                className="rounded-circle"
                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
              />
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Content */}
      <Container className="my-4">
        <Row className="justify-content-center">
          <Col lg={8}> {/* Central column for content */}
            <h3 className="mb-4 fw-bold">Account</h3>

            {/* Profile Information Section */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3 fw-bold">Profile</h5>
                <Row className="mb-2">
                  <Col sm={3} className="text-muted">Name</Col>
                  <Col sm={9}>{userData.full_name}</Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={3} className="text-muted">Email</Col>
                  <Col sm={9}>
                    <a href={`mailto:${userData.email}`} className="text-decoration-none">
                      {userData.email}
                    </a>
                  </Col>
                </Row>
                <Row className="mb-2">
                  <Col sm={3} className="text-muted">Phone</Col>
                  <Col sm={9}>{userData.phone_number || 'N/A'}</Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Account Management Section */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3 fw-bold">Account</h5>
                <Row className="mb-3">
                  <Col sm={3} className="text-muted">Account Type</Col>
                  <Col sm={9}>{userData.user_type.charAt(0).toUpperCase() + userData.user_type.slice(1)}</Col>
                </Row>
                <Row>
                  <Col className="d-flex justify-content-between align-items-center">
                    <span
                      className="text-danger"
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </span>
                    <FaTrashAlt
                      className="text-danger"
                      style={{ cursor: 'pointer', fontSize: '1.2rem' }}
                      onClick={handleDeleteAccount}
                    />
                  </Col>
                </Row>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default UserProfile;