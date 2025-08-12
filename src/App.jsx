// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Spinner } from 'react-bootstrap'; // Added Container and Spinner imports

import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import all necessary layouts
import PublicLayout from './layouts/PublicLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';
import LaborerDashboardLayout from './layouts/LaborerDashboardLayout';
import EmployerDashboardLayout from './layouts/EmployerDashboardLayout';

import Home from './pages/Home';
import EmployerJobs from './pages/EmployerJobs';
import RatingsProfile from './pages/RatingsProfile';
import PostJob from './pages/PostJob';
import UserProfile from './pages/UserProfile'; // This is the generic UserProfile
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployerList from './pages/admin/AdminEmployerList';
import AdminLaborerList from './pages/admin/AdminLaborerList';
import AdminJobListings from './pages/admin/AdminJobListings';
import AdminEditEmployer from './pages/admin/AdminEditEmployer';
import AdminEditLaborer from './pages/admin/AdminEditLaborer';
import AdminEditJob from './pages/admin/AdminEditJob';
// NEW: Import the AdminProfile component
import AdminProfile from './pages/admin/AdminProfile';
import LoginPage from './pages/Login';
import SignupPage from './pages/SignUp';
import EmployerDashboard from './pages/EmployerDashboard';
import LaborerList from './pages/LaborerList';
import JobDetails from './pages/JobDetails';
import LaborerDashboard from './pages/LaborerDashboard';
import MyApplications from './pages/MyApplications';
import JobApplicants from './pages/JobApplicants';
import AllJobApplicationsOverview from './pages/AllJobApplicationsOverview';
import EditJob from './pages/EditJob';

// PrivateRoute component for authentication and role-based access
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.some(role => user.user_type === role)) {
    return <Navigate to="/" replace />; // Redirect to home if role not allowed
  }
  return children;
};

// New wrapper component to handle conditional layout for RatingsProfile
const RatingsProfileRouteWrapper = () => {
  const { user, isAuthenticated, loading } = useAuth(); // 'loading' here is authLoading

  if (loading) {
    // Show a loading indicator while auth state is being determined
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading User Data...</span>
        </Spinner>
        <p className="mt-2">Preparing profile view...</p>
      </Container>
    );
  }

  if (!user) {
    return <PublicLayout><RatingsProfile /></PublicLayout>;
  }

  if (user.user_type === 'employer') {
    return <EmployerDashboardLayout><RatingsProfile /></EmployerDashboardLayout>;
  } else if (user.user_type === 'laborer') {
    return <LaborerDashboardLayout><RatingsProfile /></LaborerDashboardLayout>;
  } else if (user.user_type === 'admin') {
    return <AdminDashboardLayout><RatingsProfile /></AdminDashboardLayout>;
  }

  // Fallback for any unexpected user types (should ideally not be reached)
  console.warn("Unhandled user type in RatingsProfileRouteWrapper:", user.user_type);
  return <PublicLayout><RatingsProfile /></PublicLayout>; // Default to PublicLayout
};


