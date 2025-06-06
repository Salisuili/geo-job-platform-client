import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

// Import icons from react-icons. Ensure you have installed 'react-icons'
import { FaHome, FaUsers, FaBriefcase, FaChartBar, FaCog } from 'react-icons/fa';

// Import Bootstrap components
import {
  Container,
  Row,
  Col,
  Nav,
  Card,
  Table,
  Button,
} from 'react-bootstrap';

function AdminDashboard() {
  // Dummy data for overview statistics
  const overviewStats = {
    totalUsers: '1,234',
    totalJobs: '567',
    activeJobs: '345',
  };

  // Dummy data for recent activity table
  const recentActivity = [
    { id: 1, user: 'Ethan Harper', role: 'Laborer', jobsPosted: 10, jobsCompleted: 8 },
    { id: 2, user: 'Olivia Bennett', role: 'Employer', jobsPosted: 5, jobsCompleted: 5 },
    { id: 3, user: 'Noah Carter', role: 'Laborer', jobsPosted: 7, jobsCompleted: 6 },
    { id: 4, user: 'Ava Mitchell', role: 'Employer', jobsPosted: 3, jobsCompleted: 3 },
    { id: 5, user: 'Liam Foster', role: 'Laborer', jobsPosted: 12, jobsCompleted: 10 },
  ];

  const handleViewAction = (userId) => {
    // In a real application, this would navigate to a detailed user/job view
    console.log(`View action clicked for user ID: ${userId}`);
    alert(`Navigating to details for user ID: ${userId}`);
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
        </div>
        <Nav className="flex-column">
          <Nav.Link href="#dashboard" className="text-dark py-2 d-flex align-items-center"
            style={{ backgroundColor: '#e9ecef', borderRadius: '0.375rem', fontWeight: 'bold' }}>
            <FaHome className="me-2" /> Dashboard
          </Nav.Link>
          <Nav.Link href="#users" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaUsers className="me-2" /> Users
          </Nav.Link>
          <Nav.Link href="#jobs" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaBriefcase className="me-2" /> Jobs
          </Nav.Link>
          <Nav.Link href="#reports" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaChartBar className="me-2" /> Reports
          </Nav.Link>
          <Nav.Link href="#settings" className="text-dark py-2 d-flex align-items-center"
            style={{ borderRadius: '0.375rem' }}>
            <FaCog className="me-2" /> Settings
          </Nav.Link>
        </Nav>
      </div>

      {/* Main Content Area */}
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Dashboard</h3>

        {/* Overview Section */}
        <h5 className="mb-3 fw-bold">Overview</h5>
        <Row className="mb-4">
          <Col md={4}>
            <Card className="shadow-sm border-0 text-center py-4" style={{ backgroundColor: '#fff' }}>
              <Card.Body>
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Users</h6>
                <h2 className="display-4 fw-bold text-primary">{overviewStats.totalUsers}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0 text-center py-4" style={{ backgroundColor: '#fff' }}>
              <Card.Body>
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Jobs</h6>
                <h2 className="display-4 fw-bold text-primary">{overviewStats.totalJobs}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="shadow-sm border-0 text-center py-4" style={{ backgroundColor: '#fff' }}>
              <Card.Body>
                <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Active Jobs</h6>
                <h2 className="display-4 fw-bold text-primary">{overviewStats.activeJobs}</h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity Section */}
        <h5 className="mb-3 mt-5 fw-bold">Recent Activity</h5>
        <Card className="shadow-sm border-0">
          <Card.Body className="p-0"> {/* Remove default padding for table */}
            <Table responsive hover className="mb-0"> {/* mb-0 to remove bottom margin */}
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Jobs Posted</th>
                  <th>Jobs Completed</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.user}</td>
                    <td>{activity.role}</td>
                    <td>{activity.jobsPosted}</td>
                    <td>{activity.jobsCompleted}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewAction(activity.id)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}

export default AdminDashboard;