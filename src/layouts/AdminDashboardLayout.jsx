import React from 'react';
import AdminSidebar from '../components/AdminSidebar'; // Import the new AdminSidebar component

function AdminDashboardLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Sidebar - always visible on desktop */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        {/*
          The 'p-4' provides padding around the content.
          'overflowY: auto' ensures if content is too tall, it scrolls.
        */}
        {children}
      </div>
    </div>
  );
}

export default AdminDashboardLayout;