// AppContent component to define all routes
function AppContent() {
  const { user } = useAuth(); // Get user from context to apply conditional layouts

  return (
    <Routes>
      {/* --- Public Routes (Always use PublicLayout) --- */}
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><SignupPage /></PublicLayout>} />
      <Route path="/jobs" element={<PublicLayout><Home /></PublicLayout>} /> 
      <Route path="/services" element={<PublicLayout><div>Services Page Content</div></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><div>About Us Page Content</div></PublicLayout>} />
      {/* Public list of laborers - this route remains public */}
      <Route path="/laborers" element={<PublicLayout><LaborerList /></PublicLayout>} />
      <Route path="/job/:id" element={<PublicLayout><JobDetails /></PublicLayout>} /> {/* Public job details */}
      {/* Public view of a specific Laborer's profile by ID. This route now uses the wrapper. */}
      <Route path="/laborers/:laborerId" element={
        <RatingsProfileRouteWrapper />
      } />


      {/* --- Authenticated Routes with Conditional Dashboard Layouts --- */}

      {/* Main Dashboard Route: Conditionally renders EmployerDashboardLayout or LaborerDashboardLayout */}
      <Route path="/dashboard" element={
        <PrivateRoute allowedRoles={['employer', 'laborer']}>
          {user && user.user_type === 'employer' ? (
            <EmployerDashboardLayout><EmployerDashboard /></EmployerDashboardLayout>
          ) : user && user.user_type === 'laborer' ? (
            <LaborerDashboardLayout><LaborerDashboard /></LaborerDashboardLayout>
          ) : (
            <Navigate to="/" replace /> // Fallback for unexpected user type
          )}
        </PrivateRoute>
      } />

      {/* Find Work Route: Conditionally renders EmployerDashboardLayout or LaborerDashboardLayout */}
      {/* This page is for authenticated users looking for jobs/work. */}
      <Route path="/find-work" element={
        <PrivateRoute allowedRoles={['laborer', 'employer']}>
          {user && user.user_type === 'employer' ? (
            // Employers might view a list of laborers to hire, or general job trends
            <EmployerDashboardLayout><div>Find Work Page (Jobs Listing)</div></EmployerDashboardLayout>
          ) : user && user.user_type === 'laborer' ? (
            // Laborers use Home as their 'Find Work' page, within their dashboard
            <LaborerDashboardLayout><Home /></LaborerDashboardLayout>
          ) : (
            <Navigate to="/" replace />
          )}
        </PrivateRoute>
      } />

      {/* --- Employer Specific Protected Routes - ALL use EmployerDashboardLayout --- */}
      <Route path="/my-jobs" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><EmployerJobs /></EmployerDashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/post-job" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><PostJob /></EmployerDashboardLayout>
        </PrivateRoute>
      } />
      {/* Employer's own profile by ID, if you have a separate route for it (e.g., for settings/editing) */}
      {/* Note: The /profile route below generally handles the logged-in user's profile */}
      <Route path="/employers/:employerId" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><UserProfile /></EmployerDashboardLayout> {/* Assuming UserProfile is the employer's self-profile */}
        </PrivateRoute>
      } />
      {/* Employer Payments and Settings */}
      <Route path="/payments" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><div>Employer Payments Page</div></EmployerDashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><div>Employer Settings Page</div></EmployerDashboardLayout>
        </PrivateRoute>
      } />

      {/* Employer's view of LaborerList from their dashboard */}
      <Route path="/employer/laborers" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><LaborerList /></EmployerDashboardLayout>
        </PrivateRoute>
      } />

      {/* Route for Job Applicants (specific job) */}
      <Route path="/employer/jobs/:jobId/applicants" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><JobApplicants /></EmployerDashboardLayout>
        </PrivateRoute>
      } />

      {/* NEW: Route for the All Job Applications Overview page */}
      <Route path="/employer/all-applicants" element={
        <PrivateRoute allowedRoles={['employer']}>
          <EmployerDashboardLayout><AllJobApplicationsOverview /></EmployerDashboardLayout>
        </PrivateRoute>
      } />

      {/* NEW: Route for the Edit Job page (for employers) */}
      <Route path="/employer/jobs/:jobId/edit" element={
        <PrivateRoute allowedRoles={['employer', 'admin']}> {/* Both employer and admin can edit */}
          <EmployerDashboardLayout><EditJob /></EmployerDashboardLayout>
        </PrivateRoute>
      } />


      {/* --- Laborer Specific Protected Routes - ALL use LaborerDashboardLayout --- */}
      <Route path="/my-applications" element={
        <PrivateRoute allowedRoles={['laborer']}>
          <LaborerDashboardLayout><MyApplications /></LaborerDashboardLayout>
        </PrivateRoute>
      } />
      {/* If a laborer clicks a link within their dashboard to see a specific job detail, it should be within LaborerDashboardLayout */}
      <Route path="/job-details/:id" element={ // Example, if different from public /job/:id
        <PrivateRoute allowedRoles={['laborer']}>
          <LaborerDashboardLayout><JobDetails /></LaborerDashboardLayout>
        </PrivateRoute>
      } />


      {/* --- Universal Profile Route (Logged-in user's own profile) --- */}
      {/* This route dynamically renders the correct profile component within the correct dashboard layout */}
      <Route path="/profile" element={
        <PrivateRoute allowedRoles={['laborer', 'employer', 'admin']}> {/* Added admin to allowed roles */}
          {user && user.user_type === 'laborer' ? (
            <LaborerDashboardLayout><RatingsProfile /></LaborerDashboardLayout> // Laborer's own profile
          ) : user && user.user_type === 'employer' ? (
            <EmployerDashboardLayout><UserProfile /></EmployerDashboardLayout> // Employer's own profile
          ) : user && user.user_type === 'admin' ? (
            <AdminDashboardLayout><AdminProfile /></AdminDashboardLayout> // Admin's own profile
          ) : (
            <Navigate to="/" replace />
          )}
        </PrivateRoute>
      } />


      {/* --- Admin Routes (Always use AdminDashboardLayout) --- */}
      <Route path="/admin/dashboard" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminDashboard /></AdminDashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/users" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><div>Admin Users Management</div></AdminDashboardLayout>
        </PrivateRoute>
      } />
      {/* Admin's view of LaborerList */}
      <Route path="/admin/laborers" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminLaborerList /></AdminDashboardLayout>
        </PrivateRoute>
      } />
       {/* Admin's route for editing a laborer */}
       <Route path="/admin/laborers/edit/:id" element={
         <PrivateRoute allowedRoles={['admin']}>
           <AdminDashboardLayout><AdminEditLaborer /></AdminDashboardLayout>
         </PrivateRoute>
       } />
      {/* Admin's view of EmployerList */}
      <Route path="/admin/employers" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminEmployerList /></AdminDashboardLayout>
        </PrivateRoute>
      } />
       {/* Admin's route for editing an employer */}
       <Route path="/admin/employers/edit/:id" element={
         <PrivateRoute allowedRoles={['admin']}>
           <AdminDashboardLayout><AdminEditEmployer /></AdminDashboardLayout>
         </PrivateRoute>
       } />
      <Route path="/admin/job-listings" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminJobListings /></AdminDashboardLayout>
        </PrivateRoute>
      } />
      {/* Admin's route for editing a job listing */}
      <Route path="/admin/job-listings/edit/:id" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminEditJob /></AdminDashboardLayout>
        </PrivateRoute>
      } />
       {/* Admin's own profile page */}
       <Route path="/admin/profile" element={
         <PrivateRoute allowedRoles={['admin']}>
           <AdminDashboardLayout><AdminProfile /></AdminDashboardLayout>
         </PrivateRoute>
       } />
      <Route path="/admin/jobs" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><div>Admin Jobs Management</div></AdminDashboardLayout>
        </PrivateRoute>
      } />

      {/* Fallback for any unmatched routes */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

// --- Main App Wrapper Component ---
function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider MUST wrap AppContent to provide context */}
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
