import React, {useState, useMemo, useEffect} from 'react';
import "../Css/visual.css";
//import $, { data } from 'jquery'
//import DataFrame from 'dataframe-js';
//import './enron-v1Shortened.csv';
import Raphael from 'raphael';
import * as d3 from 'd3';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// let circ1 = circles[numbers.indexOf(String(lowest))];
// let circ2 = circles[numbers.indexOf(String(highest))]
// let distance = (circ2.attr('cy') - circ1.attr('cy'))
// var curve = canvas.path("M " + (circ1.attr('cx')) + "," + (circ1.attr('cy')) + " A" + (Math.abs(distance / 2) > (svgWidth / 2 - 20) ? (svgWidth / 2) * (1 - (Math.abs(distance / 2) / (circles.length * 50))) - 10 : Math.abs(distance / 2)) + "," + Math.abs(distance / 2) + " 0 0,1 " + circ2.attr('cx')
//   + "," + (circ2.attr('cy'))).attr({ "stroke-width": curveWidth, "stroke": "#20A4F3", });
// curve.data({ "from": String(lowest), "to": String(highest) })
// curve.toBack();

const nodeRadius = 10;
const nodeStrokeWidth = 3;
let nodePosition = {}


function createNodeInfo(ordering, distanceBetweenNodes) {
  let nodePositionTemp = {}
  for(let index in ordering) {
    nodePositionTemp[ordering[index]] = (index*distanceBetweenNodes) + ((1/2)*distanceBetweenNodes)
  }
  return nodePositionTemp;
}



function ThreadArcs({ width, height, ordering, edges, nodes, nodeNameDisplay, edgeAttr, setHoveredEdge, setSelectedEdge, setHoveredNode, setSelectedNode, colorSchemeScale, nodeColorAttr}) {
  const distanceBetweenNodes = height/ordering.length
  nodePosition = useMemo(() => createNodeInfo(ordering, distanceBetweenNodes), []);
  console.log(colorSchemeScale("test"));
  return (
    <div width={width} height={height}>
      <TransformWrapper
        defaultScale={1}
        defaultPositionX={0}
        wheel={{
          wheelEnabled: true,
          touchPadEnabled: true,
          limitsOnWheel: true,
          step: 5

        }}
        options={{
          limitToBounds: false,
          limitToWrapper: true,
          minScale: 0.3,
          maxScale: 1.5,
        }}
        doubleClick={{
          mode: 'reset'
        }}
      >
        <TransformComponent>
          <svg width={width} height={height}>
            {/* create all nodes */}
            {ordering.map((nodeId) => 
              <circle
                cx={width/2}
                cy={nodePosition[nodeId]}
                r={nodeRadius}
                stroke="black"
                stroke-width={nodeStrokeWidth}
                fill={colorSchemeScale(nodes[nodeId][nodeColorAttr])}
              >
              </circle>
            )}
            {/* create all edges */}
            {/* {Object.keys(edges).map((edgeId) => 
              <line></line>
            
            )} */}
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );


}

export default ThreadArcs;