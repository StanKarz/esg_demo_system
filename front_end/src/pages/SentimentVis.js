import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Brush, Label } from 'recharts';
import '../styles/sentiment.css';

function SentimentVis() {
    const { filename } = useParams(); // Get filename from URL parameters
    const [sentimentData, setSentimentData] = useState(null);
    const [selectedSentiments, setSelectedSentiments] = useState(['compound']); // Initialize with compound sentiment only

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
                    compound: data.compound[index]
                }
            });

            setSentimentData(transformedData);
        }
        fetchData();
    }, [filename]); 

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip" style={{ backgroundColor: '#f4f4f4', padding: '5px', border: '1px solid #d4d4d4' }}>
                    <p className="label">Index: {label}</p>
                    {payload.map((pl, index) => 
                        <p key={index}>{`${pl.dataKey} score: ${pl.value}`}</p>
                    )}
                </div>
            );
        }
        return null;
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
            ) : (
                <p>Loading sentiment data...</p>
            )}
        </div>
    );
}

export default SentimentVis;
