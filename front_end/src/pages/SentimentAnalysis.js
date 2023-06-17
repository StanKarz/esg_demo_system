import React, { useRef } from 'react';
import { useNavigate } from "react-router-dom";

function SentimentAnalysis() {
  let navigate = useNavigate();
  const fileInput = useRef();

  const handleUpload = async (event) => {
    event.preventDefault();

    // Create a FormData instance
    const formData = new FormData();
    formData.append('pdf', fileInput.current.files[0]);

    // Upload the file and get the response
    const response = await fetch('http://localhost:3000/upload-sentiment', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log(data);

    // Redirect to visualisation page
    console.log(data)
    navigate(`/visualisations/sentiment_analysis/${data.path}`);
  }

  return (
    <form onSubmit={handleUpload}>
      <h1>Sentiment Analysis</h1>
      <input type="file" accept=".pdf" ref={fileInput} required/>
      <button type="submit">Upload</button>
    </form>
  );
}

export default SentimentAnalysis;
