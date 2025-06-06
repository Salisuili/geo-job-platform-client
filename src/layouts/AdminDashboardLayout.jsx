// src/layouts/AdminDashboardLayout.jsx
import React from 'react';
import AdminSidebar from '../components/AdminSidebar';

function AdminDashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <main className="flex-grow-1 py-4 px-5" style={{ backgroundColor: '#f8f9fa' }}>
        {children}
      </main>
    </div>
  );
}

export default AdminDashboardLayout;