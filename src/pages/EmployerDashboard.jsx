// src/pages/EmployerDashboard.js
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaHome } from 'react-icons/fa';
import EmployerDashboardLayout from '../components/EmployerDashboardLayout'; // Import the layout

function EmployerDashboard() {
  return (
    <EmployerDashboardLayout> {/* <--- Wraps the entire page content */}
      <Container fluid className="py-4 px-5 flex-grow-1">
        <h3 className="mb-4 fw-bold">Employer Dashboard</h3>
        <Row>
          <Col md={6} lg={4} className="mb-4">
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h5 className="card-title"><FaHome className="me-2" /> Welcome</h5>
                <p className="card-text">This is your employer dashboard. You can see summaries here.</p>
                <p className="card-text text-muted">More features coming soon!</p>
              </Card.Body>
            </Card>
          </Col>
          {/* Add more dashboard widgets here */}
        </Row>
      </Container>
    </EmployerDashboardLayout>
  );
}

export default EmployerDashboard;