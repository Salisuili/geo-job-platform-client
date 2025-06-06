// src/layouts/MainLayout.jsx
import React from 'react';
import AuthenticatedNavbar from '../components/AuthenticatedNavbar';

function MainLayout({ children }) {
  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <AuthenticatedNavbar />
      <main className="container-fluid py-4"> {/* Or adjust to match your page's container */}
        {children}
      </main>
    </div>
  );
}

export default MainLayout;