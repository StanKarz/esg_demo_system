import React from 'react';
import CompaniesPage from './pages/CompaniesPage';
import SearchPage from './pages/SearchPage';  
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import ReportStructure from './pages/ReportStructure';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/companies" element={<SearchPage />} /> 
          <Route path="/visualisations/report_structure" element={<ReportStructure />} />


        </Routes>
      </div>
    </Router>
  );
}

export default App;



