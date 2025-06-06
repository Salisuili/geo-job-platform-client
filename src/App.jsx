// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

// Context for authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Navigation Components
import PublicNavbar from './components/PublicNavbar';
// AuthenticatedNavbar is used within MainLayout, AdminSidebar within AdminDashboardLayout

// Layout Components
import MainLayout from './layouts/MainLayout';
import AdminDashboardLayout from './layouts/AdminDashboardLayout';

import Home from './pages/Home'; 
import EmployerJobs from './pages/EmployerJobs';
import RatingsProfile from './pages/UserProfile'; 
import PostJob from './pages/PostJob'; 
import UserProfile from './pages/UserProfile'; 
import AdminDashboard from './pages/admin/AdminDashboard'; 
import LoginPage from './pages/Login'; 
import SignupPage from './pages/SignUp'; 

// --- Private Route Component ---
// This component protects routes based on authentication and user type
const PrivateRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, isAdmin, isEmployer, isLaborer, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  
  if (allowedRoles && !allowedRoles.some(role =>
    (role === 'admin' && isAdmin) ||
    (role === 'employer' && isEmployer) ||
    (role === 'laborer' && isLaborer)
  )) {
    // If not authorized for the specific role, redirect to dashboard or a different unauthorized page
    return <Navigate to="/" replace />; // Or /unauthorized
  }

  return children;
};

// --- App Component ---
function AppContent() {
  const { isAuthenticated, isAdmin, isEmployer, isLaborer } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicNavbarWrapper><Home /></PublicNavbarWrapper>} />
      <Route path="/login" element={<PublicNavbarWrapper><LoginPage /></PublicNavbarWrapper>} />
      <Route path="/signup" element={<PublicNavbarWrapper><SignupPage /></PublicNavbarWrapper>} />
      <Route path="/jobs" element={<PublicNavbarWrapper><Home /></PublicNavbarWrapper>} /> 
      <Route path="/services" element={<PublicNavbarWrapper><div>Services Page Content</div></PublicNavbarWrapper>} />
      <Route path="/about" element={<PublicNavbarWrapper><div>About Us Page Content</div></PublicNavbarWrapper>} />

      {/* Authenticated Routes (for Employer/Laborer) */}
      <Route path="/find-work" element={
        <PrivateRoute allowedRoles={['laborer', 'employer']}>
          <MainLayout><div>Find Work Page (Jobs Listing)</div></MainLayout>
        </PrivateRoute>
      } />
      <Route path="/jobs" element={
        <PrivateRoute allowedRoles={['laborer']}>
          <MainLayout><div>My Jobs Page (different content for laborer/employer)</div></MainLayout>
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
          {/* Decide if UserProfile or RatingsProfile is main profile view */}
          {isLaborer ? (
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

      {/* Admin Routes */}
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
      <Route path="/admin/jobs" element={
        <PrivateRoute allowedRoles={['admin']}>
          <AdminDashboardLayout><div>Admin Jobs Management</div></AdminDashboardLayout>
        </PrivateRoute>
      } />
      

      {/* Catch-all for undefined routes */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
}

// Wrapper to ensure PublicNavbar is only applied to public routes
// This is a simple example; in complex apps, you might use a more robust layout system.
const PublicNavbarWrapper = ({ children }) => (
  <>
    <PublicNavbar />
    <main className="container-fluid py-4">
      {children}
    </main>
  </>
);


function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;