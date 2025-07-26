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
        if (!user || !user.token) {
            setLoadingData(false); // Ensure loading state is false if no user/token
            return;
        }

        const userToken = user.token;
        setLoadingData(true);
        setError('');

        try {
            const [usersResponse, jobsResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/api/users`, {
                    headers: { 'Authorization': `Bearer ${userToken}` }
                }),
                // Fetch all jobs for dashboard counts, so don't apply pagination limits here
                fetch(`${API_BASE_URL}/api/jobs?limit=10000`, { // Fetch a very high limit to get all jobs
                    headers: { 'Authorization': `Bearer ${userToken}` }
                })
            ]);

            if (!usersResponse.ok) {
                if (usersResponse.status === 401) {
                    logout();
                    throw new Error('Unauthorized access to user data. Please log in again.');
                }
                throw new Error(`Failed to fetch user data: ${usersResponse.statusText}`);
            }

            if (!jobsResponse.ok) {
                if (jobsResponse.status === 401) {
                    logout();
                    throw new Error('Unauthorized access to job data. Please log in again.');
                }
                throw new Error(`Failed to fetch job data: ${jobsResponse.statusText}`);
            }

            const [usersData, jobsData] = await Promise.all([
                usersResponse.json(),
                jobsResponse.json()
            ]);

            // Assuming usersData is still a direct array of users
            setTotalUsers((usersData.length || 0).toLocaleString());
            setRecentUsers(usersData.slice(0, 5));

            // Correctly access jobs and total from jobsData object
            const allJobs = jobsData.jobs || []; // Ensure it's an array, default to empty
            const totalJobsCount = jobsData.total !== undefined ? jobsData.total : allJobs.length; // Use total if provided, else length

            setTotalJobs(totalJobsCount.toLocaleString());
            setActiveJobs(allJobs.filter(job => job.status === 'Active').length.toLocaleString());

        } catch (err) {
            console.error("Error fetching admin dashboard data:", err);
            setError(err.message || 'Failed to load dashboard data.');
        } finally {
            setLoadingData(false);
        }
    }, [user, logout]);

    useEffect(() => {
        // Only fetch if auth is not loading, user exists, has a token, and is an admin
        if (!authLoading && user && user.token && user.user_type === 'admin') {
            fetchAdminData();
        } else if (!authLoading && (!user || user.user_type !== 'admin')) {
            // If not admin, or no user after auth loading, redirect or show unauthorized message
            setError('You are not authorized to view this page.');
            setLoadingData(false);
            // Optionally redirect to home or login: navigate('/');
        }
    }, [user, authLoading, fetchAdminData]);

    const handleViewAction = (userId) => {
        console.log(`View action clicked for user ID: ${userId}`);
        // Implement navigation to user detail page or modal here
        // navigate(`/admin/users/${userId}`);
    };

    if (authLoading || loadingData) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="ms-2">Loading admin dashboard data...</p>
            </div>
        );
    }

    // If not an admin after loading, show unauthorized message
    if (!user || user.user_type !== 'admin') {
        return (
            <Container fluid className="py-4 px-3 px-md-5 bg-white rounded shadow-sm">
                <Alert variant="danger">
                    You are not authorized to view this page.
                </Alert>
            </Container>
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
                                                    <td className="text-truncate" style={{ maxWidth: '120px' }}>{userItem._id}</td>
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
