import React from "react";
import SearchPage from "./pages/SearchPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MultiReportComparison from "./pages/MultiReportComparison";
import SingleReportVisualisation from "./pages/SingleReportVisualisation";
import Navbar from "./components/Navbar";
import TopicTaxonomy from "./pages/TopicTaxonomy";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/companies" element={<SearchPage />} />
          <Route path="/single" element={<SingleReportVisualisation />} />
          <Route path="/multi" element={<MultiReportComparison />} />
          <Route path="/topic-taxonomy" element={<TopicTaxonomy />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
