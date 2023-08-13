import React, { useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import Iframe from "react-iframe";

function TopicsVis() {
  let { fileName } = useParams();
  fileName = fileName.replace(".pdf", ""); // Removes .pdf from the fileName

  const iframeRef = useRef(null);

  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.addEventListener("load", () => {
        // Sets the height of the iframe to match the content's height
        iframeRef.current.style.height = `${iframeRef.current.contentWindow.document.body.offsetHeight}px`;
      });
    }
  }, [fileName]);

  return (
    <Iframe
      ref={iframeRef}
      url={`http://localhost:3000/topics-data/${fileName}.html`}
      width="100%"
      styles={{ position: "relative", top: "60px", left: "0" }}
    />
  );
}

export default TopicsVis;
