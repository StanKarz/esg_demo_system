import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Brush,
  Label,
  ResponsiveContainer,
} from "recharts";
import Modal from "react-modal";
import "../styles/sentiment.css";

function SentimentVis({ filename }) {
  const [sentimentData, setSentimentData] = useState(null);
  const [selectedSentiments, setSelectedSentiments] = useState(["compound"]); // Initialize with compound sentiment only
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const sentimentColors = {
    compound: "#FF8133",
    pos: "#2E933C",
    neu: "#51B9F6",
    neg: "#FF5F5C",
  };

  const getSentimentClass = (score) => {
    if (score < -0.5) {
      return "neg";
    } else if (score > 0.5) {
      return "pos";
    } else {
      return "neu";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch(
        `http://localhost:3000/sentiment-data/${filename}`
      );
      const data = await response.json();

      const transformedData = data.neg.map((value, index) => {
        return {
          index: index,
          neg: parseFloat(data.neg[index].toFixed(3)),
          neu: parseFloat(data.neu[index].toFixed(3)),
          pos: parseFloat(data.pos[index].toFixed(3)),
          compound: parseFloat(data.compound[index].toFixed(3)),
          text: data.text[index],
          wordSentiments: data.wordSentiments[index],
        };
      });

      setSentimentData(transformedData);
    };
    fetchData();
  }, [filename]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      setHoveredIndex(label);

      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#f4f4f4",
            padding: "5px",
            border: "1.25px solid #d4d4d4",
          }}
        >
          {payload.map((pl, index) => (
            <p key={index}>{`${pl.dataKey} score: ${pl.value}`}</p>
          ))}
          {/* Display the snippet */}
          {/* <p>Corresponding text: {snippet}</p> */}
        </div>
      );
    }
    return null;
  };

  const handleCheckboxChange = (event) => {
    if (selectedSentiments.includes(event.target.value)) {
      setSelectedSentiments(
        selectedSentiments.filter(
          (sentiment) => sentiment !== event.target.value
        )
      );
    } else {
      setSelectedSentiments([...selectedSentiments, event.target.value]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      {sentimentData ? (
        <div>
          <header
            style={{
              marginBottom: "20px",
              padding: "10px",
              borderRadius: "10px",
              textAlign: "center",
              border: "1.25px solid #ccc",
              boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h1>Sentiment scores: {filename}</h1>
          </header>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <div style={{ flex: "1 0 0 ", margin: "0 10px 10px 0" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "5px",
                  border: "1.25px solid #ccc",
                  borderRadius: "8px",
                  boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
                  padding: "10px",
                }}
              >
                {Object.keys(sentimentColors).map((sentiment) => (
                  <div key={sentiment} style={{ marginLeft: "15px" }}>
                    <input
                      type="checkbox"
                      id={sentiment}
                      value={sentiment}
                      checked={selectedSentiments.includes(sentiment)}
                      onChange={handleCheckboxChange}
                    />
                    <label
                      htmlFor={sentiment}
                      style={{ marginLeft: "7px", fontSize: "15px" }}
                    >
                      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                    </label>
                  </div>
                ))}
              </div>

              <Modal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                contentLabel="Text Modal"
              >
                <button onClick={() => setIsModalOpen(false)}>Close</button>
              </Modal>
              <ResponsiveContainer width="100%" height={620}>
                <LineChart
                  className="myChart"
                  width={1200}
                  height={600}
                  data={sentimentData}
                  animationDuration={300}
                  animationEasing="ease-out"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index">
                    <Label
                      value="Index"
                      offset={-15}
                      position="insideBottom"
                      style={{ fontSize: "20px" }}
                    />
                  </XAxis>
                  <YAxis>
                    <Label
                      value="Score"
                      angle={-90}
                      position="insideLeft"
                      style={{ fontSize: "20px" }}
                    />
                  </YAxis>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    wrapperStyle={{ lineHeight: "40px", fontSize: "20px" }}
                  />
                  {selectedSentiments.map((sentiment) => (
                    <Line
                      key={sentiment}
                      type="monotone"
                      dataKey={sentiment}
                      stroke={sentimentColors[sentiment]}
                      strokeWidth={3}
                      dot={false}
                    />
                  ))}
                  <Brush y={580} height={55} stroke="#8884d8" />{" "}
                  {/* The y value might need to be adjusted */}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Styling for the card that will contain the full text */}
            <div
              style={{
                flex: "0 0 500px",
                padding: "10px",
                border: "1.25px solid #ccc",
                borderRadius: "8px",
                height: "100%",
                overflow: "scroll",
                marginTop: "100px",
                boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              {" "}
              {hoveredIndex !== null && (
                <div>
                  <h2>Full Text for Index {hoveredIndex}</h2>
                  {sentimentData[hoveredIndex].wordSentiments.map(
                    ({ word, score }) => (
                      <span className={`word ${getSentimentClass(score)}`}>
                        {word}{" "}
                      </span>
                    )
                  )}
                  {/* <p>{sentimentData[hoveredIndex].text}</p> */}
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
