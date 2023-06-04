
import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './navbar.css';  // Add this line
import { Link } from 'react-router-dom';


function NavbarComponent() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav>
          <Container className="px-3">
            <Link className="nav-link" to="/">Home</Link>
          </Container>
          <Container className="px-3">
            <Link className="nav-link" to="/about">About</Link>
          </Container>
          <Container className="px-3">
            <Link className="nav-link" to="/contact">Contact</Link>
          </Container>
          <Container className="px-3">
            <Link className="nav-link" to="/companies">Companies</Link>
          </Container>
          <Container className="px-3">
            <Link className="nav-link" to="/visualisations">Visualisations</Link>
          </Container>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarComponent;


