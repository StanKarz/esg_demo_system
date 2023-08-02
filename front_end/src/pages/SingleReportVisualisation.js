import React from "react";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "calc(100vh - 60px)", // Assuming navbar height is 60px.
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

const SinglePageVisualisation = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Single Page Visualisation</h1>
      <p style={styles.paragraph}>
        This is the Single Report Visualisation page.
      </p>
      <div style={styles.row}>Row 1 Placeholder Component</div>
      <div style={styles.row}>Row 2 Placeholder Component</div>
      <div style={styles.row}>Row 3 Placeholder Component</div>
      <div style={styles.row}>Row 4 Placeholder Component</div>
      <div style={styles.row}>Row 5 Placeholder Component</div>
    </div>
  );
};

export default SinglePageVisualisation;
