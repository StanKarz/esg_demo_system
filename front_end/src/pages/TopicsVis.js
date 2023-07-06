import React from 'react';
import { useParams } from 'react-router-dom';
import Iframe from 'react-iframe';

function TopicsVis() {
    let { fileName } = useParams();
    fileName = fileName.replace('.pdf', ''); // Remove .pdf from the fileName

    return (
        <Iframe 
    url={`http://localhost:3000/topics-data/${fileName}.html`}
    width="100%"
    height="100%"
    styles={{ position: "absolute", top: "60px", left: "0" }} />
    );
}

export default TopicsVis;
