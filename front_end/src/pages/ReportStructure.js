import React, { useState } from "react";
import axios from "axios";
import TreeVisualisation from "./TreeVisualisation"; // import TreeVisualisation

function ReportStructure({ filename, loading }) {
  return (
    <div>
      <h1>Report Structure</h1>
      {loading && <p>Loading...</p>}
      {/* Render TreeVisualisation component when filename is set */}
      {filename && <TreeVisualisation filename={filename} />}
    </div>
  );
}

export default ReportStructure;
