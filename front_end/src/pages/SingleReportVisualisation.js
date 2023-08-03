import React from "react";
import ReportStructure from "./ReportStructure";
import Topics from "./Topics";
import SentimentAnalysis from "./SentimentAnalysis";
import WordFrequency from "./WordFrequency";
import TopicTaxonomy from "./TopicTaxonomy";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "calc(100vh - 60px)", // change from height to minHeight
    textAlign: "center",
    backgroundColor: "#F7F7F7",
    color: "#333",
    padding: "20px",
  },
  heading: {
    fontSize: "3em",
    fontWeight: "bold",
    marginBottom: "20px",
  },
  paragraph: {
    fontSize: "1.5em",
    marginBottom: "40px",
  },
  row: {
    width: "100%",
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "5px",
    backgroundColor: "#FFF",
    boxShadow: "0 4px 6px rgba(0, 0, 0, .1)",
  },
};

const SingleReportVisualisation = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Single Page Visualisation</h1>
      <p style={styles.paragraph}>
        This is the Single Report Visualisation page.
      </p>
      <div style={styles.row}>
        <ReportStructure />
      </div>
      <div style={styles.row}>
        <Topics />
      </div>
      <div style={styles.row}>
        <SentimentAnalysis />
      </div>
      <div style={styles.row}>
        <WordFrequency />
      </div>
      <div style={styles.row}>
        <TopicTaxonomy />
      </div>
    </div>
  );
};

export default SingleReportVisualisation;
