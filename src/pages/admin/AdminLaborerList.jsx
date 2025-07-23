import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import { FaEdit, FaTrash } from 'react-icons/fa'; // Import icons

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function AdminLaborerList() {
    const { token } = useAuth();
    const [laborers, setLaborers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // You can adjust this
    const [totalPages, setTotalPages] = useState(0);

    const fetchLaborers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            const response = await fetch(`${API_BASE_URL}/api/admin/laborers?${params.toString()}`, {
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
            setLaborers(data.laborers);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch laborers:", err);
        } finally {
            setLoading(false);
        }
    }, [token, searchTerm, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchLaborers();
    }, [fetchLaborers]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleEdit = (laborerId) => {
        // Implement edit logic
        console.log("Edit laborer:", laborerId);
        alert(`Implement edit functionality for laborer ID: ${laborerId}`);
    };

    const handleDelete = async (laborerId) => {
        if (!window.confirm("Are you sure you want to delete this laborer?")) {
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/api/admin/laborers/${laborerId}`, {
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

            setLaborers(prevLaborers => prevLaborers.filter(laborer => laborer._id !== laborerId));
            alert("Laborer deleted successfully!");
        } catch (err) {
            setError(err.message);
            console.error("Failed to delete laborer:", err);
            alert(`Error deleting laborer: ${err.message}`);
        }
    };

    return (
        <Container fluid className="p-4">
            <h2 className="mb-4">Laborer Management</h2>

            <Form className="mb-4">
                <Form.Group controlId="searchLaborer">
                    <Form.Control
                        type="text"
                        placeholder="Search by full name or email"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </Form.Group>
            </Form>

            {loading && <div className="text-center"><Spinner animation="border" /></div>}
            {error && <Alert variant="danger">Error: {error}</Alert>}

            {!loading && laborers.length === 0 && !error && <Alert variant="info">No laborers found.</Alert>}

            {!loading && laborers.length > 0 && (
                <>
                    <Table striped bordered hover responsive className="shadow-sm">
                        <thead className="bg-light">
                            <tr>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Skills</th>
                                <th>Approved</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {laborers.map(laborer => (
                                <tr key={laborer._id}>
                                    <td>{laborer.full_name}</td>
                                    <td>{laborer.email}</td>
                                    <td>{laborer.phone_number}</td>
                                    <td>{laborer.skills && laborer.skills.length > 0 ? laborer.skills.join(', ') : 'N/A'}</td>
                                    <td>{laborer.is_approved ? 'Yes' : 'No'}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(laborer._id)}>
                                            <FaEdit /> Edit
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(laborer._id)}>
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

export default AdminLaborerList;