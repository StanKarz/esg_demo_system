import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush, Label } from 'recharts';
import Modal from 'react-modal';
import '../styles/sentiment.css';

function SentimentVis() {
    const { filename } = useParams(); // Get filename from URL parameters
    const [sentimentData, setSentimentData] = useState(null);
    const [selectedSentiments, setSelectedSentiments] = useState(['compound']); // Initialize with compound sentiment only
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalText, setModalText] = useState("");
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const sentimentColors = {
        'compound': '#FF8133',
        'pos': '#2E933C',
        'neu': '#51B9F6',
        'neg': '#FF5F5C'
    };

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`http://localhost:3000/sentiment-data/${filename}`);
            const data = await response.json();

            const transformedData = data.neg.map((value, index) => {
                return {
                    index: index,
                    neg: data.neg[index],
                    neu: data.neu[index],
                    pos: data.pos[index],
                    compound: data.compound[index],
                    text: data.text[index] // Include the text field here
                }
            });

            setSentimentData(transformedData);
        }
        fetchData();
    }, [filename]); 

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const textChunk = sentimentData[label].text || ''; // assuming the text chunk is stored under 'text' key
            const snippet = textChunk.length > 100 ? textChunk.substring(0, 100) + '...' : textChunk;

            setHoveredIndex(label);
            
            return (
                <div className="custom-tooltip" style={{ backgroundColor: '#f4f4f4', padding: '5px', border: '1px solid #d4d4d4' }}>
                    {payload.map((pl, index) => 
                        <p key={index}>{`${pl.dataKey} score: ${pl.value}`}</p>
                    )}
                    {/* Display the snippet */}
                    {/* <p>Corresponding text: {snippet}</p> */}
                </div>
            );
        }
        return null;
    };

    const handleReadMoreClick = (index) => {
        const textChunk = sentimentData[index].text || '';
        setModalText(textChunk);
        setIsModalOpen(true);
    };

    const handleCheckboxChange = (event) => {
        if (selectedSentiments.includes(event.target.value)) {
            setSelectedSentiments(selectedSentiments.filter(sentiment => sentiment !== event.target.value));
        } else {
            setSelectedSentiments([...selectedSentiments, event.target.value]);
        }
    }

    return (
        <div>
            {sentimentData ? (
                <div>
                    <h1>Sentiment scores over the course of a report for {filename}</h1>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            <div>
                                {Object.keys(sentimentColors).map(sentiment => (
                                    <div key={sentiment}>
                                        <input 
                                            type="checkbox"
                                            id={sentiment}
                                            value={sentiment}
                                            checked={selectedSentiments.includes(sentiment)}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label htmlFor={sentiment}>{sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}</label>
                                    </div>
                                ))}
                            </div>
                            <Modal
                                    isOpen={isModalOpen}
                                    onRequestClose={() => setIsModalOpen(false)}
                                    contentLabel="Text Modal"
                                >
                                    <button onClick={() => setIsModalOpen(false)}>Close</button>
                                    <p>{modalText}</p>
                            </Modal>
                            <LineChart
                                className='myChart'
                                width={1000}
                                height={500}
                                data={sentimentData}
                                animationDuration={300} 
                                animationEasing="ease-out"
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="index"/>
                                <YAxis />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" wrapperStyle={{ lineHeight: '40px' }} />
                                {selectedSentiments.map(sentiment => 
                                    <Line key={sentiment} type="monotone" dataKey={sentiment} stroke={sentimentColors[sentiment]} strokeWidth={3} />
                                )}
                                <Brush />
                            </LineChart>
                        </div>
                        {/* Styling for the card that will contain the full text */}
                        <div style={{ flex: 1, marginLeft: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '2px 2px 8px rgba(0,0,0,0.1)' }}>
                            {hoveredIndex !== null && (
                                <div>
                                    <h2>Full Text for Index {hoveredIndex}</h2>
                                    <p>{sentimentData[hoveredIndex].text}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading sentiment data...</p>
            )}
        </div>
    );
    
    

}

export default SentimentVis;
