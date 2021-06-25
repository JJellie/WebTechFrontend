import React, {useState, useEffect, useMemo} from 'react';
import Raphael from 'raphael';
import * as d3 from "d3";
import "../Css/AdjacencyMatrix.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import positive from "../Audio/positive.mp3"
import negative from "../Audio/negative.mp3"
import neutral from "../Audio/neutral.mp3"
import Select from 'react-select';

const firstDropdown = [
    {value: "undirected", label: "undirected"},
    {value: "directed", label: "directed"}
];

const secondDropdownUndirected = [
    {value: "sorted in ascending order by id", label: "sorted in ascending order by id"},
    {value: "alphabetically", label: "alphabetically"},
    {value: "shuffle randomly", label: "shuffle randomly"},
    {value: "spectral", label: "spectral"},
    {value: "barycenter", label: "barycenter"}
];

const secondDropdownDirected = [
    {value: "sorted in ascending order by id", label: "sorted in ascending order by id"},
    {value: "alphabetically", label: "alphabetically"},
    {value: "shuffle randomly", label: "shuffle randomly"},
    {value: "barycenter", label: "barycenter"}
];

// array containing cells which don't have edges
let noEdgeCells = [];
// dictionary containing cells as keys and location in x and y as value
let locationCells = {};


const borderSize = 0;
const headerNodeAttrColorWidth = 3;
const noEdgeCellColor = "#c9c9c9";

function valueToColor(value, colorPositiveScale, colorNegativeScale, colorNeutral)  {
  if( value > 0 ) return colorPositiveScale(value);
  else if( value < 0 ) return colorNegativeScale(value);
  else return colorNeutral;
}

function createLocationMapping(ordering) {
  let locationMapping = {};
  for(let i in ordering) {
    locationMapping[ordering[i]] = i;
  }
  return locationMapping;
}

// canvas
let canvas; 
let headertop;
let headerleft;

// arrays containing svg elements
let cells = {};
let headertopNames = {};
let headerleftNames = {};

let locationMapping;

function AdjacencyMatrix({width, height, headerWidth, ordering, edges, nodes, nodeAttrDisplay, edgeAttrDisplay, setHoveredEdge, setSelectedEdge, colorPositiveScale, colorNegativeScale, colorNeutral, nodeAttrColorCoding, nodeColorAttr,  colorScheme}) {
  const matrixWidth = width-headerWidth;
  const matrixHeight = height-headerWidth;
  const cellWidth = (matrixHeight)/ordering.length;
  const cellHeight = (matrixHeight)/ordering.length;

  console.log(edges);

  locationMapping = useMemo(() => createLocationMapping(ordering), [ordering]);
 

  useEffect(() => {
    try {
      canvas.clear();
      headertop.clear();
      headerleft.clear();
    } catch {

    }
    
    console.log("initialize AM");
    // create canvas
    canvas = Raphael(document.getElementById("matrix") ,width, height);
    headertop = Raphael(document.getElementById("headerTop") ,width, headerWidth);
    headerleft = Raphael(document.getElementById("headerLeft") ,headerWidth, height);

    // background of matrix
    canvas.rect(0,0,matrixWidth,matrixHeight).attr({"fill" : noEdgeCellColor, "stroke-width" : 0});

    let fontsizeTop = (9.0/16.0)*cellWidth;
    let fontsizeLeft = (9.0/16.0)*cellHeight;


    // matrix headers
    for( let nodeId of ordering) {
      let location = locationMapping[nodeId];
      headertopNames[nodeId] = headertop.text((location * cellWidth) + .5*cellWidth, headerWidth-headerNodeAttrColorWidth, nodes[nodeId][nodeAttrDisplay]);
      headertopNames[nodeId].attr({
        "font-size": fontsizeTop,
        "text-anchor" : "start",
        "transform" : "r-90",
        "transform-origin" : `${(location * cellWidth)}px ${headerWidth-headerNodeAttrColorWidth}px`  
      })
    }
    // loop through all edges
    for( let edgeId of Object.keys(edges) ) {
      const [fromNode, toNode] = edgeId.split("-");
      cells[edgeId] = canvas.rect(locationMapping[toNode]*cellWidth, locationMapping[fromNode]*cellHeight, cellWidth, cellHeight);
      cells[edgeId].attr({"fill" : valueToColor(edges[edgeId][edgeAttrDisplay], colorPositiveScale, colorNegativeScale, colorNeutral), "stroke-width" : 0});
      console.log(edges[edgeId][edgeAttrDisplay]);
    }
  }, [])



  return (
    <>
    <div className="visualization" width={width} height={height}>
      <div className="matrix" width={matrixWidth} height={matrixHeight} style={{ top:headerWidth, left:headerWidth }}>
      <TransformWrapper
        pan = {{
        }}
        limitToBounds={true}
      >
        {({scale, positionX, positionY}) => (   
        <>
          {/* header top */}
          <div className="headerTop" width={matrixWidth} height={headerWidth} style={{left:0, top:-headerWidth}} > 
          <TransformWrapper
            scale = {scale}
            positionX = {positionX}
            positionY = {(headerWidth/matrixWidth)*matrixWidth-(headerWidth/matrixWidth)*matrixWidth*scale}
            wheel = {{
              wheelEnabled: false,
              touchPadEnabled: false,
              limitsOnWheel: false,
            }}
            pan = {{
              disabled: true
            }}
            pinch = {{
              disabled: true
            }}
          >
          <TransformComponent>
            <div id="headerTop"></div>
          </TransformComponent>
          </TransformWrapper>
          </div>
          {/* header left */}
          <div className="headerLeft" width={headerWidth} height={matrixHeight} style={{top:0, left:-headerWidth }} >
          <TransformWrapper
            scale = {scale}
            positionX = {(headerWidth/matrixHeight)*matrixHeight-(headerWidth/matrixHeight)*matrixHeight*scale}
            positionY = {positionY}
            wheel = {{
              wheelEnabled: false,
              touchPadEnabled: false,
              limitsOnWheel: false,
            }}
            pan = {{
              disabled: true
            }}
            pinch = {{
              disabled: true
            }}
          >
          <TransformComponent>
            <div id="headerLeft"></div>
          </TransformComponent>
          </TransformWrapper>
          </div>
          {/* Matrix */}
          <TransformComponent>
            <div id="matrix"></div>
          </TransformComponent>
        </>)}
      </TransformWrapper>
      </div>
    </div>
    </>
  )  
}
export default AdjacencyMatrix;

