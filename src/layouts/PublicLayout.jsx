// src/layouts/PublicLayout.jsx
import React from 'react';
import PublicNavbar from '../components/PublicNavbar'; // Adjust path if necessary

const PublicLayout = ({ children }) => {
  return (
    <>
      <PublicNavbar /> {/* Always render PublicNavbar */}
      <main className="container-fluid py-4">
        {children}
      </main>
      {/* You can add a common footer here for public pages if you have one */}
    </>
  );
};

export default PublicLayout;