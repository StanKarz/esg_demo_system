import React, { useState } from "react";
import WordCloud from "./WordCloud";
import BubbleChart from "./BubbleChart";

function WordFrequency({ filename, loading }) {
  // const [selectedFile, setSelectedFile] = useState();
  // const [filepath, setFilepath] = useState();
  const [selectedCategory, setSelectedCategory] = useState("environmental");

  // const handleFileChange = (event) => {
  //   setSelectedFile(event.target.files[0]);
  // };

  // const handleFileUpload = () => {
  //   if (!selectedFile) {
  //     alert("No file selected!");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("pdf", selectedFile);

  //   fetch("http://localhost:3000/upload-wordcloud", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setFilepath(selectedFile.name);
  //     })
  //     .catch((error) => {
  //       console.error("Error:", error);
  //     });
  // };

  return (
    <div>
      <h1>Word Frequency Visualisation</h1>
      {/* {!filepath && (
        <>
          <input type="file" accept=".pdf" onChange={handleFileChange} />
          <button onClick={handleFileUpload}>Upload</button>
        </>
      )} */}
      {loading && <p>Loading...</p>}
      {filename && (
        <>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="environmental">Environmental Words</option>
            <option value="social">Social Words</option>
            <option value="governance">Governance Words</option>
          </select>
          <div style={{ display: "block" }}>
            <WordCloud filepath={filename} category={selectedCategory} />
            <BubbleChart filepath={filename} />
          </div>
        </>
      )}
    </div>
  );
}

export default WordFrequency;
