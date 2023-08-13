import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import d3Cloud from "d3-cloud";

const WordCloud = ({ filepath, category }) => {
  const ref = useRef();

  // Initialize the tooltip
  const tooltip = d3
    .select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .style("background", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px");

  useEffect(() => {
    if (!filepath) {
      return;
    }
    fetch(`http://localhost:3000/word-cloud/${btoa(filepath)}/${category}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error(data.error);
          return;
        }

        const words = Object.entries(data).map(([word, frequency]) => ({
          word,
          frequency,
        }));

        var width = 1000;
        var height = 720;
        var colorInterpolate = getColorScale(category);
        var color = (d) =>
          colorInterpolate(
            (d.frequency / d3.max(words, (d) => d.frequency)) * 0.7 + 0.35
          );

        var fontSize = d3
          .scalePow()
          .exponent(0.5)
          .domain([0, d3.max(words, (d) => d.frequency)])
          .range([10, 100]);
        var layout = d3Cloud()
          .size([width, height])
          .words(words)
          .padding(7)
          .rotate(() => Math.round(Math.random()) * 90)
          .font("Impact")
          .fontSize((d) => fontSize(d.frequency))
          .on("end", draw);

        function draw(words) {
          d3.select(ref.current)
            .html("")
            .append("svg")
            .attr("width", layout.size()[0])
            .attr("height", layout.size()[1])
            .append("g")
            .attr(
              "transform",
              "translate(" +
                layout.size()[0] / 2 +
                "," +
                layout.size()[1] / 2 +
                ")"
            )
            .selectAll("text")
            .data(words)
            .enter()
            .append("text")
            .style("font-size", (d) => d.size + "px")
            .style("font-family", "Impact")
            .style("fill", color)
            .attr("text-anchor", "middle")
            .attr(
              "transform",
              (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"
            )
            .text((d) => d.word)
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .attr("class", "word");
        }

        function darkenColor(d) {
          return d3.rgb(color(d)).darker(1);
        }

        function mouseover(event, d) {
          const totalWords = d3.sum(words, (d) => d.frequency);
          const percentage = ((d.frequency / totalWords) * 100).toFixed(2);
          d3.select(event.target)
            .transition()
            .duration(300)
            .style("fill", () => darkenColor(d))
            .style("font-size", d.size + 5 + "px");

          tooltip
            .style("visibility", "visible")
            .text(`${d.word}: ${d.frequency} (${percentage}%)`)
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`);
        }

        function mouseout(event, d) {
          d3.select(event.target)
            .transition()
            .duration(300)
            .style("font-size", d.size + "px")
            .style("fill", () => color(d));

          tooltip.style("visibility", "hidden");
        }

        layout.start();
      });
  }, [filepath, category]);

  const getColorScale = (category) => {
    switch (category) {
      case "environmental":
        return d3.interpolateGreens;
      case "social":
        return d3.interpolateOranges;
      case "governance":
        return d3.interpolateBlues;
      default:
        return d3.interpolateBlues;
    }
  };

  return (
    <div>
      <div ref={ref}></div>
      {tooltip.visibility && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            background: "rgba(0, 0, 0, 0.7)",
            color: "#fff",
            padding: "3px 8px",
            borderRadius: "4px",
            pointerEvents: "none",
            fontSize: "14px",
            transform: "translate(-50%, -100%)",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default WordCloud;
