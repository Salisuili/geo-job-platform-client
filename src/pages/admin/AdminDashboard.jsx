import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
} from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminDashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate(); // Keep navigate for potential manual navigation (e.g., to user details)

  const [totalUsers, setTotalUsers] = useState('...');
  const [totalJobs, setTotalJobs] = useState('...');
  const [activeJobs, setActiveJobs] = useState('...');
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = useCallback(async (userToken) => {
    setLoadingData(true);
    setError('');
    try {
      const [usersResponse, jobsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users`, { headers: { 'Authorization': `Bearer ${userToken}` } }),
        fetch(`${API_BASE_URL}/api/jobs`, { headers: { 'Authorization': `Bearer ${userToken}` } })
      ]);

      if (!usersResponse.ok) {
        const usersErrorData = await usersResponse.json();
        if (usersResponse.status === 401 || usersResponse.status === 403) {
          console.error("AdminDashboard: User fetch unauthorized/forbidden from API. Logging out.");
          logout(); // This will navigate to /login
          throw new Error("Authentication failed, please log in again."); // Throw to exit catch block
        }
        throw new Error(usersErrorData.message || 'Failed to fetch users');
      }
      const usersData = await usersResponse.json();
      setTotalUsers(usersData.length.toLocaleString());
      setRecentUsers(usersData.slice(0, 10));

      if (!jobsResponse.ok) {
        const jobsErrorData = await jobsResponse.json();
        if (jobsResponse.status === 401 || jobsResponse.status === 403) {
          console.error("AdminDashboard: Job fetch unauthorized/forbidden from API. Logging out.");
          logout(); // This will navigate to /login
          throw new Error("Authentication failed, please log in again."); // Throw to exit catch block
        }
        throw new Error(jobsErrorData.message || 'Failed to fetch jobs');
      }
      const jobsData = await jobsResponse.json();
      setTotalJobs(jobsData.length.toLocaleString());
      const activeCount = jobsData.filter(job => job.status === 'Active').length;
      setActiveJobs(activeCount.toLocaleString());

    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoadingData(false);
    }
  }, [logout]); // 'logout' is now the only dependency needed from AuthContext

  useEffect(() => {
    // Only proceed if authLoading is false and user is available and has a token
    if (!authLoading && user && user.token) {
      fetchAdminData(user.token);
    }
  }, [user, authLoading, fetchAdminData]); // fetchAdminData is memoized

  const handleViewAction = (userId) => {
    console.log(`View action clicked for user ID: ${userId}`);
    // Example: navigate(`/admin/users/${userId}`); // Use navigate for specific sub-pages
  };

  // If authLoading is true, display a loading message.
  if (authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', width: '100%' }}>
        <p>Checking authentication status...</p>
      </div>
    );
  }

  // At this point, the PrivateRoute should have already ensured the user is an authenticated admin.
  // We no longer need the redundant `if (!user || user.user_type !== 'admin')` check here,
  // as PrivateRoute handles it and redirects away if necessary.

  return (
    <Container fluid className="py-4 px-5 flex-grow-1" style={{ backgroundColor: '#f8f9fa' }}>
      <h3 className="mb-4 fw-bold">Admin Dashboard</h3>

      {loadingData && <div className="alert alert-info">Loading dashboard data...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {!loadingData && !error && (
        <>
          <h5 className="mb-3 fw-bold">Overview</h5>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0 text-center py-4" style={{ backgroundColor: '#fff' }}>
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Users</h6>
                  <h2 className="display-4 fw-bold text-primary">{totalUsers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 text-center py-4" style={{ backgroundColor: '#fff' }}>
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Jobs</h6>
                  <h2 className="display-4 fw-bold text-primary">{totalJobs}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 border-primary text-center py-4" style={{ backgroundColor: '#fff' }}>
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
              <Table responsive hover className="mb-0">
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
                        <td>{userItem._id}</td>
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
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}

export default AdminDashboard;