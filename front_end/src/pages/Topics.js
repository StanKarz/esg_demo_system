import React from "react";

function Topics({ filename, loading }) {
  return (
    <div style={{ position: "relative" }}>
      <h1>Topic modelling</h1>
      {loading && <p>Loading...</p>}
      {filename && (
        <object
          data={`http://localhost:3000/topics-data/${filename}.html`}
          width="100%"
          height="100%"
          style={{
            position: "relative",
            height: "calc(100vh)",
          }}
          aria-label="Embedded content"
        />
      )}
    </div>
  );
}

export default Topics;
