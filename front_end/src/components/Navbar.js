import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Navbar.css';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <ul className={menuOpen ? 'navbar-menu-open' : ''}>
        <li>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        </li>
        <li>
          <Link to="/about" onClick={() => setMenuOpen(false)}>About</Link>
        </li>
        <li>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
        </li>
      </ul>
      <div className="hamburger-menu" onClick={toggleMenu}>
        &#9776;
      </div>
    </nav>
  );
}

export default Navbar;
