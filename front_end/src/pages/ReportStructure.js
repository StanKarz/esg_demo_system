import React, { useState } from 'react';
import axios from 'axios';

function ReportStructure() {
    const [file, setFile] = useState(null);

    const submitForm = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('file', file);

        axios.post('http://localhost:3000/upload', formData)
            .then(response => {
                console.log(response);
            })
            .catch(error => {
                console.error('There was an error!', error);
            });
    };

    return (
        <div>
            <h1>Upload your JSONL file</h1>
            <form onSubmit={submitForm}>
                <input type="file" onChange={e => setFile(e.target.files[0])} />
                <button type="submit">Upload</button>
            </form>
        </div>
    );
}

export default ReportStructure;
