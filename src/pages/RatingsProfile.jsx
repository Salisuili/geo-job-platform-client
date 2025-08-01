import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaStar } from 'react-icons/fa'; // Only FaStar is needed now
import {
  Container,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  ProgressBar,
  Form,
  Button,
} from 'react-bootstrap';

import { useAuth } from '../contexts/AuthContext';


const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

const timeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
  let interval = seconds / 31536000; // years
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000; // months
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400; // days
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600; // hours
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60; // minutes
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
};

function RatingsProfile() {
  const { laborerId } = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [laborerData, setLaborerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [currentRating, setCurrentRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchLaborerProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/laborers/${laborerId}`);

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        throw new Error(errorMessage);
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

  useEffect(() => {
    if (!laborerId) {
      setError("No laborer ID provided in the URL.");
      setLoading(false);
      return;
    }
    if (!authLoading) {
      fetchLaborerProfile();
    }
  }, [laborerId, authLoading]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    if (currentRating === 0) {
      setSubmitError("Please select a star rating.");
      setSubmitLoading(false);
      return;
    }

    if (!isAuthenticated || !user || !user._id || !user.token) {
        setSubmitError("You must be logged in to submit a rating.");
        setSubmitLoading(false);
        navigate('/login');
        return;
    }

    try {
      const ratingData = {
        rater_id: user._id,
        target_id: laborerId,
        rating: currentRating,
        comment: comment,
      };

      const response = await fetch(`${API_BASE_URL}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify(ratingData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to submit rating: HTTP status ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} - ${errorText}`;
        }
        throw new Error(errorMessage);
      }

      setSubmitSuccess(true);
      setComment('');
      setCurrentRating(0);
      await fetchLaborerProfile(); // Re-fetch to update reviews
    } catch (err) {
      console.error("Error submitting rating:", err);
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setSubmitLoading(false);
    }
  };

  console.log("RatingsProfile State: User:", user, "isAuthenticated:", isAuthenticated, "authLoading:", authLoading, "LaborerDataLoading:", loading);

  // --- Start: Crucial Render Order for Authentication ---

  // 1. If authentication state is still being loaded, show a general loading indicator.
  // This is the most important check to prevent accessing 'user' prematurely.
  if (authLoading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading authentication status...</span>
        </Spinner>
        <p className="mt-2">Checking user authentication status...</p>
      </Container>
    );
  }

  // 2. Now that authLoading is false, we can safely determine user roles.
  // user will now be either a valid object or null, consistently.
  const isEmployer = user?.user_type === 'employer';
  const isLaborerSelf = user && user.user_type === 'laborer' && user._id === laborerId;


  // 3. Handle loading/error for the laborer profile data itself (separate from auth loading).
  if (loading) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading laborer profile...</span>
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
          <p>Please try again later or ensure the laborer ID in the URL is correct.</p>
        </Alert>
      </Container>
    );
  }

  if (!laborerData) {
    return (
      <Container className="my-5 text-center">
        <Alert variant="info">
          <Alert.Heading>Laborer Not Found</Alert.Heading>
          <p>The laborer profile you are looking for does not exist or has been removed.</p>
        </Alert>
      </Container>
    );
  }

  // --- End: Crucial Render Order ---

  const profileName = laborerData.full_name || laborerData.username || 'Laborer';
  const profilePic = laborerData.profile_picture_url
    ? `${API_BASE_URL}${laborerData.profile_picture_url}`
    : 'https://via.placeholder.com/80x80?text=NA';

  const profileDescription = laborerData.bio || (laborerData.skills && laborerData.skills.length > 0 ? laborerData.skills.join(', ') : 'No description available.');
  const joinedDate = laborerData.createdAt ? `Joined in ${new Date(laborerData.createdAt).getFullYear()}` : 'N/A';

  const ratingsOverall = laborerData.overallRating !== undefined && laborerData.overallRating !== null ? laborerData.overallRating.toFixed(1) : 'N/A';
  const totalReviews = laborerData.totalReviews || 0;
  const ratingDistribution = Array.isArray(laborerData.ratingDistribution) ? laborerData.ratingDistribution : [];
  const reviews = Array.isArray(laborerData.reviews) ? laborerData.reviews : [];

  return (
    <Container className="my-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          {/* Laborer Profile Card */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body className="d-flex align-items-center">
              <img
                src={profilePic}
                alt={profileName}
                className="rounded-circle me-3"
                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
              />
              <div>
                <h4 className="mb-0">{profileName}</h4>
                <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>{profileDescription}</p>
                <p className="text-muted" style={{ fontSize: '0.9rem' }}>{joinedDate}</p>
              </div>
            </Card.Body>
          </Card>

          {/* Overall Ratings Summary Card */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
              <h5 className="mb-3">Ratings</h5>
              <Row className="align-items-center">
                <Col md={3} className="text-center">
                  <h1 className="display-4 fw-bold">{ratingsOverall}</h1>
                  <p className="text-muted">{totalReviews} reviews</p>
                </Col>
                <Col md={9}>
                  {ratingDistribution.length === 0 ? (
                    <p className="text-muted text-center">No rating distribution data available.</p>
                  ) : (
                    ratingDistribution.map((item) => (
                      <div key={item.stars || `dist-${Math.random()}`} className="d-flex align-items-center mb-2">
                        <span className="me-2 text-muted" style={{ width: '20px' }}>{item.stars} <FaStar color="#ffc107" size="12px" /></span>
                        <ProgressBar
                          now={item.percentage}
                          variant="primary"
                          className="flex-grow-1 me-2"
                          style={{ height: '8px' }}
                        />
                        <span className="text-muted" style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem' }}>
                          {item.percentage !== undefined ? `${item.percentage.toFixed(1)}%` : '0%'}
                        </span>
                      </div>
                    ))
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Rate Laborer Section (Employer Only, Not Self) */}
          {isAuthenticated && isEmployer && !isLaborerSelf && (
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Rate {profileName}</h5>
                {submitSuccess && <Alert variant="success">Rating submitted successfully!</Alert>}
                {submitError && <Alert variant="danger">{submitError}</Alert>}
                <Form onSubmit={handleRatingSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Your Rating:</Form.Label>
                    <div>
                      {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1;
                        return (
                          <FaStar
                            key={ratingValue}
                            color={ratingValue <= (hoverRating || currentRating) ? '#ffc107' : '#e4e5e9'}
                            size="30px"
                            style={{ cursor: 'pointer', marginRight: '5px' }}
                            onClick={() => setCurrentRating(ratingValue)}
                            onMouseEnter={() => setHoverRating(ratingValue)}
                            onMouseLeave={() => setHoverRating(0)}
                          />
                        );
                      })}
                    </div>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="comment">
                    <Form.Label>Comment (optional):</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Share your experience..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={500}
                    />
                  </Form.Group>
                  <Button variant="primary" type="submit" disabled={submitLoading}>
                    {submitLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Submit Rating'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
          {(!isAuthenticated || !isEmployer) && (
              <Alert variant="info" className="text-center mb-4 shadow-sm border-0">
                  <p className="mb-0">Only logged-in employers can submit ratings for this laborer.</p>
              </Alert>
          )}

          {/* Existing Reviews Section */}
          <h5 className="mb-3">Reviews ({reviews.length})</h5>
          {reviews.length === 0 ? (
            <p className="text-muted text-center">No reviews available yet.</p>
          ) : (
            reviews.map(review => (
              <Card key={review._id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={review.reviewer?.profile_picture_url
                        ? `${API_BASE_URL}${review.reviewer.profile_picture_url}`
                        : 'https://via.placeholder.com/40x40?text=NA'}
                      alt={review.reviewer?.full_name || 'Anonymous'}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0">{review.reviewer?.full_name || 'Anonymous'}</h6>
                      <small className="text-muted">{timeAgo(review.createdAt)}</small>
                    </div>
                  </div>
                  <div className="mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={i < review.rating ? '#ffc107' : '#e4e5e9'}
                        className="me-1"
                      />
                    ))}
                  </div>
                  <Card.Text className="mb-3">{review.comment || 'No comment provided.'}</Card.Text>
                  {/* The thumbs-up/thumbs-down section has been removed */}
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default RatingsProfile;