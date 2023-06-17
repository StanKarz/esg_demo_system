import React, { useState } from 'react';
import axios from 'axios';

function Topics() {
    const [selectedFile, setSelectedFile] = useState(null);

    const fileChangedHandler = (event) => {
        setSelectedFile(event.target.files[0]);
    }

    const uploadHandler = async () => {
        const formData = new FormData();
        formData.append('file', selectedFile);
        try {
            const response = await axios.post('http://localhost:3000/upload-lda', formData);
            const fileName = response.data.filename.split('.')[0];
            window.location.href = `http://localhost:3001/visualisations/topics/${fileName}`;
        } catch (err) {
            console.log('Error: ', err);
        }
    }

    return (
        <div>
            <h1>Topic modelling</h1>
            <input type="file" onChange={fileChangedHandler} />
            <button onClick={uploadHandler}>Upload</button>
        </div>
    );
}

export default Topics;
