import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import MainLayout from './layouts/MainLayout';
import PublicLayout from './layouts/PublicLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';

import Home from './pages/Home';
import EmployerJobs from './pages/EmployerJobs';
import RatingsProfile from './pages/RatingsProfile';
import PostJob from './pages/PostJob';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminEmployerList from './pages/admin/AdminEmployerList';
import AdminLaborerList from './pages/admin/AdminLaborerList';
import AdminJobListings from './pages/admin/AdminJobListings';
import LoginPage from './pages/Login';
import SignupPage from './pages/SignUp';
import EmployerDashboard from './pages/EmployerDashboard';
import LaborerList from './pages/LaborerList';
import JobDetails from './pages/JobDetails'; // <--- NEW: Import JobDetails component

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
    return <Navigate to="/" replace />;
  }
  return children;
};


function AppContent() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/signup" element={<PublicLayout><SignupPage /></PublicLayout>} />
      <Route path="/jobs" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><div>Services Page Content</div></PublicLayout>} />
      <Route path="/about" element={<PublicLayout><div>About Us Page Content</div></PublicLayout>} />
      <Route path="/laborers/:laborerId" element={<RatingsProfile />} />
      <Route path="/dashboard" element={<PublicLayout><EmployerDashboard /></PublicLayout>} />
      <Route path="/laborers" element={<PublicLayout><LaborerList /></PublicLayout>} />
      <Route path="/job/:id" element={<PublicLayout><JobDetails /></PublicLayout>} /> {/* <--- NEW: Route for JobDetails */}


      <Route path="/find-work" element={
        <PrivateRoute allowedRoles={['laborer', 'employer']}>
          <MainLayout><div>Find Work Page (Jobs Listing)</div></MainLayout>
        </PrivateRoute>
      } />
      <Route path="/my-applications" element={
        <PrivateRoute allowedRoles={['laborer']}>
          <MainLayout><div>My Applications Page (for Laborers)</div></MainLayout>
        </PrivateRoute>
      } />
      <Route path="/my-jobs" element={
        <PrivateRoute allowedRoles={['employer']}>
          <MainLayout><EmployerJobs /></MainLayout>
        </PrivateRoute>
      } />
      <Route path="/messages" element={
        <PrivateRoute allowedRoles={['laborer', 'employer']}>
          <MainLayout><div>Messages Page Content</div></MainLayout>
        </PrivateRoute>
      } />
      <Route path="/notifications" element={
        <PrivateRoute allowedRoles={['laborer', 'employer']}>
          <MainLayout><div>Notifications Page Content</div></MainLayout>
        </PrivateRoute>
      } />
      <Route path="/profile" element={
        <PrivateRoute allowedRoles={['laborer', 'employer']}>
          {user && user.user_type === 'laborer' ? (
            <MainLayout><RatingsProfile /></MainLayout>
          ) : (
            <MainLayout><UserProfile /></MainLayout>
          )}
        </PrivateRoute>
      } />
      <Route path="/post-job" element={
        <PrivateRoute allowedRoles={['employer']}>
          <MainLayout><PostJob /></MainLayout>
        </PrivateRoute>
      } />

      {/* !!! IMPORTANT CHANGE HERE !!! */}
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
      <Route path="/admin/employers" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminEmployerList /></AdminDashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/laborers" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminLaborerList /></AdminDashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/job-listings" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><AdminJobListings /></AdminDashboardLayout>
        </PrivateRoute>
      } />
      <Route path="/admin/jobs" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><div>Admin Jobs Management</div></AdminDashboardLayout>
        </PrivateRoute>
      } />

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