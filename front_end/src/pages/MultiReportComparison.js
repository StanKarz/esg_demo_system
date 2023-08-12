import React, { useState } from "react";
import ReportStructure from "./ReportStructure";
import Topics from "./Topics";
import SentimentAnalysis from "./SentimentAnalysis";
import WordFrequency from "./WordFrequency";
import axios from "axios";

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
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "5px",
    backgroundColor: "#FFF",
    boxShadow: "0 4px 6px rgba(0, 0, 0, .1)",
  },
  form: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    gap: "10px",
    margin: "20px 0",
  },
  input: {
    padding: "10px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "100%", // Adjust the width of the input field
  },
  button: {
    padding: "10px 20px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#3498db",
    color: "white",
    cursor: "pointer",
    fontSize: "16px",
    transition: "background-color 0.2s",
    ":hover": {
      backgroundColor: "#2980b9",
    },
  },

  reportContainer: {
    flex: 1,
    maxWidth: "50%", // Ensure it doesn't take more than half the space
    margin: "0 10px",
    backgroundColor: "#FFF",
    borderRadius: "5px",
    padding: "20px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, .1)",
  },

  reportsWrapper: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    width: "100%",
  },

  visualizationRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: "20px",
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MultiReportComparison = () => {
  // States for the first report
  const [file1, setFile1] = useState(null);
  const [filenameTree1, setFilenameTree1] = useState(null);
  const [filenameLDA1, setFilenameLDA1] = useState(null);
  const [filenameWordcloud1, setFilenameWordcloud1] = useState(null);
  const [data1, setData1] = useState(null);

  // States for the second report
  const [file2, setFile2] = useState(null);
  const [filenameTree2, setFilenameTree2] = useState(null);
  const [filenameLDA2, setFilenameLDA2] = useState(null);
  const [filenameWordcloud2, setFilenameWordcloud2] = useState(null);
  const [data2, setData2] = useState(null);

  const [loading, setLoading] = useState(false);

  const submitForm = async (event) => {
    event.preventDefault();

    const formData1 = new FormData();
    formData1.append("file", file1);
    const formDataPDF1 = new FormData();
    formDataPDF1.append("pdf", file1);

    // Form data for the second report
    const formData2 = new FormData();
    formData2.append("file", file2);
    const formDataPDF2 = new FormData();
    formDataPDF2.append("pdf", file2);

    setLoading(true);

    try {
      // API calls for the first report
      const responseTree1 = await axios.post(
        "http://localhost:3000/upload-tree",
        formData1
      );
      setFilenameTree1(responseTree1.data.filename);

      await sleep(2000);

      const responseTree2 = await axios.post(
        "http://localhost:3000/upload-tree",
        formData2
      );
      setFilenameTree2(responseTree2.data.filename);

      await sleep(1000);

      const responseLda1 = await axios.post(
        "http://localhost:3000/upload-lda",
        formData1
      );
      setFilenameLDA1(responseLda1.data.filename.split(".")[0]);

      const responseLda2 = await axios.post(
        "http://localhost:3000/upload-lda",
        formData2
      );
      setFilenameLDA2(responseLda2.data.filename.split(".")[0]);

      await sleep(1500);

      const responseSentiment1 = await axios.post(
        "http://localhost:3000/upload-sentiment",
        formDataPDF1
      );
      setData1(responseSentiment1.data.path);

      await sleep(1500);

      const responseSentiment2 = await axios.post(
        "http://localhost:3000/upload-sentiment",
        formDataPDF2
      );
      setData2(responseSentiment2.data.path);

      await sleep(1000);

      const responseWordcloud1 = await axios.post(
        "http://localhost:3000/upload-wordcloud",
        formDataPDF1
      );
      setFilenameWordcloud1(file1.name);

      await sleep(1000);

      const responseWordcloud2 = await axios.post(
        "http://localhost:3000/upload-wordcloud",
        formDataPDF2
      );
      setFilenameWordcloud2(file2.name);
    } catch (error) {
      console.error("There was an error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Multi-report Comparison</h1>
      <p style={styles.paragraph}>
        Upload your two ESG reports below to see visualizations side by side.
      </p>
      <form onSubmit={submitForm} style={styles.form}>
        <input
          type="file"
          onChange={(e) => setFile1(e.target.files[0])}
          style={styles.input}
        />
        <input
          type="file"
          onChange={(e) => setFile2(e.target.files[0])}
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Upload
        </button>
      </form>

      <div style={styles.visualizationRow}>
        <div style={styles.reportContainer}>
          <h2>Report 1</h2>
          <ReportStructure
            style={{ maxWidth: "100%" }}
            filename={filenameTree1}
            loading={loading}
          />
        </div>
        <div style={styles.reportContainer}>
          <h2>Report 2</h2>
          <ReportStructure
            style={{ maxWidth: "100%" }}
            filename={filenameTree2}
            loading={loading}
          />
        </div>
      </div>

      <div style={styles.visualizationRow}>
        <div style={styles.reportContainer}>
          <Topics filename={filenameLDA1} loading={loading} />
        </div>
        <div style={styles.reportContainer}>
          <Topics filename={filenameLDA2} loading={loading} />
        </div>
      </div>

      <div style={styles.visualizationRow}>
        <div style={styles.reportContainer}>
          <SentimentAnalysis filename={data1} loading={loading} />
        </div>
        <div style={styles.reportContainer}>
          <SentimentAnalysis filename={data2} loading={loading} />
        </div>
      </div>

      <div style={styles.visualizationRow}>
        <div style={styles.reportContainer}>
          <WordFrequency filename={filenameWordcloud1} loading={loading} />
        </div>
        <div style={styles.reportContainer}>
          <WordFrequency filename={filenameWordcloud2} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default MultiReportComparison;
