import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminEmployerList() {
    const { token } = useAuth();
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // You can adjust this
    const [totalPages, setTotalPages] = useState(0);

    const fetchEmployers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            const response = await fetch(`${API_BASE_URL}/api/admin/employers?${params.toString()}`, {
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
            setEmployers(data.employers);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch employers:", err);
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchEmployers();
    }, [fetchEmployers]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEdit = (employerId) => {
        // Implement edit logic, e.g., navigate to an edit page or open a modal
        console.log("Edit employer:", employerId);
        alert(`Implement edit functionality for employer ID: ${employerId}`);
    };

    const handleDelete = async (employerId) => {
        if (!window.confirm("Are you sure you want to delete this employer?")) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/employers/${employerId}`, {
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

            setEmployers(prevEmployers => prevEmployers.filter(employer => employer._id !== employerId));
            alert("Employer deleted successfully!");
        } catch (err) {
            setError(err.message);
            console.error("Failed to delete employer:", err);
            alert(`Error deleting employer: ${err.message}`);
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Employer Management</h2>

            <Form className="mb-4">
                <Form.Group controlId="searchEmployer">
                    <Form.Control
                        type="text"
                        placeholder="Search by company name or email"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Form.Group>
            </Form>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">Error: {error}</Alert>}

            {!loading && employers.length === 0 && !error && <Alert variant="info">No employers found.</Alert>}

            {!loading && employers.length > 0 && (
                <>
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead className="bg-light">
                            <tr>
                                <th>Company Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Approved</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employers.map(employer => (
                                <tr key={employer._id}>
                                    <td>{employer.company_name}</td>
                                    <td>{employer.email}</td>
                                    <td>{employer.phone_number}</td>
                                    <td>{employer.address_text || 'N/A'}</td>
                                    <td>{employer.is_approved ? 'Yes' : 'No'}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(employer._id)}>
                                            <FaEdit /> Edit
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(employer._id)}>
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

export default AdminEmployerList;