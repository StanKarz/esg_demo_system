import React from "react";
import SearchPage from "./pages/SearchPage";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import Home from "./pages/Home";
import MultiReportComparison from "./pages/MultiReportComparison";
import SingleReportVisualisation from "./pages/SingleReportVisualisation";
import Navbar from "./components/Navbar";
import ReportStructure from "./pages/ReportStructure";
import TreeVisualisation from "./pages/TreeVisualisation";
import WordFrequency from "./pages/WordFrequency";
import SentimentAnalysis from "./pages/SentimentAnalysis";
import SentimentVis from "./pages/SentimentVis";
import Topics from "./pages/Topics";
import TopicsVis from "./pages/TopicsVis";
import TopicTaxonomy from "./pages/TopicTaxonomy";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar></Navbar>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/single" element={<SingleReportVisualisation />} />
          <Route path="/multi" element={<MultiReportComparison />} />
          <Route path="/companies" element={<SearchPage />} />
          <Route
            path="/visualisations/report_structure"
            element={<ReportStructure />}
          />
          <Route
            path="/visualisations/report_structure/tree/:filename"
            element={<TreeVisualisation />}
          />
          <Route
            path="/visualisations/word_frequency"
            element={<WordFrequency />}
          />
          <Route
            path="/visualisations/word_frequency/:filename"
            element={<WordFrequency />}
          />
          <Route
            path="/visualisations/sentiment_analysis"
            element={<SentimentAnalysis />}
          />
          <Route
            path="/visualisations/sentiment_analysis/:filename"
            element={<SentimentVis />}
          />
          <Route path="/visualisations/topics" element={<Topics />} />
          <Route
            path="/visualisations/topics/:fileName"
            element={<TopicsVis />}
          />
          <Route
            path="/visualisations/topic_taxonomy"
            element={<TopicTaxonomy />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
