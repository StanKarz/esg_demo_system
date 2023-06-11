import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const ESGWordFrequency = () => {
  const [file, setFile] = useState(null);
  const [wordFrequencies, setWordFrequencies] = useState(null);

  const svgRef = useRef();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/upload-word-cloud', {
      method: 'POST',
      body: formData,
    });

    const originalFileName = file.name.split('.')[0];

    const data = await response.json();
    const wordFreqResponse = await fetch(`http://localhost:3000/get-word-frequencies/${originalFileName}`);
    const wordFreqData = await wordFreqResponse.json();
    setWordFrequencies(wordFreqData);
  };

  useEffect(() => {
    if (wordFrequencies) {
      const svg = d3.select(svgRef.current);
      const layout = cloud()
        .size([500, 500])
        .words(wordFrequencies.map(function(d) {
          return {text: d.word, size: d.frequency};
        }))
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .fontSize(d => d.size)
        .on("end", draw);

      layout.start();

      function draw(words) {
        svg
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("fill", "#69b3a2")
          .attr("text-anchor", "middle")
          .style("font-family", "Impact")
          .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
      }
    }
  }, [wordFrequencies]);

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      <svg ref={svgRef} width="500" height="500"></svg>
    </div>
  );
};

export default ESGWordFrequency;
