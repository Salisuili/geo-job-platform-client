import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Import icons from react-icons. Ensure you have installed 'react-icons'
import { FaStar, FaRegThumbsUp, FaRegThumbsDown, FaArrowRight, FaBell, FaUserCircle } from 'react-icons/fa';

// Import Bootstrap components
import {
  Navbar,
  Nav,
  Container,
  Button,
  Card,
  Row,
  Col,
  ProgressBar,
} from 'react-bootstrap';

function RatingsProfile() {
  // Dummy data for the profile and ratings
  const userData = {
    profilePic: 'https://via.placeholder.com/80x80?text=SC', // Placeholder for Sophia Carter's profile pic
    name: 'Sophia Carter',
    title: 'Carpenter',
    joinedDate: '2021',
  };

  const ratingsData = {
    overall: '4.8',
    totalReviews: 125,
    distribution: [
      { stars: 5, percentage: 75 },
      { stars: 4, percentage: 15 },
      { stars: 3, percentage: 5 },
      { stars: 2, percentage: 3 },
      { stars: 1, percentage: 2 },
    ],
  };

  const reviewsData = [
    {
      id: 1,
      reviewerName: 'Liam Harper',
      reviewerPic: 'https://via.placeholder.com/40x40?text=LH', // Placeholder for Liam Harper's pic
      timeAgo: '2 months ago',
      stars: 5,
      text: 'Sophia did an excellent job on our kitchen cabinets. She was punctual, professional, and her craftsmanship was top-notch. Highly recommend!',
      likes: 12,
      dislikes: 1,
    },
    {
      id: 2,
      reviewerName: 'Ethan Bennett',
      reviewerPic: 'https://via.placeholder.com/40x40?text=EB', // Placeholder for Ethan Bennett's pic
      timeAgo: '3 months ago',
      stars: 4,
      text: 'Sophia was good, but there were a few minor issues with the finishing. Overall, satisfied with the work.',
      likes: 5,
      dislikes: 2,
    },
    {
      id: 3,
      reviewerName: 'Noah Foster',
      reviewerPic: 'https://via.placeholder.com/40x40?text=NF', // Placeholder for Noah Foster's pic
      timeAgo: '4 months ago',
      stars: 5,
      text: 'Sophia is a true professional. She completed the job ahead of schedule and the quality of her work exceeded my expectations. Will definitely hire again!',
      likes: 8,
      dislikes: 0,
    },
  ];

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* Main Content */}
      <Container className="my-4">
        <Row className="justify-content-center">
          <Col lg={8}> {/* Central column for content */}
            {/* Profile Header Card */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body className="d-flex align-items-center">
                <img
                  src={userData.profilePic}
                  alt={userData.name}
                  className="rounded-circle me-3"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <div>
                  <h4 className="mb-0">{userData.name}</h4>
                  <p className="text-muted mb-0">{userData.title}</p>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Joined in {userData.joinedDate}</p>
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
            {reviewsData.map(review => (
              <Card key={review.id} className="mb-3 shadow-sm border-0">
                <Card.Body>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={review.reviewerPic}
                      alt={review.reviewerName}
                      className="rounded-circle me-2"
                      style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="mb-0">{review.reviewerName}</h6>
                      <small className="text-muted">{review.timeAgo}</small>
                    </div>
                  </div>
                  <div className="mb-2">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        color={i < review.stars ? '#ffc107' : '#e4e5e9'} // Gold for filled stars, light gray for empty
                        className="me-1"
                      />
                    ))}
                  </div>
                  <Card.Text className="mb-3">{review.text}</Card.Text>
                  <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.9rem' }}>
                    <FaRegThumbsUp className="me-1" /> {review.likes}
                    <FaRegThumbsDown className="ms-3 me-1" /> {review.dislikes}
                  </div>
                </Card.Body>
              </Card>
            ))}

            {/* Account Section Card */}
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