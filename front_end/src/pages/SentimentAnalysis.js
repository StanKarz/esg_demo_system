import React, { useRef, useState } from "react";
import { CircularProgress, Box, Typography } from "@mui/material";
import SentimentVis from "./SentimentVis";

function SentimentAnalysis() {
  const fileInput = useRef();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null); // processed data

  const handleUpload = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("pdf", fileInput.current.files[0]);

    setLoading(true);

    const response = await fetch("http://localhost:3000/upload-sentiment", {
      method: "POST",
      body: formData,
    });
    const responseData = await response.json();
    console.log(responseData);

    setLoading(false);
    setData(responseData.path);
  };

  return (
    <div style={{ position: "relative" }}>
      <h1>Sentiment Analysis</h1>
      {loading ? (
        <Box
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(255,255,255,0.8)",
          }}
        >
          <Box style={{ textAlign: "center" }}>
            <CircularProgress color="primary" />
            <Typography variant="h6" style={{ marginTop: "20px" }}>
              Processing your file...
            </Typography>
          </Box>
        </Box>
      ) : data ? (
        <SentimentVis filename={data} />
      ) : (
        <form onSubmit={handleUpload}>
          <input type="file" accept=".pdf" ref={fileInput} required />
          <button type="submit">Upload</button>
        </form>
      )}
    </div>
  );
}

export default SentimentAnalysis;
