import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ReportStructure() {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const submitForm = (event) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);

        axios.post('http://localhost:3000/upload-tree', formData)
            .then(response => {
                console.log(response);
                const { filename } = response.data;
                navigate(`/visualisations/report_structure/tree/${filename}`);
                setLoading(false);
            })
            .catch(error => {
                console.error('There was an error!', error);
                setLoading(false);
            });
    };

    return (
        <div>
            <h1>Upload your JSONL file</h1>
            <form onSubmit={submitForm}>
                <input type="file" onChange={e => setFile(e.target.files[0])} />
                <button type="submit">Upload</button>
            </form>
            {loading && <p>Loading...</p>}
        </div>
    );
}

export default ReportStructure;
