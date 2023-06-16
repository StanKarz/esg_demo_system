import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

function SentimentVis() {
    const { filename } = useParams(); // Get filename from URL parameters
    const [sentimentData, setSentimentData] = useState(null);
    const [selectedSentiment, setSelectedSentiment] = useState('compound'); // add this line

    // A dictionary to map sentiment to its corresponding color
    const sentimentColors = {
      'compound': '#ff7300',
      'pos': '#82ca9d',
      'neu': '#8884d8',
      'neg': '#e41749'
    };

    // Fetch sentiment data when the component mounts
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
                    <p className="intro">{`${selectedSentiment} score: ${payload[0].value}`}</p> {/* Modified here */}
                </div>
            );
        }
        return null;
    };

    // Render the sentiment data (or a loading message)
    return (
        <div>
            {sentimentData ? (
                <div>
                    <h1>Sentiment scores over the course of a report for {filename}</h1>
                    <select value={selectedSentiment} onChange={e => setSelectedSentiment(e.target.value)}>
                        <option value="compound">Compound</option>
                        <option value="pos">Positive</option>
                        <option value="neu">Neutral</option>
                        <option value="neg">Negative</option>
                    </select>
                    <LineChart
                        width={1000}
                        height={500}
                        data={sentimentData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" />
                        <YAxis />
                        <Tooltip content={<CustomTooltip />} />
                        <Line type="monotone" dataKey={selectedSentiment} stroke={sentimentColors[selectedSentiment]} /> {/* Modified here */}
                    </LineChart>
                </div>
            ) : (
                <p>Loading sentiment data...</p>
            )}
        </div>
    );
}

export default SentimentVis;
