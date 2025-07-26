import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_JOB_IMAGE_PATH = '/uploads/geo_job_default.jpg'; // Assuming a default image path

function AdminJobListings() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterStatus) params.append('status', filterStatus);
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            const response = await fetch(`${API_BASE_URL}/api/admin/jobs?${params.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setJobs(data.jobs);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, filterStatus, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handleStatusFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setCurrentPage(1); // Reset to first page on new filter
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEdit = (jobId) => {
        navigate(`/admin/job-listings/edit/${jobId}`); // Navigate to the new AdminEditJob page
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm("Are you sure you want to delete this job listing?")) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            setJobs(prevJobs => prevJobs.filter(job => job._id !== jobId));
            alert("Job listing deleted successfully!");
        } catch (err) {
            setError(err.message);
            console.error("Failed to delete job:", err);
            alert(`Error deleting job: ${err.message}`);
        }
    };

    const timeAgo = (dateString) => {
        if (!dateString) return 'N/A';
        const now = new Date();
        const postedDate = new Date(dateString);
        const seconds = Math.floor((now - postedDate) / 1000);

        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return "just now";
    };

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Job Listings Management</h2>

            <Form className="mb-4">
                <Form.Group controlId="searchJob" className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search by title, description, or city"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Form.Group>
                <Form.Group controlId="filterStatus">
                    <Form.Label>Filter by Status:</Form.Label>
                    <Form.Control
                        as="select"
                        value={filterStatus}
                        onChange={handleStatusFilterChange}
                    >
                        <option value="">All</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Closed">Closed</option>
                    </Form.Control>
                </Form.Group>
            </Form>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">Error: {error}</Alert>}

            {!loading && jobs.length === 0 && !error && <Alert variant="info">No job listings found.</Alert>}

            {!loading && jobs.length > 0 && (
                <>
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead className="bg-light">
                            <tr>
                                <th>Title</th>
                                <th>Employer</th>
                                <th>Type</th>
                                <th>Location</th>
                                <th>Pay</th>
                                <th>Status</th>
                                <th>Posted</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job._id}>
                                    <td>{job.title}</td>
                                    <td>{job.employer_id?.company_name || job.employer_id?.email || 'N/A'}</td>
                                    <td>{job.job_type}</td>
                                    <td>{job.city || job.location?.city || 'N/A'}</td>
                                    <td>N{job.pay_rate_min} - N{job.pay_rate_max} per {job.pay_type}</td>
                                    <td>{job.status}</td>
                                    <td>{timeAgo(job.createdAt)}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(job._id)}>
                                            <FaEdit /> Edit
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(job._id)}>
                                            <FaTrash /> Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-center mt-4">
                        <Button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="me-2"
                        >
                            Previous
                        </Button>
                        <span>Page {currentPage} of {totalPages}</span>
                        <Button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="ms-2"
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}
        </Container>
    );
}

export default AdminJobListings;
