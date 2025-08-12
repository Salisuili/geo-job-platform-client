// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, InputGroup, Row, Col } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Icons for password visibility

const API_BASE_URL = process.env.REACT_APP_BACKEND_API_URL;

function EditProfileModal({ show, handleClose, profileData, onSaveSuccess }) {
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone_number: '', 
    bio: '',
    hourly_rate: '',
    skills: '', // Will be a comma-separated string for input
    company_name: '',
    company_description: '',
    is_available: true,
    // Password fields are separate as they are optional and sensitive
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(''); // For image preview
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false); // For newPassword visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // For confirmNewPassword visibility

  useEffect(() => {
    if (profileData) {
      setFormData({
        full_name: profileData.full_name || '',
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        // Conditional fields based on user_type
        bio: profileData.user_type === 'laborer' ? (profileData.bio || '') : '',
        hourly_rate: profileData.user_type === 'laborer' ? (profileData.hourly_rate || '') : '',
        skills: profileData.user_type === 'laborer' && Array.isArray(profileData.skills) ? profileData.skills.join(', ') : '',
        is_available: profileData.user_type === 'laborer' ? (profileData.is_available ?? true) : true,
        company_name: profileData.user_type === 'employer' ? (profileData.company_name || '') : '',
        company_description: profileData.user_type === 'employer' ? (profileData.company_description || '') : '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      // Set initial preview image if existing profile picture
      if (profileData.profile_picture_url) {
        setPreviewImage(`${API_BASE_URL}${profileData.profile_picture_url.startsWith('/uploads/') ? profileData.profile_picture_url : `/uploads/profile_pictures/${profileData.profile_picture_url.split('/').pop()}`}`);
      } else {
        setPreviewImage('');
      }
      setProfilePictureFile(null); // Clear any previously selected file
      setError(null); // Clear errors when modal opens/data changes
      setSuccess(null); // Clear success message
    }
  }, [profileData, show]); // Reset form when profileData changes or modal is shown/hidden

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setPreviewImage(URL.createObjectURL(file)); // Create a local URL for preview
    } else {
      setProfilePictureFile(null);
      setPreviewImage(profileData?.profile_picture_url ? `${API_BASE_URL}${profileData.profile_picture_url.startsWith('/uploads/') ? profileData.profile_picture_url : `/uploads/profile_pictures/${profileData.profile_picture_url.split('/').pop()}`}` : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('New password and confirm new password do not match.');
        setLoading(false);
        return;
      }
    }

    const data = new FormData();
    data.append('full_name', formData.full_name);
    data.append('email', formData.email);
    if (formData.phone_number) data.append('phone_number', formData.phone_number);

    // Use optional chaining here as well for safety
    if (profileData?.user_type === 'laborer') {
      if (formData.bio) data.append('bio', formData.bio);
      if (formData.hourly_rate) data.append('hourly_rate', formData.hourly_rate);
      if (formData.skills) data.append('skills', JSON.stringify(formData.skills.split(',').map(s => s.trim()).filter(s => s))); // Send skills as JSON array string
      data.append('is_available', formData.is_available);
    } else if (profileData?.user_type === 'employer') {
      if (formData.company_name) data.append('company_name', formData.company_name);
      if (formData.company_description) data.append('company_description', formData.company_description);
    }

    if (profilePictureFile) {
      data.append('profile_picture', profilePictureFile); // 'profile_picture' must match the fieldname in multer config
    }

    if (formData.newPassword) {
      data.append('password', formData.newPassword); // Send new password for hashing
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data' is NOT set here.
          // Fetch API automatically sets it when FormData is used.
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile.');
      }

      setSuccess('Profile updated successfully!');
      // Optionally clear password fields after success
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmNewPassword: '' }));
      onSaveSuccess(); // Trigger parent component to re-fetch profile data
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3 align-items-center">
            <Col md={3}>
              <Form.Label>Profile Picture</Form.Label>
            </Col>
            <Col md={9}>
              <div className="d-flex align-items-center">
                <img
                  src={previewImage || `https://via.placeholder.com/60x60?text=${profileData?.full_name?.charAt(0) || 'U'}`}
                  alt="Profile Preview"
                  className="rounded-circle me-3"
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                />
                <Form.Control
                  type="file"
                  name="profile_picture"
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="w-auto"
                />
              </div>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="formFullName">
            <Form.Label>Full Name</Form.Label>
            <Form.Control
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formPhoneNumber">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phone_number"
              value={formData.phone_number}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </Form.Group>

          {profileData?.user_type === 'laborer' && ( // Added optional chaining
            <>
              <Form.Group className="mb-3" controlId="formBio">
                <Form.Label>Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formHourlyRate">
                <Form.Label>Hourly Rate (₦)</Form.Label>
                <Form.Control
                  type="number"
                  name="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  placeholder="Enter hourly rate"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formSkills">
                <Form.Label>Skills (comma-separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., Plumbing, Electrical, Carpentry"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formIsAvailable">
                <Form.Check
                  type="checkbox"
                  name="is_available"
                  label="Available for work"
                  checked={formData.is_available}
                  onChange={handleChange}
                />
              </Form.Group>
            </>
          )}

          {profileData?.user_type === 'employer' && ( // Added optional chaining
            <>
              <Form.Group className="mb-3" controlId="formCompanyName">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formCompanyDescription">
                <Form.Label>Company Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="company_description"
                  rows={3}
                  value={formData.company_description}
                  onChange={handleChange}
                  placeholder="Describe your company"
                />
              </Form.Group>
            </>
          )}

          <hr className="my-4" /> {/* Separator for password section */}

          <h5>Change Password (Optional)</h5>
          <Form.Text className="text-muted mb-3 d-block">
            Leave password fields blank if you don't want to change your password.
          </Form.Text>

          {/* New Password */}
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label>New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Enter new password"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          {/* Confirm New Password */}
          <Form.Group className="mb-3" controlId="formConfirmNewPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmNewPassword"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? (
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
              ) : (
                'Save Changes'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default EditProfileModal;