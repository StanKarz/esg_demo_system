import React from "react";
import { Navbar, Nav, NavDropdown } from "react-bootstrap";
import "./navbar.css";
import { Link } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";

function NavbarComponent() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav>
          <div className="px-3">
            <Link className="nav-link" to="/">
              Home
            </Link>
          </div>
          <div className="px-3">
            <Link className="nav-link" to="/companies">
              Companies
            </Link>
          </div>
          <div className="px-3">
            <Link className="nav-link" to="/single">
              Single Report Visualisation
            </Link>
          </div>
          <div className="px-3">
            <Link className="nav-link" to="/multi">
              Multi-report Comparison
            </Link>
          </div>

          <div className="px-3">
            <Link className="nav-link" to="/topic-taxonomy">
              Topic taxonomy
            </Link>
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarComponent;
