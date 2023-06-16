import React from 'react';
import SearchPage from './pages/SearchPage';  
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Navbar from './components/Navbar';
import ReportStructure from './pages/ReportStructure';
import TreeVisualisation from './pages/TreeVisualisation';
import WordFrequency from './pages/WordFrequency';
import SentimentAnalysis from './pages/SentimentAnalysis';
import SentimentVis from './pages/SentimentVis';

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
          <Route path="/visualisations/report_structure/tree/:filename" element={<TreeVisualisation />} /> 
          <Route path="/visualisations/word_frequency" element={<WordFrequency />} />
          <Route path="/visualisations/word_frequency/:filename" element={<WordFrequency />} />
          <Route path="/visualisations/sentiment_analysis" element={<SentimentAnalysis />} />
          <Route path="/visualisations/sentiment_analysis/:filename" element={<SentimentVis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;



