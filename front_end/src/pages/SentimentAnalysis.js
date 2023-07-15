import React, { useRef, useState } from 'react'; // useState imported
import { useNavigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from '@mui/material';

function SentimentAnalysis() {
  let navigate = useNavigate();
  const fileInput = useRef();
  
  // Define the loading state
  const [loading, setLoading] = useState(false); 

  const handleUpload = async (event) => {
    event.preventDefault();

    // Create a FormData instance
    const formData = new FormData();
    formData.append('pdf', fileInput.current.files[0]);

    // Set loading to true before starting the upload
    setLoading(true);

    // Upload the file and get the response
    const response = await fetch('http://localhost:3000/upload-sentiment', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log(data);

    // Add a delay before redirection and set loading to false before navigating
    setTimeout(() => {
      setLoading(false);
      navigate(`/visualisations/sentiment_analysis/${data.path}`);
    }, 5000); // delay for 5 seconds, adjust as needed
  }

  return (
    <div style={{ position: 'relative' }}>
      <h1>Sentiment Analysis</h1>
      {loading ? (
          <Box 
            style={{
                position: 'fixed',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.8)'
            }}
          >
              <Box style={{ textAlign: 'center' }}>
                  <CircularProgress color="primary" />
                  <Typography variant="h6" style={{ marginTop: '20px' }}>Processing your file...</Typography>
              </Box>
          </Box>
      ) : (
          <form onSubmit={handleUpload}>
            <input type="file" accept=".pdf" ref={fileInput} required/>
            <button type="submit">Upload</button>
          </form>
      )}
    </div>
  );
}

export default SentimentAnalysis;
