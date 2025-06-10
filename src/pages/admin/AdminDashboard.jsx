import React, { useState, useEffect } from 'react';
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
  const navigate = useNavigate();

  const [totalUsers, setTotalUsers] = useState('...');
  const [totalJobs, setTotalJobs] = useState('...');
  const [activeJobs, setActiveJobs] = useState('...');
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user || !user.token) {
      logout();
      navigate('/login');
      return;
    }

    const userToken = user.token;

    const fetchAdminData = async () => {
      setLoadingData(true);
      setError('');

      try {
        const usersResponse = await fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const usersData = await usersResponse.json();

        if (!usersResponse.ok) {
          if (usersResponse.status === 401 || usersResponse.status === 403) {
            logout();
            navigate('/login');
            return;
          }
          throw new Error(usersData.message || 'Failed to fetch users');
        }

        setTotalUsers(usersData.length.toLocaleString());
        setRecentUsers(usersData.slice(0, 10));

        const jobsResponse = await fetch(`${API_BASE_URL}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });

        const jobsData = await jobsResponse.json();

        if (!jobsResponse.ok) {
          if (jobsResponse.status === 401 || jobsResponse.status === 403) {
            logout();
            navigate('/login');
            return;
          }
          throw new Error(jobsData.message || 'Failed to fetch jobs');
        }

        setTotalJobs(jobsData.length.toLocaleString());
        const activeCount = jobsData.filter((job) => job.status === 'Active').length;
        setActiveJobs(activeCount.toLocaleString());

      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchAdminData();
  }, [user, authLoading, navigate, logout]);

  const handleViewAction = (userId) => {
    console.log(`View action clicked for user ID: ${userId}`);
    // Example: navigate(`/admin/users/${userId}`);
  };

  if (authLoading || !user || user.user_type !== 'admin') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <p>Loading admin panel...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', display: 'flex' }}>
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Admin Dashboard</h3>

        {loadingData && <div className="alert alert-info">Loading dashboard data...</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        {!loadingData && !error && (
          <>
            <h5 className="mb-3 fw-bold">Overview</h5>
            <Row className="mb-4">
              <Col md={4}>
                <Card className="shadow-sm border-0 text-center py-4 bg-white">
                  <Card.Body>
                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Users</h6>
                    <h2 className="display-4 fw-bold text-primary">{totalUsers}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm border-0 text-center py-4 bg-white">
                  <Card.Body>
                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.9rem' }}>Total Jobs</h6>
                    <h2 className="display-4 fw-bold text-primary">{totalJobs}</h2>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm border-0 text-center py-4 bg-white">
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
                        <td colSpan="5" className="text-center py-3">
                          No recent users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
}

export default AdminDashboard;
