// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaChevronLeft, FaChevronRight, FaFilter, FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa'; // Added FaSyncAlt for refresh
import { Container, Form, Button, Card, Accordion, Row, Col, Pagination as BSPagination, Offcanvas, Alert } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_JOB_IMAGE_PATH = '/uploads/geo_job_default.jpg';

function Home() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States
    const [filterLocation, setFilterLocation] = useState('');
    const [filterJobType, setFilterJobType] = useState([]);
    const [filterDatePosted, setFilterDatePosted] = useState('');
    const [filterMinPay, setFilterMinPay] = useState('');
    const [filterMaxPay, setFilterMaxPay] = useState('');

    // Geo-location States
    const [userCoords, setUserCoords] = useState({ latitude: null, longitude: null });
    const [userCityState, setUserCityState] = useState('');
    const [isLocationBasedSearch, setIsLocationBasedSearch] = useState(true); // Default to true for initial geo-search
    const [locationError, setLocationError] = useState(null); // To display geolocation errors

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalJobs, setTotalJobs] = useState(0); // Total jobs from backend for pagination

    // Mobile Filter Visibility State
    const [showOffcanvasFilters, setShowOffcanvasFilters] = useState(false);
    const handleShowOffcanvasFilters = () => setShowOffcanvasFilters(true);
    const handleCloseOffcanvasFilters = () => setShowOffcanvasFilters(false);

    // Function to get user's location and reverse geocode it
    const getUserLocation = useCallback(async () => {
        setLocationError(null); // Clear previous location errors
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserCoords({ latitude, longitude });

                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await response.json();
                        if (data.address) {
                            const city = data.address.city || data.address.town || data.address.village || '';
                            const state = data.address.state || '';
                            setUserCityState(`${city}${city && state ? ', ' : ''}${state}`);
                        } else {
                            setUserCityState('an unknown location'); // Fallback if reverse geocoding fails to find address
                        }
                    } catch (geoError) {
                        console.error("Reverse geocoding error:", geoError);
                        setUserCityState('your location'); // Fallback text
                    }
                    setIsLocationBasedSearch(true); // Ensure location-based search is active if successful
                },
                (error) => {
                    console.error("Error getting user location:", error);
                    let errorMessage = 'Unable to retrieve your location. Showing all jobs instead.';
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = 'Location access denied. Showing all jobs instead.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = 'Location information unavailable. Showing all jobs instead.';
                    }
                    setLocationError(errorMessage);
                    setIsLocationBasedSearch(false); // Disable location-based search if permission denied/error
                    setUserCoords({ latitude: null, longitude: null }); // Clear coordinates
                    setUserCityState(''); // Clear city state
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // maximumAge: 0 forces a fresh lookup
            );
        } else {
            setLocationError('Geolocation is not supported by your browser. Showing all jobs.');
            setIsLocationBasedSearch(false); // Disable location-based search if not supported
            setUserCoords({ latitude: null, longitude: null }); // Clear coordinates
            setUserCityState(''); // Clear city state
        }
    }, []); // No dependencies, as this function is meant to be called to get a fresh location

    // Effect to get user's location on component mount
    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]); // Run once on mount and whenever getUserLocation changes (though it's useCallback, so it won't change often)


    // Function to fetch jobs with filters - wrapped in useCallback for optimization
    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();

            if (filterLocation) {
                params.append('city', filterLocation);
            } else if (isLocationBasedSearch && userCoords.latitude && userCoords.longitude) {
                params.append('lat', userCoords.latitude);
                params.append('long', userCoords.longitude); // Corrected parameter name
                params.append('maxDistance', 50000); // Corrected parameter name (50km radius)
            }

            if (filterJobType.length > 0) {
                params.append('jobType', filterJobType.join(','));
            }
            if (filterDatePosted) params.append('datePosted', filterDatePosted);
            if (filterMinPay) params.append('minPay', filterMinPay);
            if (filterMaxPay) params.append('maxPay', filterMaxPay);

            params.append('page', currentPage);
            params.append('limit', itemsPerPage);

            const queryString = params.toString();
            const response = await fetch(`${API_BASE_URL}/api/jobs?${queryString}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            // Assuming backend returns { jobs: [...], total: N }
            const data = await response.json();
            setJobs(data.jobs || []); // Set the paginated jobs
            setTotalJobs(data.total || 0); // Set the total count for pagination
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [filterLocation, filterJobType, filterDatePosted, filterMinPay, filterMaxPay, currentPage, itemsPerPage, userCoords, isLocationBasedSearch]);

    // Trigger fetchJobs when relevant states change (including geo-location states)
    useEffect(() => {
        // Only fetch jobs if location data is available or if not doing location-based search
        // Also, fetch if a manual filterLocation is set
        if (filterLocation || !isLocationBasedSearch || (userCoords.latitude && userCoords.longitude) || locationError) {
            fetchJobs();
        }
    }, [fetchJobs, isLocationBasedSearch, userCoords, locationError, filterLocation]); // Added filterLocation as dependency


    // Handler for job type checkboxes: adds/removes from filterJobType array
    const handleJobTypeChange = (e) => {
        const { value, checked } = e.target;
        setFilterJobType(prevTypes =>
            checked ? [...prevTypes, value] : prevTypes.filter(type => type !== value)
        );
    };

    // Handler for pagination page change
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Handler for applying filters (button click)
    const handleApplyFilters = () => {
        setCurrentPage(1); // Reset to first page on new filter application
        setIsLocationBasedSearch(false); // Applying manual filters disables geo-location filter
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
        // When clearing filters, re-attempt to get user's location
        getUserLocation(); // This will set isLocationBasedSearch back to true if successful
        handleCloseOffcanvasFilters(); // Close offcanvas after clearing filters on mobile
    };

    // Handler for viewing job details
    const handleViewJob = (jobId) => {
        navigate(`/job/${jobId}`);
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

    const totalPages = Math.ceil(totalJobs / itemsPerPage);


    // Component for the Filter Form (reusable for both desktop and offcanvas)
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
                                placeholder="e.g., Zaria"
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
                    <Col xs={12} className="mb-3 d-lg-none">
                        <Button
                            variant="outline-primary"
                            className="w-100"
                            onClick={handleShowOffcanvasFilters}
                        >
                            <FaFilter className="me-2" /> View Filters
                        </Button>
                    </Col>

                    {/* Filters Column for Desktop */}
                    <Col lg={3} className="d-none d-lg-block">
                        <FilterForm />
                    </Col>

                    {/* Offcanvas for Mobile Filters */}
                    <Offcanvas show={showOffcanvasFilters} onHide={handleCloseOffcanvasFilters} placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Job Filters</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <FilterForm />
                        </Offcanvas.Body>
                    </Offcanvas>

                    {/* Job Listings Column */}
                    <Col lg={9}>
                        <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
                            <h3 className="mb-0 fw-bold">Available Jobs</h3>
                            {isLocationBasedSearch && userCoords.latitude && userCoords.longitude && (
                                <span className="text-muted small mt-2 mt-md-0">
                                    Jobs near {userCityState || 'your location'}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="ms-2 p-0 text-decoration-none"
                                        onClick={() => {
                                            setIsLocationBasedSearch(false);
                                            setFilterLocation(''); // Clear manual location filter too
                                            setUserCoords({ latitude: null, longitude: null }); // Clear geo coords
                                            setUserCityState(''); // Clear displayed city/state
                                            setCurrentPage(1); // Reset pagination
                                            fetchJobs(); // Re-fetch all jobs
                                        }}
                                    >
                                        View All
                                    </Button>
                                </span>
                            )}
                            {!isLocationBasedSearch && (
                                <span className="text-muted small mt-2 mt-md-0">
                                    Displaying all jobs
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="ms-2 p-0 text-decoration-none"
                                        onClick={() => {
                                            // Attempt to re-enable geo-search by getting fresh location
                                            setIsLocationBasedSearch(true);
                                            setFilterLocation(''); // Clear manual location filter
                                            setCurrentPage(1); // Reset pagination
                                            getUserLocation(); // Trigger fresh location lookup
                                        }}
                                    >
                                        Filter by Location
                                    </Button>
                                </span>
                            )}
                            {/* New: Refresh Location Button */}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="ms-auto mt-2 mt-md-0" // Push to right on larger screens
                                onClick={getUserLocation}
                                disabled={loading} // Disable while loading
                            >
                                <FaSyncAlt className="me-1" /> Refresh Location
                            </Button>
                        </div>

                        {locationError && (
                            <Alert variant="info" className="mb-3">
                                <FaMapMarkerAlt className="me-2" />
                                {locationError}
                            </Alert>
                        )}

                        {isLocationBasedSearch && userCoords.latitude && !locationError && (
                            <Alert variant="info" className="mb-3">
                                <FaMapMarkerAlt className="me-2" />
                                Showing jobs near {userCityState || 'your location'}
                            </Alert>
                        )}

                        {loading && <p>Loading jobs...</p>}
                        {error && <p className="text-danger">Error: {error}</p>}
                        {!loading && jobs.length === 0 && <p>No jobs found.</p>}

                        {!loading && !error && jobs.map(job => (
                            <Card key={job._id} className="mb-3 shadow-sm border-0">
                                <Card.Body className="d-flex align-items-start">
                                    <div className="me-3">
                                        <img
                                            src={
                                                job.image_url
                                                    ? (job.image_url === DEFAULT_JOB_IMAGE_PATH || job.image_url.startsWith('/uploads/'))
                                                        ? `${API_BASE_URL}${job.image_url}`
                                                        : `${API_BASE_URL}/uploads/job_images/${job.image_url}` // Fallback for old structure if needed
                                                    : `${API_BASE_URL}${DEFAULT_JOB_IMAGE_PATH}`
                                            }
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
                                            onClick={() => handleViewJob(job._id)}
                                        >
                                            View Job
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center mt-4">
                                <BSPagination>
                                    <BSPagination.Prev
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                    >
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
                                    <BSPagination.Next
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <FaChevronRight />
                                    </BSPagination.Next>
                                </BSPagination>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default Home;
