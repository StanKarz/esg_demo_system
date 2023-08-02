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
            <Link className="nav-link" to="/companies">
              Companies
            </Link>
          </div>
          <div className="px-3">
            <NavDropdown title="Visualisations" id="nav-dropdown">
              <LinkContainer to="/visualisations/report_structure">
                <NavDropdown.Item>Report structure</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/visualisations/topics">
                <NavDropdown.Item>ESG Topics</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/visualisations/sentiment_analysis">
                <NavDropdown.Item>Sentiment analysis</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/visualisations/word_frequency">
                <NavDropdown.Item>ESG word frequency</NavDropdown.Item>
              </LinkContainer>
              <LinkContainer to="/visualisations/topic_taxonomy">
                <NavDropdown.Item>Topic Taxonomy</NavDropdown.Item>
              </LinkContainer>
            </NavDropdown>
          </div>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default NavbarComponent;
