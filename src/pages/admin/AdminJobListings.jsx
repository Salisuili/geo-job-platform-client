import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert, Form, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminJobListings() {
    const { token } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // You can adjust this
    const [totalPages, setTotalPages] = useState(0);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
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
    }, [token, searchTerm, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEdit = (jobId) => {
        // Implement edit logic
        console.log("Edit job:", jobId);
        alert(`Implement edit functionality for job ID: ${jobId}`);
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

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Job Listings Management</h2>

            <Form className="mb-4">
                <Form.Group controlId="searchJob">
                    <Form.Control
                        type="text"
                        placeholder="Search by job title or employer name"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
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
                                <th>Location</th>
                                <th>Pay Rate</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Posted At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map(job => (
                                <tr key={job._id}>
                                    <td>{job.title}</td>
                                    <td>{job.employer_name || 'N/A'}</td> {/* Assuming you'll populate employer_name or have a reference */}
                                    <td>{job.city || 'N/A'}</td>
                                    <td>N{job.pay_rate_min} - N{job.pay_rate_max} per {job.pay_type}</td>
                                    <td><Badge bg="info">{job.job_type}</Badge></td>
                                    <td><Badge bg={job.status === 'active' ? 'success' : 'secondary'}>{job.status}</Badge></td>
                                    <td>{new Date(job.posted_at).toLocaleDateString()}</td>
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