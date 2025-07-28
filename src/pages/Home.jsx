import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaChevronLeft, FaChevronRight, FaFilter, FaMapMarkerAlt, FaSyncAlt } from 'react-icons/fa';
import { Container, Form, Button, Card, Accordion, Row, Col, Pagination as BSPagination, Offcanvas, Alert } from 'react-bootstrap';

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;
const DEFAULT_JOB_IMAGE_PATH = '/uploads/geo_job_default.jpg';

// Define FilterForm outside the Home component or memoize it correctly.
// We will memoize it here.
const FilterForm = React.memo(({
    filterLocationInput, handleLocationInputChange,
    filterMinPayInput, handleMinPayInputChange,
    filterMaxPayInput, handleMaxPayInputChange,
    filterJobType, handleJobTypeChange,
    filterDatePosted, handleDatePostedChange,
    filterPayType, handlePayTypeChange,
    handleApplyFilters, handleClearFilters
}) => (
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
                        <Form.Group controlId="jobTypeTemporary" className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="Temporary"
                                value="Temporary"
                                checked={filterJobType.includes('Temporary')}
                                onChange={handleJobTypeChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="jobTypeSeasonal" className="mb-2">
                            <Form.Check
                                type="checkbox"
                                label="Seasonal"
                                value="Seasonal"
                                checked={filterJobType.includes('Seasonal')}
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
                            value={filterLocationInput}
                            onChange={handleLocationInputChange}
                        />
                    </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2">
                    <Accordion.Header style={{ padding: '0', fontWeight: '500' }}>Date Posted</Accordion.Header>
                    <Accordion.Body style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
                        <Form.Group controlId="datePosted">
                            <Form.Select
                                value={filterDatePosted}
                                onChange={handleDatePostedChange}
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
                            value={filterMinPayInput}
                            onChange={handleMinPayInputChange}
                        />
                        <Form.Control
                            type="number"
                            placeholder="Max Pay"
                            value={filterMaxPayInput}
                            onChange={handleMaxPayInputChange}
                        />

                        <Form.Select
                            className="mt-2"
                            value={filterPayType}
                            onChange={handlePayTypeChange}
                        >
                            <option value="">Any Pay Type</option>
                            <option value="Hourly">Hourly</option>
                            <option value="Fixed Price">Fixed Price</option>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </Form.Select>
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
));


function Home() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter States (these are the *debounced* states that trigger API calls)
    const [filterLocation, setFilterLocation] = useState('');
    const [filterJobType, setFilterJobType] = useState([]);
    const [filterDatePosted, setFilterDatePosted] = useState('');
    const [filterMinPay, setFilterMinPay] = useState('');
    const [filterMaxPay, setFilterMaxPay] = useState('');
    const [filterPayType, setFilterPayType] = useState('');

    // Input Buffer States (these update immediately as user types)
    const [filterLocationInput, setFilterLocationInput] = useState('');
    const [filterMinPayInput, setFilterMinPayInput] = useState('');
    const [filterMaxPayInput, setFilterMaxPayInput] = useState('');

    // Geo-location States
    const [userCoords, setUserCoords] = useState({ latitude: null, longitude: null });
    const [userCityState, setUserCityState] = useState('');
    const [isLocationBasedSearch, setIsLocationBasedSearch] = useState(true);
    const [locationError, setLocationError] = useState(null);

    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [totalJobs, setTotalJobs] = useState(0);

    // Mobile Filter Visibility State
    const [showOffcanvasFilters, setShowOffcanvasFilters] = useState(false);
    const handleShowOffcanvasFilters = () => setShowOffcanvasFilters(true);
    const handleCloseOffcanvasFilters = () => setShowOffcanvasFilters(false);

    // Debounce refs
    const locationDebounceRef = useRef(null);
    const minPayDebounceRef = useRef(null);
    const maxPayDebounceRef = useRef(null);

    const getUserLocation = useCallback(async () => {
        setLocationError(null);
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
                            setUserCityState('an unknown location');
                        }
                    } catch (geoError) {
                        console.error("Reverse geocoding error:", geoError);
                        setUserCityState('your location');
                    }
                    setIsLocationBasedSearch(true);
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
                    setIsLocationBasedSearch(false);
                    setUserCoords({ latitude: null, longitude: null });
                    setUserCityState('');
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationError('Geolocation is not supported by your browser. Showing all jobs.');
            setIsLocationBasedSearch(false);
            setUserCoords({ latitude: null, longitude: null });
            setUserCityState('');
        }
    }, []);

    useEffect(() => {
        getUserLocation();
    }, [getUserLocation]);

    // Debounce effect for location input
    useEffect(() => {
        if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
        locationDebounceRef.current = setTimeout(() => {
            setFilterLocation(filterLocationInput);
            setCurrentPage(1); // Reset page when filter changes
            // Only set to false if the user *explicitly* typed in the location field
            if (filterLocationInput) {
                setIsLocationBasedSearch(false);
            }
        }, 500);
        // Clean up on unmount or if filterLocationInput changes again before timeout
        return () => {
            if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
        };
    }, [filterLocationInput]);

    // Debounce effect for min pay input
    useEffect(() => {
        if (minPayDebounceRef.current) clearTimeout(minPayDebounceRef.current);
        minPayDebounceRef.current = setTimeout(() => {
            setFilterMinPay(filterMinPayInput);
            setCurrentPage(1); // Reset page when filter changes
        }, 500);
        return () => {
            if (minPayDebounceRef.current) clearTimeout(minPayDebounceRef.current);
        };
    }, [filterMinPayInput]);

    // Debounce effect for max pay input
    useEffect(() => {
        if (maxPayDebounceRef.current) clearTimeout(maxPayDebounceRef.current);
        maxPayDebounceRef.current = setTimeout(() => {
            setFilterMaxPay(filterMaxPayInput);
            setCurrentPage(1); // Reset page when filter changes
        }, 500);
        return () => {
            if (maxPayDebounceRef.current) clearTimeout(maxPayDebounceRef.current);
        };
    }, [filterMaxPayInput]);


    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filterLocation) {
                params.append('city', filterLocation);
            } else if (isLocationBasedSearch && userCoords.latitude && userCoords.longitude) {
                params.append('lat', userCoords.latitude);
                params.append('long', userCoords.longitude);
                params.append('maxDistance', 50000);
            }
            if (filterJobType.length > 0) {
                params.append('jobType', filterJobType.join(','));
            }
            if (filterDatePosted) params.append('datePosted', filterDatePosted);
            if (filterMinPay) params.append('minPay', filterMinPay);
            if (filterMaxPay) params.append('maxPay', filterMaxPay);
            if (filterPayType) params.append('payType', filterPayType);
            params.append('page', currentPage);
            params.append('limit', itemsPerPage);
            const response = await fetch(`${API_BASE_URL}/api/jobs?${params.toString()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setJobs(data.jobs || []);
            setTotalJobs(data.total || 0);
        } catch (err) {
            setError(err.message);
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    }, [filterLocation, filterJobType, filterDatePosted, filterMinPay, filterMaxPay, filterPayType, currentPage, itemsPerPage, userCoords, isLocationBasedSearch]);

    // This useEffect will now properly react to changes in *debounced* filter states
    // and other non-debounced filter states
    useEffect(() => {
        // Only fetch jobs if location is determined or explicitly not needed
        if (!isLocationBasedSearch || (userCoords.latitude && userCoords.longitude) || locationError) {
            fetchJobs();
        }
    }, [fetchJobs, isLocationBasedSearch, userCoords.latitude, userCoords.longitude, locationError]); // Removed filterJobType, filterDatePosted, filterPayType, filterLocation, filterMinPay, filterMaxPay from here. `fetchJobs` already has them as dependencies.


    // Handlers for input fields should *only* update their respective input buffer states
    const handleLocationInputChange = useCallback((e) => {
        setFilterLocationInput(e.target.value);
    }, []);

    const handleMinPayInputChange = useCallback((e) => {
        setFilterMinPayInput(e.target.value);
    }, []);

    const handleMaxPayInputChange = useCallback((e) => {
        setFilterMaxPayInput(e.target.value);
    }, []);

    // Handler for job type checkboxes
    const handleJobTypeChange = useCallback((e) => {
        const { value, checked } = e.target;
        setFilterJobType(prevTypes =>
            checked ? [...prevTypes, value] : prevTypes.filter(type => type !== value)
        );
        setCurrentPage(1); // Reset page when job type filter changes
    }, []);

    // Handler for date posted select
    const handleDatePostedChange = useCallback((e) => {
        setFilterDatePosted(e.target.value);
        setCurrentPage(1); // Reset page when date posted filter changes
    }, []);

    // Handler for pay type select
    const handlePayTypeChange = useCallback((e) => {
        setFilterPayType(e.target.value);
        setCurrentPage(1); // Reset page when pay type filter changes
    }, []);

    // Handler for pagination page change
    const handlePageChange = useCallback((pageNumber) => {
        setCurrentPage(pageNumber);
    }, []);

    // Handler for applying filters (only relevant for mobile offcanvas,
    // as debounced inputs apply automatically)
    const handleApplyFilters = useCallback(() => {
        // The debounced filters (filterLocation, filterMinPay, filterMaxPay)
        // are already handled by their respective useEffects.
        // For other filters like jobType, datePosted, payType, their handlers already
        // set the state and trigger fetchJobs via useEffect.
        // We just need to ensure the currentPage is reset if this button is truly meant to "apply"
        // and potentially close the offcanvas.
        setCurrentPage(1);
        handleCloseOffcanvasFilters();
        // No explicit fetchJobs() call needed here as state updates will trigger it
    }, [handleCloseOffcanvasFilters]); // Added handleCloseOffcanvasFilters as dependency

    // Handler for clearing filters
    const handleClearFilters = useCallback(() => {
        setFilterLocationInput(''); // Clear input buffer
        setFilterLocation(''); // Clear debounced filter
        setFilterJobType([]);
        setFilterDatePosted('');
        setFilterMinPayInput(''); // Clear input buffer
        setFilterMinPay(''); // Clear debounced filter
        setFilterMaxPayInput(''); // Clear input buffer
        setFilterMaxPay(''); // Clear debounced filter
        setFilterPayType('');
        setCurrentPage(1);
        getUserLocation(); // Re-enable location-based search
        handleCloseOffcanvasFilters();
    }, [getUserLocation, handleCloseOffcanvasFilters]); // Added getUserLocation and handleCloseOffcanvasFilters as dependencies


    // Handler for viewing job details
    const handleViewJob = useCallback((jobId) => {
        navigate(`/job/${jobId}`);
    }, [navigate]);

    // Helper to display time ago
    const timeAgo = useCallback((dateString) => {
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
    }, []);

    const totalPages = Math.ceil(totalJobs / itemsPerPage);

    return (
        <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <Container fluid className="my-4">
                <Row>
                    {/* Mobile Filter Button - Show on small and medium screens */}
                    <Col xs={12} className="mb-3 d-xl-none">
                        <Button
                            variant="outline-primary"
                            className="w-100"
                            onClick={handleShowOffcanvasFilters}
                        >
                            <FaFilter className="me-2" /> View Filters
                        </Button>
                    </Col>

                    {/* Desktop Filter Form - Only visible on extra large screens */}
                    <Col xl={3} className="d-none d-xl-block">
                        <FilterForm
                            filterLocationInput={filterLocationInput}
                            handleLocationInputChange={handleLocationInputChange}
                            filterMinPayInput={filterMinPayInput}
                            handleMinPayInputChange={handleMinPayInputChange}
                            filterMaxPayInput={filterMaxPayInput}
                            handleMaxPayInputChange={handleMaxPayInputChange}
                            filterJobType={filterJobType}
                            handleJobTypeChange={handleJobTypeChange}
                            filterDatePosted={filterDatePosted}
                            handleDatePostedChange={handleDatePostedChange}
                            filterPayType={filterPayType}
                            handlePayTypeChange={handlePayTypeChange}
                            handleApplyFilters={handleApplyFilters}
                            handleClearFilters={handleClearFilters}
                        />
                    </Col>

                    {/* Mobile Filter Offcanvas */}
                    <Offcanvas show={showOffcanvasFilters} onHide={handleCloseOffcanvasFilters} placement="start">
                        <Offcanvas.Header closeButton>
                            <Offcanvas.Title>Job Filters</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <FilterForm
                                filterLocationInput={filterLocationInput}
                                handleLocationInputChange={handleLocationInputChange}
                                filterMinPayInput={filterMinPayInput}
                                handleMinPayInputChange={handleMinPayInputChange}
                                filterMaxPayInput={filterMaxPayInput}
                                handleMaxPayInputChange={handleMaxPayInputChange}
                                filterJobType={filterJobType}
                                handleJobTypeChange={handleJobTypeChange}
                                filterDatePosted={filterDatePosted}
                                handleDatePostedChange={handleDatePostedChange}
                                filterPayType={filterPayType}
                                handlePayTypeChange={handlePayTypeChange}
                                handleApplyFilters={handleApplyFilters}
                                handleClearFilters={handleClearFilters}
                            />
                        </Offcanvas.Body>
                    </Offcanvas>

                    <Col xl={9}>
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
                                            setFilterLocationInput(''); // Clear input buffer
                                            setFilterLocation(''); // Clear debounced filter
                                            setUserCoords({ latitude: null, longitude: null });
                                            setUserCityState('');
                                            setCurrentPage(1);
                                            // fetchJobs() will be triggered by filterLocation change
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
                                            setIsLocationBasedSearch(true);
                                            setFilterLocationInput(''); // Clear input buffer
                                            setFilterLocation(''); // Clear debounced filter (important to avoid conflicting with geo)
                                            setCurrentPage(1);
                                            getUserLocation();
                                        }}
                                    >
                                        Filter by Location
                                    </Button>
                                </span>
                            )}
                            <Button
                                variant="outline-secondary"
                                size="sm"
                                className="ms-auto mt-2 mt-md-0"
                                onClick={getUserLocation}
                                disabled={loading}
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
                                                        : `${API_BASE_URL}/uploads/job_images/${job.image_url}`
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