import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useParams } from 'react-router-dom';
import '../styles/TreeDiagram.css';
import axios from 'axios';

function FileUploadComponent() {
    const [loading, setLoading] = useState(false);

    const handleFileUpload = (file) => {
        setLoading(true);  // Set loading state to true when the upload starts

        const formData = new FormData();
        formData.append('file', file);
    
        axios.post('http://localhost:3000/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then((response) => {
            console.log(response.data);  // Log the response from the server
            setLoading(false);  // Set loading state to false when the upload (and any subsequent processing) is done
        })
        .catch((error) => {
            console.error("Error uploading file: ", error);
            setLoading(false);  // Set loading state to false if there's an error
        });
    };
}

function TreeVisualisation() {
    
    const { filename: filenameFromParams } = useParams();
    const ref = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("Filename from params: ", filenameFromParams);
        drawTree(filenameFromParams);
    }, [filenameFromParams]);

    const drawTree = (filename) => {
        let i = 0;
        let duration = 800;
        let root;
        let prevZoomScale = 0.8;
        let prevTranslation = [100, 100];

    const svgContainer = d3.select(ref.current)

    svgContainer.selectAll("*").remove();
    
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

        const treemap = d3.tree().size([900, 800])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 5) / a.depth;
        });

        function centerTree() {
            const nodesExtent = d3.extent(svg.selectAll('.node').nodes(), function(d) {
                const bbox = d.getBBox();
                const matrix = d.getCTM();
                return matrix ? [matrix.e + bbox.x, matrix.e + bbox.x + bbox.width]: [0,0];
            });
        
            const xOffset = (nodesExtent[0] + nodesExtent[1]) / -2;
            const scale = 0.8; // You can adjust the scale as needed
            svgContainer.transition()
                .duration(duration)
                .call(zoom.transform, d3.zoomIdentity.translate(xOffset, 0).scale(scale));
        }

    d3.json(`http://localhost:3000/processed_data/${filename}`)
      .then((treeData) => { 
        console.log("Received tree data: ", treeData);
        root = d3.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = window.innerHeight / 2;
        root.y0 = window.innerWidth / 10;
        root.children.forEach(collapse);
        update(root);
        centerTree();
        setLoading(false);
      })
      .catch(error => {
        console.error("Error occurred while fetching and processing data: ", error);
        setLoading(false);
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
        .attr("dy", " -1em") // Shifts the text vertically so it's centered on the node
        .attr("x", 0) // Centers the text horizontally on the node
        .style("text-anchor", "middle") // Ensures the text is centered at its position
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
            
            // If the clicked node is the root
            if (d.depth === 0) {
              if (d.children) { // If the root node has children
                collapseAll(d); // Collapse all children
              } else if (d._children) { // If the root node has collapsed children
                d.children = d._children; // Expand the root node
                d._children = null;
              }
              nodeToFocus = d; // Set the root node as the node to focus
            } else {
              if (d.children) {
                d._children = d.children;
                d.children = null;
                nodeToFocus = d.parent;
              } else {
                d.children = d._children;
                d._children = null;
                nodeToFocus = d;
              }
            }
          
            update(nodeToFocus); // Update with the node to focus
            centerNode(nodeToFocus); // Center the node to focus
          }
          
          // This function will recursively collapse all children of a node
          function collapseAll(node) {
            if (node.children) {
              node.children.forEach(collapseAll); // Call this function for each child
              node._children = node.children; 
              node.children = null; 
            }
          }
          
        function centerNode(source){
                let scale = 0.8;
                let x = -source.y * scale + 300; // 750 is half of 1500 (the size defined for the tree layout)
                let y = -source.x * scale + 300;
                svgContainer.transition()
                    .duration(duration)
                    .ease(d3.easeCubic)
                    .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
        }
        
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
        {loading ?
        <div>Loading...</div> : null}
        <div className={`svg-container ${loading ? 'hidden' : ''}`} ref={ref}></div>
      </div>
    );
  }
  
  export default TreeVisualisation;