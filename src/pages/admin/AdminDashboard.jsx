import React, { useState, useEffect, useCallback } from 'react';
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

  const [totalUsers, setTotalUsers] = useState('...');
  const [totalJobs, setTotalJobs] = useState('...');
  const [activeJobs, setActiveJobs] = useState('...');
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  const fetchAdminData = useCallback(async () => {
    if (!user || !user.token) {
        console.warn("AdminDashboard: Attempted to fetch data but user or token is missing. This should be handled by PrivateRoute.");
        return;
    }

    const userToken = user.token;
    setLoadingData(true);
    setError('');

    try {
      const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const usersData = await usersResponse.json();

      if (!usersResponse.ok) {
        if (usersResponse.status === 401 || usersResponse.status === 403) {
          console.error("AdminDashboard: User fetch unauthorized/forbidden from API. Logging out.");
          logout();
          return;
        }
        throw new Error(usersData.message || 'Failed to fetch users');
      }
      setTotalUsers(usersData.length.toLocaleString());
      // Adjust to show a reasonable number for recent users on dashboard, e.g., 5 to 10
      setRecentUsers(usersData.slice(0, 5)); 

      const jobsResponse = await fetch(`${API_BASE_URL}/api/jobs`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      const jobsData = await jobsResponse.json();

      if (!jobsResponse.ok) {
        if (jobsResponse.status === 401 || jobsResponse.status === 403) {
          console.error("AdminDashboard: Job fetch unauthorized/forbidden from API. Logging out.");
          logout();
          return;
        }
        throw new Error(jobsData.message || 'Failed to fetch jobs');
      }
      setTotalJobs(jobsData.length.toLocaleString());
      const activeCount = jobsData.filter(job => job.status === 'Active').length;
      setActiveJobs(activeCount.toLocaleString());

    } catch (err) {
      console.error('Error fetching admin data:', err);
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
    // Example: navigate(`/admin/users/${userId}`);
  };

  if (loadingData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <p>Loading admin dashboard data...</p>
      </div>
    );
  }

  return (
    // The Container already handles padding based on screen size.
    // bg-white and rounded shadow-sm are style choices, keep them.
    <Container fluid className="py-4 px-3 px-md-5 bg-white rounded shadow-sm">
      <h3 className="mb-4 fw-bold">Dashboard</h3>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Overview Section */}
      {!loadingData && !error && (
        <>
          <h5 className="mb-3 fw-bold">Overview</h5>
          <Row className="mb-4">
            {/* These Cols already have xs={12} and md={4} which is good for stacking on mobile */}
            <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0"> {/* Added sm={6} for tablets/larger phones */}
              <Card className="shadow-sm border-0 text-center py-4 bg-white">
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Users</h6>
                  <h2 className="display-4 fw-bold text-primary">{totalUsers}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={6} md={4} className="mb-3 mb-md-0"> {/* Added sm={6} for tablets/larger phones */}
              <Card className="shadow-sm border-0 text-center py-4 bg-white">
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Jobs</h6>
                  <h2 className="display-4 fw-bold text-primary">{totalJobs}</h2>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} sm={12} md={4}> {/* Added sm={12} to ensure it always takes full width on small screens before md */}
              <Card className="shadow-sm border-0 border-primary text-center py-4 bg-white">
                <Card.Body>
                  <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Active Jobs</h6>
                  <h2 className="display-4 fw-bold text-primary">{activeJobs}</h2>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Recent Activity Section */}
          <h5 className="mb-3 mt-5 fw-bold">Recent Users</h5>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              {/* Table responsive makes the table scroll horizontally on small screens if content overflows */}
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
  <td className="text-truncate" style={{maxWidth: '80px'}}>{userItem._id}</td>
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