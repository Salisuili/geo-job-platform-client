// src/components/RatingsProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // To get the laborerId from the URL
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaStar, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa';
import { Container, Card, Row, Col, ProgressBar, Spinner, Alert } from 'react-bootstrap';
import EmployerDashboardLayout from './EmployerDashboardLayout'; // Import the layout

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL; // Your backend API URL

function RatingsProfile() {
  const { laborerId } = useParams(); // Get laborerId from the URL
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
        setLoading(true);
        // In a real application, you'd fetch data from your backend
        // const response = await fetch(`${API_BASE_URL}/api/laborers/${laborerId}`);
        // if (!response.ok) {
        //   const errorData = await response.json();
        //   throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // setLaborerData(data.laborer);

        // --- Dummy Data for demonstration ---
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const dummyLaborerData = {
          '66624f79435f3d32490b4111': {
            name: 'Sophia Carter',
            title: 'Carpenter',
            profilePic: 'https://randomuser.me/api/portraits/women/32.jpg',
            joinedDate: '2022',
            overallRating: 4.8,
            totalReviews: 125,
            ratingDistribution: [
              { stars: 5, percentage: 85 },
              { stars: 4, percentage: 10 },
              { stars: 3, percentage: 3 },
              { stars: 2, percentage: 1 },
              { stars: 1, percentage: 1 },
            ],
            reviews: [
              { id: 1, reviewerName: 'Employer A', reviewerPic: 'https://randomuser.me/api/portraits/men/1.jpg', stars: 5, text: 'Sophia did an excellent job on our deck project. Very professional and skilled!', timeAgo: '2 days ago', likes: 15, dislikes: 0 },
              { id: 2, reviewerName: 'Employer B', reviewerPic: 'https://randomuser.me/api/portraits/women/2.jpg', stars: 4, text: 'Good work, arrived on time. Minor delay but communicated well.', timeAgo: '1 week ago', likes: 7, dislikes: 1 },
              { id: 3, reviewerName: 'Employer C', reviewerPic: 'https://randomuser.me/api/portraits/men/3.jpg', stars: 5, text: 'Highly recommend! Finished ahead of schedule and the quality was superb.', timeAgo: '3 weeks ago', likes: 20, dislikes: 0 },
            ],
          },
          '66624f79435f3d32490b4112': {
            name: 'John Doe',
            title: 'Electrician',
            profilePic: 'https://randomuser.me/api/portraits/men/45.jpg',
            joinedDate: '2021',
            overallRating: 4.5,
            totalReviews: 80,
            ratingDistribution: [
              { stars: 5, percentage: 70 },
              { stars: 4, percentage: 20 },
              { stars: 3, percentage: 5 },
              { stars: 2, percentage: 3 },
              { stars: 1, percentage: 2 },
            ],
            reviews: [
              { id: 4, reviewerName: 'Employer D', reviewerPic: 'https://randomuser.me/api/portraits/women/4.jpg', stars: 5, text: 'John fixed our wiring issue quickly and efficiently. Very knowledgeable.', timeAgo: '4 days ago', likes: 10, dislikes: 0 },
            ],
          },
        };
        const data = dummyLaborerData[laborerId];
        if (!data) {
            throw new Error("Laborer not found with ID: " + laborerId);
        }
        setLaborerData(data);
        // --- End Dummy Data ---

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
      <EmployerDashboardLayout> {/* Consistent layout even during loading */}
        <Container className="my-5 text-center flex-grow-1">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading laborer profile...</p>
        </Container>
      </EmployerDashboardLayout>
    );
  }

  if (error) {
    return (
      <EmployerDashboardLayout> {/* Consistent layout for errors */}
        <Container className="my-5 flex-grow-1">
          <Alert variant="danger">
            <Alert.Heading>Oh snap! An error occurred!</Alert.Heading>
            <p>{error}</p>
            <p>Please try again later or ensure the laborer ID in the URL is correct.</p>
          </Alert>
        </Container>
      </EmployerDashboardLayout>
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
    <EmployerDashboardLayout> {/* <--- Wraps the entire page content */}
      <Container className="my-4 flex-grow-1">
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
                  <h4 className="mb-0">{userData.name || 'Laborer Name'}</h4>
                  <p className="text-muted mb-0">{userData.title || 'N/A'}</p>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Joined in {userData.joinedDate || 'N/A'}</p>
                </div>
                {/* <Button variant="outline-primary" className="ms-auto">
                  Message Laborer
                </Button> */}
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
                        <span className="me-2 text-muted" style={{ width: '20px' }}>{item.stars} <FaStar color="#ffc107" size="0.8em" /></span>
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
              <Card className="shadow-sm border-0">
                 <Card.Body>
                   <p className="text-muted text-center mb-0">No reviews available yet for this laborer.</p>
                 </Card.Body>
              </Card>
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
          </Col>
        </Row>
      </Container>
    </EmployerDashboardLayout>
  );
}

export default RatingsProfile;