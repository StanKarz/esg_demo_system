import React, { useState, useRef } from "react";
import ReportStructure from "./ReportStructure";
import Topics from "./Topics";
import SentimentAnalysis from "./SentimentAnalysis";
import WordFrequency from "./WordFrequency";
import TopicTaxonomy from "./TopicTaxonomy";

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
};

// const submitForm = (event) => {
//   event.preventDefault();

//   const formData = new FormData();
//   formData.append("file", file);

//   setLoading(true);

//   axios
//     .post("http://localhost:3000/upload-tree", formData)
//     .then((response) => {
//       console.log(response);
//       const { filename } = response.data;
//       setFilename(filename); // set the filename in state
//       setLoading(false);
//     })
//     .catch((error) => {
//       console.error("There was an error!", error);
//       setLoading(false);
//     });
// };

const SingleReportVisualisation = () => {
  const [file, setFile] = useState(null);
  const fileInput = useRef();
  const [filenameTree, setFilenameTree] = useState(null); // Add state to hold filename
  const [filenameLDA, setFilenameLDA] = useState(null);
  const [filenameWordcloud, setFilenameWordcloud] = useState(null);
  const [data, setData] = useState(null); // processed data

  const [loading, setLoading] = useState(false);

  const submitForm = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("file", file);

    const formDataPDF = new FormData();
    formDataPDF.append("pdf", file);

    console.log(formData);
    console.log(formDataPDF);

    setLoading(true);

    try {
      // First API call
      const responseLda = await axios.post(
        "http://localhost:3000/upload-lda",
        formData
      );
      console.log(responseLda);
      const name = responseLda.data.filename.split(".")[0];
      setFilenameLDA(name);

      // Second API call
      const responseSentiment = await axios.post(
        "http://localhost:3000/upload-sentiment",
        formDataPDF
      );
      console.log(responseSentiment.data);
      setData(responseSentiment.data.path);

      // Third API call
      const responseTree = await axios.post(
        "http://localhost:3000/upload-tree",
        formData
      );
      console.log(responseTree);
      const { filename } = responseTree.data;
      setFilenameTree(filename);

      // Fourth API call
      const responseWordcloud = await axios.post(
        "http://localhost:3000/upload-wordcloud",
        formDataPDF
      );
      console.log(responseWordcloud);
      setFilenameWordcloud(file.name);
    } catch (error) {
      console.error("There was an error: ", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Single Report Visualisation</h1>
      <p style={styles.paragraph}>
        This is the Single Report Visualisation page. Upload your ESG report
        below to see several visualisations.
      </p>
      <form onSubmit={submitForm} style={styles.form}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={styles.input}
          ref={fileInput}
        />
        <button type="submit" style={styles.button}>
          Upload
        </button>
      </form>
      <div style={styles.row}>
        <ReportStructure filename={filenameTree} loading={loading} />
      </div>
      <div style={styles.row}>
        <Topics filename={filenameLDA} loading={loading} />
      </div>
      <div style={styles.row}>
        <SentimentAnalysis filename={data} loading={loading} />
      </div>
      <div style={styles.row}>
        <WordFrequency filename={filenameWordcloud} loading={loading} />
      </div>
      <div style={styles.row}>
        <TopicTaxonomy />
      </div>
    </div>
  );
};

export default SingleReportVisualisation;
