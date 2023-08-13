import React, { useState } from "react";
import WordCloud from "./WordCloud";
import BubbleChart from "./BubbleChart";

function WordFrequency({ filename, loading }) {
  const [selectedCategory, setSelectedCategory] = useState("environmental");

  return (
    <div>
      <h1>Word Frequency Visualisation</h1>
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
