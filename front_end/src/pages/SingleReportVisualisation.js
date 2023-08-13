import React, { useState, useRef } from "react";
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
    minHeight: "calc(100vh - 60px)",
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
    width: "100%",
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
  descriptionContainer: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    backgroundColor: "#EFEFEF", // Lighter shade for distinction
    boxShadow: "0 2px 4px rgba(0, 0, 0, .1)",
    marginBottom: "20px",
    fontSize: "1.2em",
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    for (let pair of formDataPDF.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    setLoading(true);

    try {
      // First API call
      const responseTree = await axios.post(
        "http://localhost:3000/upload-tree",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(responseTree);
      const { filename } = responseTree.data;
      setFilenameTree(filename);

      await sleep(1000);

      // Second API call
      const responseLda = await axios.post(
        "http://localhost:3000/upload-lda",
        formData
      );
      console.log(responseLda);
      const name = responseLda.data.filename.split(".")[0];
      setFilenameLDA(name);

      // Third API call
      const responseSentiment = await axios.post(
        "http://localhost:3000/upload-sentiment",
        formDataPDF
      );
      console.log(responseSentiment.data);
      setData(responseSentiment.data.path);

      await sleep(1000);

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
      <div style={styles.descriptionContainer}>
        This visualisation provides a quick and interactive overview of the
        structure and contents of the uploaded ESG report and how they relate in
        an hierarchical manner, nodes which have children are expandable and
        collapsable. By understanding the structure upfront, you can navigate to
        desired sections more efficiently, saving time and effort. Expanded
        nodes are coloured green and white nodes signify leaf nodes which have
        no more children to expand.
      </div>
      <div style={styles.row}>
        <Topics filename={filenameLDA} loading={loading} />
      </div>
      <div style={styles.descriptionContainer}>
        This visualisation shows an overview of the topics present within a
        report. Their size indicates reflects topic prominence and their
        proximity indicate how closely related they are. You can view the most
        common words that contribute to each topic and their frequency with
        respect to the entire report. The adjustable slider for λ determines how
        terms are ranked for a given topic. For λ=1 terms are ranked purely by
        their probability within the topic. This means the terms you see are the
        most probable terms for a given topic, but they might be common across
        multiple topics. For λ=0 terms are ranked by their distinctiveness or
        exclusivity to the topic. This means you'll see terms that are unique to
        a topic, even if they aren't the most probable terms for that topic.
      </div>
      <div style={styles.row}>
        <SentimentAnalysis filename={data} loading={loading} />
      </div>
      <div style={styles.row}>
        <WordFrequency filename={filenameWordcloud} loading={loading} />
      </div>
    </div>
  );
};

export default SingleReportVisualisation;
