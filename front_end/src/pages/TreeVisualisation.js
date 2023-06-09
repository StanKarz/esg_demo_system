import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useParams } from 'react-router-dom';
import '../styles/TreeDiagram.css';

function TreeVisualisation() {
    
    const { filename: filenameFromParams } = useParams();
    const ref = useRef(null);

    useEffect(() => {
        drawTree(filenameFromParams);
    }, [filenameFromParams]);

    const drawTree = (filename) => {
        let i = 0;
        let duration = 750;
        let root;

        let prevZoomScale = 0.8;
        let prevTranslation = [100, 100];

        

    const svgContainer = d3.select(ref.current)
        .attr("width", "100%")
        .attr("height", "100%")
        .style("overflow", "hidden");

        
    
    const zoom = d3.zoom()
        .scaleExtent([0.5, 10])
        .on("zoom", function (event){
            svg.attr("transform", event.transform)
        });


    const svg = svgContainer.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "-100 -20 2000 1000")
        .attr("preserveAspectRatio", "xMidYMid meet")
        .call(zoom)
        .append("g");

        // const svgWidth = ref.current.getBoundingClientRect().width;
        // const svgHeight = ref.current.getBoundingClientRect().height;
        // const treemap = d3.tree().size([svgHeight, svgWidth]);
        const treemap = d3.tree().size([900, 800]);  // increased size

        // function centerTree() {
        //     svgContainer.transition()
        //         .duration(duration)
        //         .call(zoom.transform, d3.zoomIdentity.translate(prevTranslation[0], prevTranslation[1]).scale(prevZoomScale));
        // }

        function centerTree() {
            const nodesExtent = d3.extent(svg.selectAll('.node').nodes(), function(d) {
                const bbox = d.getBBox();
                const matrix = d.getCTM();
                return [matrix.e + bbox.x, matrix.e + bbox.x + bbox.width];
            });
        
            const xOffset = (nodesExtent[0] + nodesExtent[1]) / -2;
            const scale = 0.8; // You can adjust the scale as needed
            svgContainer.transition()
                .duration(duration)
                .call(zoom.transform, d3.zoomIdentity.translate(xOffset, 0).scale(scale));
        }
        



    d3.json(`http://localhost:3000/processed_data/${filename}`)
      .then((treeData) => { 
        root = d3.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = 375;
        root.y0 = 375;
        root.children.forEach(collapse);
        update(root);
        centerTree();
      })
      .catch(error => {
        console.error("Error occurred while fetching and processing data: ", error);
      });

      const collapse = (d) => {
        if(d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }

      const update = (source) => {
        const treeData = treemap(root);
        const nodes = treeData.descendants();
        const links = treeData.descendants().slice(1);
  
        nodes.forEach(function(d){ d.y = d.depth * 1200});
  
        const node = svg.selectAll('g.node')
            .data(nodes, function(d) {return d.id || (d.id = ++i); });
  
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", function(d) {
              return "translate(" + source.y0 + "," + source.x0 + ")";
          })
          .on('click', (event, d) => click(d));

        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-4)
            .style("fill", function(d) {
                return d._children ? "lightsteelblue" : "#fff";
            });
  
        nodeEnter.append('text')
            .attr("dy", ".85em")
            .attr("x", function(d) {
                return d.children || d._children ? 13 : -13;
            })
            .attr("text-anchor", function(d) {
                return d.children || d._children ? "start" : "end";
            })
            .text(function(d) { return d.data.name; });
  
        const nodeUpdate = nodeEnter.merge(node);
  
        nodeUpdate.transition()
          .duration(duration)
          .attr("transform", function(d) { 
              return "translate(" + d.y + "," + d.x + ")";
           });
  
        nodeUpdate.select('circle.node')
          .attr('r', 15)
          .style("fill", function(d) {
              if (d._children) {
                return "lightsteelblue";
              } else if (d.children) {
                return "green";
              } else {
                return "#fff";
              }
          })
          .attr('cursor', 'pointer');
  
        const nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();
  
        nodeExit.select('circle')
          .attr('r', 1e-5);
  
        nodeExit.select('text')
          .style('fill-opacity', 1e-5);
  
        const link = svg.selectAll('path.link')
            .data(links, function(d) { return d.id; });
  
        const linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', function(d){
              var o = {x: source.x0, y: source.y0}
              return diagonal(o, o)
            });
  
        const linkUpdate = linkEnter.merge(link);
  
        linkUpdate.transition()
            .duration(duration)
            .attr('d', function(d){ return diagonal(d, d.parent) });
  
        const linkExit = link.exit().transition()
            .duration(duration)
            .attr('d', function(d) {
              var o = {x: source.x, y: source.y}
              return diagonal(o, o)
            })
            .remove();
  
        nodes.forEach(function(d){
          d.x0 = d.x;
          d.y0 = d.y;
        });
  
        function click(d) {
        let nodeToFocus;
        console.log(d)
          if (d.children) {
              d._children = d.children;
              d.children = null;
              nodeToFocus = d.parent;
            //   centerTree();

            } else {
              d.children = d._children;
              d._children = null;
              nodeToFocus = d;
            //   centerNode(d);

            }
          update(d);
          centerNode(nodeToFocus);
        }

        function centerNode(source){
                let scale = 0.8;
                let x = -source.y * scale + 300; // 750 is half of 1500 (the size defined for the tree layout)
                let y = -source.x * scale + 300;
                svgContainer.transition()
                    .duration(duration)
                    .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
        }

        // function centerTree() {
        //     let scale = 0.75;  // This should be a smaller value than the scale used in `centerNode`
        //     let x = 50;
        //     let y = 50;
        //     svgContainer.transition()
        //         .duration(duration)
        //         .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
        // }

     
        
        function diagonal(s, d) {
  
          const path = `M ${s.y} ${s.x}
                C ${(s.y + d.y) / 2} ${s.x},
                  ${(s.y + d.y) / 2} ${d.x},
                  ${d.y} ${d.x}`
  
          return path
        }
      }
    }
  
    return (
      <div className="visualisation">
        <div ref={ref}></div>
      </div>
    );
  }
  
  export default TreeVisualisation;
