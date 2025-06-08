import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaStar, FaRegThumbsUp, FaRegThumbsDown, FaArrowRight } from 'react-icons/fa'; // Removed FaBell, FaUserCircle as they might be part of a global nav
import {
  Container,
  Button,
  Card,
  Row,
  Col,
  ProgressBar,
  Spinner,
  Alert,
} from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function RatingsProfile() {
  const { laborerId } = useParams();

  const [laborerData, setLaborerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!laborerId) {
      setError("No laborer ID provided in the URL.");
      setLoading(false);
      return;
    }

    const fetchLaborerProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/laborers/${laborerId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLaborerData(data.laborer);
      } catch (err) {
        console.error("Failed to fetch laborer profile:", err);
        setError(err.message || "Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchLaborerProfile();
  }, [laborerId]);

  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading laborer profile...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Oh snap! An error occurred!</Alert.Heading>
          <p>{error}</p>
          <p>Please try again later or ensure the laborer ID is correct.</p>
        </Alert>
      </Container>
    );
  }

  const userData = laborerData || {};
  const ratingsData = {
    overall: userData.overallRating || 'N/A',
    totalReviews: userData.totalReviews || 0,
    distribution: userData.ratingDistribution || [],
  };
  const reviewsData = userData.reviews || [];


  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* The hardcoded Navbar has been removed from here */}

      {/* Main Content */}
      <Container className="my-4">
        <Row className="justify-content-center">
          <Col lg={8}>
            {/* Profile Header Card */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <img
                  src={userData.profilePic || 'https://via.placeholder.com/80x80?text=NA'}
                  alt={userData.name || 'Profile Picture'}
                  className="rounded-circle me-3"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <div>
                  <h4 className="mb-0">{userData.name || 'Loading...'}</h4>
                  <p className="text-muted mb-0">{userData.title || 'N/A'}</p>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Joined in {userData.joinedDate || 'N/A'}</p>
                </div>
                <Button variant="outline-primary" className="ms-auto">
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>

            {/* Ratings Section Card */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Ratings</h5>
                <Row className="align-items-center">
                  <Col md={3} className="text-center">
                    <h1 className="display-4 fw-bold">{ratingsData.overall}</h1>
                    <p className="text-muted">{ratingsData.totalReviews} reviews</p>
                  </Col>
                  <Col md={9}>
                    {ratingsData.distribution.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <span className="me-2 text-muted" style={{ width: '20px' }}>{item.stars}</span>
                        <ProgressBar
                          now={item.percentage}
                          variant="primary"
                          className="flex-grow-1 me-2"
                          style={{ height: '8px' }}
                        />
                        <span className="text-muted" style={{ width: '30px', textAlign: 'right', fontSize: '0.85rem' }}>{item.percentage}%</span>
                      </div>
                    ))}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Reviews Section */}
            <h5 className="mb-3">Reviews</h5>
            {reviewsData.length === 0 ? (
              <p className="text-muted text-center">No reviews available yet.</p>
            ) : (
              reviewsData.map(review => (
                <Card key={review.id} className="mb-3 shadow-sm border-0">
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <img
                        src={review.reviewerPic || 'https://via.placeholder.com/40x40?text=NA'}
                        alt={review.reviewerName || 'Reviewer'}
                        className="rounded-circle me-2"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                      />
                      <div>
                        <h6 className="mb-0">{review.reviewerName || 'Anonymous'}</h6>
                        <small className="text-muted">{review.timeAgo || 'N/A'}</small>
                      </div>
                    </div>
                    <div className="mb-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          color={i < review.stars ? '#ffc107' : '#e4e5e9'}
                          className="me-1"
                        />
                      ))}
                    </div>
                    <Card.Text className="mb-3">{review.text || 'No text provided.'}</Card.Text>
                    <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>
                      <FaRegThumbsUp className="me-1" /> {review.likes}
                      <FaRegThumbsDown className="ms-3 me-1" /> {review.dislikes}
                    </div>
                  </Card.Body>
                </Card>
              ))
            )}

            {/* Account Section Card (Likely for the laborer's own profile, not for viewing) */}
            <Card className="mt-5 mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Account</h5>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-danger">Delete Account</span>
                  <FaArrowRight className="text-muted" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RatingsProfile;