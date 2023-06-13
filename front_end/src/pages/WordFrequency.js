import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WordCloud from './WordCloud';


function WordFrequency() {
    const { filename } = useParams();
    const [selectedFile, setSelectedFile] = useState();
    // const [fileUploaded, setFileUploaded] = useState(false); // new state variable
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = () => {
        if (!selectedFile) {
            alert('No file selected!');
            return;
        }

        const formData = new FormData();
        formData.append('pdf', selectedFile);

        fetch('http://localhost:3000/upload-wordcloud', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            // setFileUploaded(true); // set fileUploaded to true
            navigate(`/visualisations/word_frequency/${selectedFile.name}`);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const filepath = filename || (selectedFile ? selectedFile.name : '');

    return (
        <div>
            <h1>Word Frequency Visualisation</h1>
            {/* Conditionally render file upload UI */}
            {!filename && (
                <>
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                    <button onClick={handleFileUpload}>Upload</button>
                </>
            )}
            {/* Render the WordCloud component for each category */}
            {filename && (
                <>
                    <WordCloud filepath={filepath} category="environmental" />
                    <WordCloud filepath={filepath} category="social" />
                    <WordCloud filepath={filepath} category="governance" />
                </>
            )}
        </div>
    );
}

export default WordFrequency;