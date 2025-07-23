import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaChevronLeft, FaChevronRight, FaFilter } from 'react-icons/fa'; // Added FaFilter icon for mobile button
import { Container, Form, Button, Card, Accordion, Row, Col, Pagination as BSPagination, Offcanvas } from 'react-bootstrap'; // Added Offcanvas

import defaultJobImage from '../job.avif'; // Ensure this path is correct
const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function Home() {
    const navigate = useNavigate(); // Initialize useNavigate
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [filterLocation, setFilterLocation] = useState('');
    const [filterJobType, setFilterJobType] = useState([]); // Array to store selected job types (e.g., ['Full-time', 'Part-time'])
    const [filterDatePosted, setFilterDatePosted] = useState('');
    const [filterMinPay, setFilterMinPay] = useState('');
    const [filterMaxPay, setFilterMaxPay] = useState('');

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // You can adjust this value

    // Mobile Filter Visibility State
    const [showOffcanvasFilters, setShowOffcanvasFilters] = useState(false);
    const handleShowOffcanvasFilters = () => setShowOffcanvasFilters(true);
    const handleCloseOffcanvasFilters = () => setShowOffcanvasFilters(false);


    // Function to fetch jobs with filters - wrapped in useCallback for optimization
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Build query parameters based on current filter states
            const params = new URLSearchParams();
            if (filterLocation) params.append('city', filterLocation);

            // Join selected job types with a comma for the backend
            if (filterJobType.length > 0) {
                params.append('jobType', filterJobType.join(','));
            }

            if (filterDatePosted) params.append('datePosted', filterDatePosted);
            if (filterMinPay) params.append('minPay', filterMinPay);
            if (filterMaxPay) params.append('maxPay', filterMaxPay);

            // Add pagination parameters
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            const queryString = params.toString();
            const response = await fetch(`${API_BASE_URL}/api/jobs?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setJobs(data); // Assuming data is already paginated by the backend, or you'll paginate here
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [filterLocation, filterJobType, filterDatePosted, filterMinPay, filterMaxPay, currentPage, itemsPerPage]); // Dependencies for useCallback


    // Initial fetch on component mount and re-fetch when filter states change
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]); // Depend on fetchJobs to trigger re-fetch when dependencies of fetchJobs change


    // Handler for job type checkboxes: adds/removes from filterJobType array
    const handleJobTypeChange = (e) => {
        const { value, checked } = e.target;
        if (checked) {
            setFilterJobType(prevTypes => [...prevTypes, value]);
        } else {
            setFilterJobType(prevTypes => prevTypes.filter(type => type !== value));
        }
    };

    // Handler for pagination page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handler for applying filters (button click)
    const handleApplyFilters = () => {
        setCurrentPage(1); // Reset to first page on new filter application
        fetchJobs(); // Trigger a re-fetch with current filter states
        handleCloseOffcanvasFilters(); // Close offcanvas after applying filters on mobile
    };

    // Handler for clearing filters
    const handleClearFilters = () => {
        setFilterLocation('');
        setFilterJobType([]);
        setFilterDatePosted('');
        setFilterMinPay('');
        setFilterMaxPay('');
        setCurrentPage(1); // Reset to first page on clear filters
        // No need for setTimeout here, as fetchJobs() is triggered by state updates via useEffect.
        // However, if you want an immediate clear without waiting for useEffect, you could call
        // fetchJobs() directly after resetting states, but ensure it receives empty params.
        // For now, relying on useEffect is cleaner if it always watches filter states.
        // If fetchJobs's dependency array includes the filter states, it will re-run automatically.
        // So, resetting the states is enough.
        handleCloseOffcanvasFilters(); // Close offcanvas after clearing filters on mobile
    };

    // Handler for viewing job details
    const handleViewJob = (jobId) => {
        navigate(`/job/${jobId}`);
    };

    // Helper to format date
    const formatDate = (isoString) => {
        if (!isoString) return 'Date not available';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Helper to display time ago (simple version, can be made more robust)
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

    // Calculate total pages
    const totalPages = Math.ceil(jobs.length / itemsPerPage);
    const currentJobs = jobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    // Component for the Filter Form (reusable for both desktop and offcanvas)
    // No need for `onClose` prop as `handleApplyFilters` and `handleClearFilters`
    // directly call `handleCloseOffcanvasFilters`.
    const FilterForm = () => (
        <Card className="mb-4 shadow-sm border-0">
            <Card.Body>
                <h5 className="mb-3">Filters</h5>
                <Accordion defaultActiveKey={['0', '1', '2', '3']} alwaysOpen>
                    <Accordion.Item eventKey="0">
                        <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Job Type</Accordion.Header>
                        <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                            <Form.Group controlId="jobTypeFullTime" className="mb-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Full-time"
                                    value="Full-time"
                                    checked={filterJobType.includes('Full-time')}
                                    onChange={handleJobTypeChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="jobTypePartTime" className="mb-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Part-time"
                                    value="Part-time"
                                    checked={filterJobType.includes('Part-time')}
                                    onChange={handleJobTypeChange}
                                />
                            </Form.Group>
                            <Form.Group controlId="jobTypeContract" className="mb-2">
                                <Form.Check
                                    type="checkbox"
                                    label="Contract"
                                    value="Contract"
                                    checked={filterJobType.includes('Contract')}
                                    onChange={handleJobTypeChange}
                                />
                            </Form.Group>
                        </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="1">
                        <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Location</Accordion.Header>
                        <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                            <Form.Control
                                type="text"
                                placeholder="e.g., New York"
                                value={filterLocation}
                                onChange={(e) => setFilterLocation(e.target.value)}
                            />
                        </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="2">
                        <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Date Posted</Accordion.Header>
                        <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                            <Form.Group controlId="datePosted">
                                <Form.Select
                                    value={filterDatePosted}
                                    onChange={(e) => setFilterDatePosted(e.target.value)}
                                >
                                    <option value="">Any Time</option>
                                    <option value="24h">Last 24 hours</option>
                                    <option value="3d">Last 3 days</option>
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                </Form.Select>
                            </Form.Group>
                        </Accordion.Body>
                    </Accordion.Item>

                    <Accordion.Item eventKey="3">
                        <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Pay Rate</Accordion.Header>
                        <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                            <Form.Control
                                type="number"
                                placeholder="Min Pay"
                                className="mb-2"
                                value={filterMinPay}
                                onChange={(e) => setFilterMinPay(e.target.value)}
                            />
                            <Form.Control
                                type="number"
                                placeholder="Max Pay"
                                value={filterMaxPay}
                                onChange={(e) => setFilterMaxPay(e.target.value)}
                            />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

                <Button
                    variant="primary"
                    className="w-100 mt-4"
                    style={{ backgroundColor: '#0d6efd', borderColor: '#0d6efd' }}
                    onClick={handleApplyFilters}
                >
                    Apply Filters
                </Button>
                <Button
                    variant="outline-secondary"
                    className="w-100 mt-2"
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </Button>
            </Card.Body>
        </Card>
    );


    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            {/* Main Content */}
            <Container fluid className="my-4">
                <Row>
                    {/* Filter Toggle Button for Mobile */}
                    <Col xs={12} className="mb-3 d-lg-none"> {/* Visible only on small screens */}
                        <Button
                            variant="outline-primary"
                            className="w-100"
                            onClick={handleShowOffcanvasFilters}
                        >
                            <FaFilter className="me-2" /> View Filters
                        </Button>
                    </Col>

                    {/* Filters Column for Desktop */}
                    <Col lg={3} className="d-none d-lg-block"> {/* Hidden on small, visible on large */}
                        <FilterForm />
                    </Col>

                    {/* Offcanvas for Mobile Filters */}
                    <Offcanvas show={showOffcanvasFilters} onHide={handleCloseOffcanvasFilters} placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Job Filters</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <FilterForm /> {/* Render the filter form inside the Offcanvas */}
                        </Offcanvas.Body>
                    </Offcanvas>

                    {/* Job Listings Column */}
                    <Col lg={9}>
                        <h3 className="mb-3">Available Jobs</h3>

                        {loading && <p>Loading jobs...</p>}
                        {error && <p className="text-danger">Error: {error}</p>}
                        {!loading && jobs.length === 0 && <p>No jobs found.</p>}

                        {!loading && !error && currentJobs.map(job => ( // Changed jobs to currentJobs
                            <Card key={job._id} className="mb-3 shadow-sm border-0">
                                <Card.Body className="d-flex align-items-start">
                                    <div className="me-3">
                                        <img
                                            src={job.image_url ? `${API_BASE_URL}${job.image_url}` : defaultJobImage}
                                            alt={job.title}
                                            className="rounded"
                                            style={{ width: '150px', height: '100px', objectFit: 'cover' }}
                                        />
                                    </div>
                                    <div>
                                        <Card.Text className="text-muted mb-1" style={{ fontSize: '0.85rem' }}>
                                            Posted {timeAgo(job.posted_at)} in {job.location?.address_text || job.city || 'N/A'}
                                        </Card.Text>
                                        <Card.Title className="mb-2 h5">{job.title}</Card.Title>
                                        <Card.Text className="text-secondary mb-1">
                                            {job.description}
                                        </Card.Text>
                                        <Card.Text className="text-primary fw-bold mb-3">
                                            Pay: N{job.pay_rate_min} - N{job.pay_rate_max} per {job.pay_type}
                                        </Card.Text>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => handleViewJob(job._id)} // Added onClick handler
                                        >
                                            View Job
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        {/* Pagination */}
                        <div className="d-flex justify-content-center mt-4">
                            <BSPagination>
                                <BSPagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                    <FaChevronLeft />
                                </BSPagination.Prev>
                                {[...Array(totalPages)].map((_, index) => (
                                    <BSPagination.Item
                                        key={index + 1}
                                        active={index + 1 === currentPage}
                                        onClick={() => handlePageChange(index + 1)}
                                    >
                                        {index + 1}
                                    </BSPagination.Item>
                                ))}
                                <BSPagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                    <FaChevronRight />
                                </BSPagination.Next>
                            </BSPagination>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Home;