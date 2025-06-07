import React from 'react';
import AuthenticatedNavbar from '../components/AuthenticatedNavbar'; 

const MainLayout = ({ children }) => {
  return (
    <>
      <AuthenticatedNavbar /> 
      <main className="container-fluid py-4">
        {children}
      </main>
      
    </>
  );
};

export default MainLayout;