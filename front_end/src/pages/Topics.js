import React, { useState } from "react";
import axios from "axios";
import { CircularProgress, Box, Typography } from "@mui/material";

function Topics() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState(null);

  const fileChangedHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadHandler = async () => {
    const formData = new FormData();
    formData.append("file", selectedFile);
    setLoading(true); // start loading
    try {
      const response = await axios.post(
        "http://localhost:3000/upload-lda",
        formData
      );
      const name = response.data.filename.split(".")[0];
      setFileName(name);
    } catch (err) {
      console.log("Error: ", err);
    } finally {
      setLoading(false); // stop loading
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <h1>Topic modelling</h1>
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
      ) : (
        <>
          {!fileName ? (
            <>
              <input type="file" onChange={fileChangedHandler} />
              <button onClick={uploadHandler}>Upload</button>
            </>
          ) : (
            <object
              data={`http://localhost:3000/topics-data/${fileName}.html`}
              width="100%"
              height="100%"
              style={{
                position: "relative",
                height: "calc(100vh)",
              }}
              aria-label="Embedded content"
            />
          )}
        </>
      )}
    </div>
  );
}

export default Topics;
