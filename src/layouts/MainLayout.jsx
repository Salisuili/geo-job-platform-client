import React from 'react';
import PublicNavbar from '../components/PublicNavbar'; 

const MainLayout = ({ children }) => {
  return (
    <>
      <PublicNavbar /> 
      <main className="container-fluid py-4">
        {children}
      </main>
      
    </>
  );
};

export default MainLayout;