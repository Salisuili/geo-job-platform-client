import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert
} from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const [totalUsers, setTotalUsers] = useState('...');
  const [totalJobs, setTotalJobs] = useState('...');
  const [activeJobs, setActiveJobs] = useState('...');
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = useCallback(async () => {
    if (!user || !user.token) return;

    const userToken = user.token;
    setLoadingData(true);
    setError('');

    try {
      const [usersResponse, jobsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        }),
        fetch(`${API_BASE_URL}/api/jobs`, {
          headers: { 'Authorization': `Bearer ${userToken}` }
        })
      ]);

      if (!usersResponse.ok || !jobsResponse.ok) {
        if ([usersResponse.status, jobsResponse.status].includes(401)) {
          logout();
          return;
        }
        throw new Error('Failed to fetch dashboard data');
      }

      const [usersData, jobsData] = await Promise.all([
        usersResponse.json(),
        jobsResponse.json()
      ]);

      setTotalUsers(usersData.length.toLocaleString());
      setRecentUsers(usersData.slice(0, 5));
      setTotalJobs(jobsData.length.toLocaleString());
      setActiveJobs(jobsData.filter(job => job.status === 'Active').length.toLocaleString());
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoadingData(false);
    }
  }, [user, logout]);

  useEffect(() => {
    if (!authLoading && user && user.token && user.user_type === 'admin') {
      fetchAdminData();
    }
  }, [user, authLoading, fetchAdminData]);

  const handleViewAction = (userId) => {
    console.log(`View action clicked for user ID: ${userId}`);
  };

  if (loadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="ms-2">Loading admin dashboard data...</p>
      </div>
    );
  }

  return (
    <Container fluid className="py-4 px-3 px-md-5 bg-white rounded shadow-sm">
      <h3 className="mb-4 fw-bold">Dashboard</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {!loadingData && !error && (
        <>
          <h5 className="mb-3 fw-bold">Overview</h5>
          <Row className="mb-4">
            <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0">
              <Card className="shadow-sm border-0 text-center py-4 bg-white">
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Users</h6>
                  <h2 className="display-4 fw-bold text-primary">{totalUsers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0">
              <Card className="shadow-sm border-0 text-center py-4 bg-white">
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Jobs</h6>
                  <h2 className="display-4 fw-bold text-primary">{totalJobs}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Card className="shadow-sm border-0 border-primary text-center py-4 bg-white">
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Active Jobs</h6>
                  <h2 className="display-4 fw-bold text-primary">{activeJobs}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <h5 className="mb-3 mt-5 fw-bold">Recent Users</h5>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>User ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.length > 0 ? (
                      recentUsers.map((userItem) => (
                        <tr key={userItem._id}>
                          <td className="text-truncate" style={{maxWidth: '120px'}}>{userItem._id}</td>
                          <td>{userItem.username}</td>
                          <td>{userItem.email}</td>
                          <td>{userItem.user_type}</td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewAction(userItem._id)}
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-3">No recent users found.</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default AdminDashboard;