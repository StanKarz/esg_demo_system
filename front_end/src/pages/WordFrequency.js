import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WordCloud from './WordCloud';
import BubbleChart from './BubbleChart';

function WordFrequency() {
    const { filename } = useParams();
    const [selectedFile, setSelectedFile] = useState();
    const [selectedCategory, setSelectedCategory] = useState('environmental');
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
            {!filename && (
                <>
                    <input type="file" accept=".pdf" onChange={handleFileChange} />
                    <button onClick={handleFileUpload}>Upload</button>
                </>
            )}
            {filename && (
                <>
                    <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                        <option value="environmental">Environmental Words</option>
                        <option value="social">Social Words</option>
                        <option value="governance">Governance Words</option>
                    </select>
                    <div style={{display: 'block'}}>
                        <WordCloud filepath={filepath} category={selectedCategory} />
                        <BubbleChart filepath={filepath} />
                    </div>
                </>
            )}
        </div>
    );
}

export default WordFrequency;
