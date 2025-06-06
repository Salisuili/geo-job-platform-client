import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Import icons from react-icons. Ensure you have installed 'react-icons'
import { FaHome, FaBriefcase, FaUsers, FaCreditCard, FaCog, FaCube } from 'react-icons/fa';

// Import Bootstrap components
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Nav,
} from 'react-bootstrap';

function PostJob() {
  // State to manage form inputs
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // --- Additional fields from your MongoDB 'jobs' schema would go here ---
  // const [jobType, setJobType] = useState(''); // e.g., Full-time, Part-time
  // const [location, setLocation] = useState(''); // e.g., Zaria, Kaduna
  // const [payRateMin, setPayRateMin] = useState('');
  // const [payRateMax, setPayRateMax] = useState('');
  // const [payType, setPayType] = useState(''); // e.g., Hourly, Fixed Price
  // const [applicationDeadline, setApplicationDeadline] = useState(''); // Use a date picker
  // const [requiredSkills, setRequiredSkills] = useState([]); // Array of strings, e.g., using a tag input
  // const [imageUrl, setImageUrl] = useState(''); // For job image

  const handleSubmit = (event) => {
    event.preventDefault();
    // In a real application, you would send this data to your backend
    const jobData = {
      title: jobTitle,
      description: jobDescription,
      // Note: 'contactInfo' here is a direct input from the form.
      // In your backend, you might store this directly on the job document,
      // or infer contact details from the employer_id linked to the users collection.
      contact_information_from_form: contactInfo, // This field was not explicitly in the schema,
                                                 // but is shown in the UI.
      // --- Include other schema fields here if you add them to the form ---
      // job_type: jobType,
      // location: location,
      // pay_rate_min: parseFloat(payRateMin),
      // pay_rate_max: parseFloat(payRateMax),
      // pay_type: payType,
      // application_deadline: applicationDeadline,
      // required_skills: requiredSkills,
      // image_url: imageUrl,
      // employer_id: "employer_id_from_auth", // This would come from authenticated user
      // status: "Active", // Default status upon creation
      // posted_at: new Date(),
    };

    console.log("Job Data to Post:", jobData);
    alert("Job data logged to console. In a real app, this would be posted to an API.");

    // Reset form fields after submission
    setJobTitle('');
    setJobDescription('');
    setContactInfo('');
    // Reset other fields too
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>
      {/* Left Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: '#fff',
        borderRight: '1px solid #e9ecef',
        padding: '2rem 1.5rem',
        flexShrink: 0, // Prevent sidebar from shrinking
      }}>
        <div className="mb-4">
          <h5 className="fw-bold mb-0">Local Labor</h5>
          <small className="text-muted">Employer</small>
        </div>
        <Nav className="flex-column">
          <Nav.Link href="#dashboard" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaHome className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link href="#jobs" className="text-dark py-2 d-flex align-items-center"
            style={{ backgroundColor: '#e9ecef', borderRadius: '0.375rem', fontWeight: 'bold' }}>
            <FaBriefcase className="me-2" /> Jobs
          </Nav.Link>
          <Nav.Link href="#laborers" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaUsers className="me-2" /> Laborers
          </Nav.Link>
          <Nav.Link href="#payments" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaCreditCard className="me-2" /> Payments
          </Nav.Link>
          <Nav.Link href="#settings" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaCog className="me-2" /> Settings
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content Area */}
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Post a New Job</h3>

        <Form onSubmit={handleSubmit}>
          {/* Job Title */}
          <Form.Group className="mb-4" controlId="jobTitle">
            <Form.Label className="fw-bold">Job Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Landscaping, Plumbing, Tutoring"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              required
              style={{
                backgroundColor: '#f0f2f5',
                border: '1px solid #e9ecef',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
              }}
            />
          </Form.Group>

          {/* Job Description */}
          <Form.Group className="mb-4" controlId="jobDescription">
            <Form.Label className="fw-bold">Job Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={5} // Adjust rows as needed
              placeholder="Describe the job in detail, including requirements, location, and expected duration."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              required
              style={{
                backgroundColor: '#f0f2f5',
                border: '1px solid #e9ecef',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
              }}
            />
          </Form.Group>

          {/* Contact Information */}
          <Form.Group className="mb-4" controlId="contactInfo">
            <Form.Label className="fw-bold">Contact Information</Form.Label>
            <Form.Control
              type="text"
              placeholder="Your phone number or email address"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              required
              style={{
                backgroundColor: '#f0f2f5',
                border: '1px solid #e9ecef',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
              }}
            />
          </Form.Group>

          {/* --- Placeholders for other schema fields not in the image --- */}
          {/*
          <Form.Group className="mb-4" controlId="jobType">
            <Form.Label className="fw-bold">Job Type</Form.Label>
            <Form.Select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
            >
              <option value="">Select Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Temporary">Temporary</option>
              <option value="Seasonal">Seasonal</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4" controlId="location">
            <Form.Label className="fw-bold">Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Zaria, Kaduna"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
            />
          </Form.Group>

          <Row className="mb-4">
            <Col>
              <Form.Group controlId="payRateMin">
                <Form.Label className="fw-bold">Min Pay Rate</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Min Pay"
                  value={payRateMin}
                  onChange={(e) => setPayRateMin(e.target.value)}
                  style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="payRateMax">
                <Form.Label className="fw-bold">Max Pay Rate</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Max Pay"
                  value={payRateMax}
                  onChange={(e) => setPayRateMax(e.target.value)}
                  style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group controlId="payType">
                <Form.Label className="fw-bold">Pay Type</Form.Label>
                <Form.Select
                  value={payType}
                  onChange={(e) => setPayType(e.target.value)}
                  style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
                >
                  <option value="">Select Type</option>
                  <option value="Hourly">Hourly</option>
                  <option value="Fixed Price">Fixed Price</option>
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Monthly">Monthly</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4" controlId="applicationDeadline">
            <Form.Label className="fw-bold">Application Deadline</Form.Label>
            <Form.Control
              type="date" // Use type="date" for a date picker
              value={applicationDeadline}
              onChange={(e) => setApplicationDeadline(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="requiredSkills">
            <Form.Label className="fw-bold">Required Skills</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Plumbing, Electrical (comma separated)"
              value={requiredSkills.join(', ')} // Display as comma-separated
              onChange={(e) => setRequiredSkills(e.target.value.split(',').map(s => s.trim()))}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="imageUrl">
            <Form.Label className="fw-bold">Job Image URL</Form.Label>
            <Form.Control
              type="url"
              placeholder="http://example.com/job_image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              style={{ backgroundColor: '#f0f2f5', border: '1px solid #e9ecef' }}
            />
          </Form.Group>
          */}

          {/* Post Job Button */}
          <div className="d-flex justify-content-end mt-5">
            <Button variant="primary" type="submit" className="px-5 py-2"
              style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd', borderRadius: '0.375rem' }}>
              Post Job
            </Button>
          </div>
        </Form>
      </Container>
    </div>
  );
}

export default PostJob;