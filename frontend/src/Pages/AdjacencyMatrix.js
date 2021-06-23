import React, {useState, useEffect, useMemo} from 'react';
import Raphael from 'raphael';
import * as d3 from "d3";
import "../Css/AdjacencyMatrix.css";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import positive from "../Audio/positive.mp3"
import negative from "../Audio/negative.mp3"
import neutral from "../Audio/neutral.mp3"


// array containing cells which don't have edges
let noEdgeCells = [];
// dictionary containing cells as keys and location in x and y as value
let locationCells = {};


const borderSize = 0;
const headerNodeAttrColorWidth = 3;
const noEdgeCellColor = "#c9c9c9";

function createEdgeInfo(ordering, edges, cellWidth, cellHeight){
  let noEdge = [];
  let location = {};
  for( var x of d3.range(ordering.length) ) {
    for( var y of d3.range(ordering.length) ) {
      let edgeId = ordering[y].toString() + '-' +  ordering[x].toString();
      // check whether edge exists
      if(!(edgeId in edges)) {
        noEdge.push(edgeId);
      }
      // calculate x, y coordinates of cell and add to locationCells
      location[edgeId] = {x: x*cellWidth ,y: y*cellHeight};
    }
  }
  return [noEdge, location];
}

function AdjacencyMatrix({width, height, headerWidth, ordering, edges, nodes, nodeNameDisplay, edgeAttr, setHoveredEdge, setSelectedEdge, colorPositiveScale, colorNegativeScale, colorNeutral, nodeAttrColorCoding, nodeColorAttr,  colorScheme}) {
  const matrixWidth = width-headerWidth;
  const matrixHeight = height-headerWidth;
  const cellWidth = (matrixHeight)/ordering.length;
  const cellHeight = (matrixHeight)/ordering.length;
  const [noEdgeCells, locationCells] = useMemo(() => createEdgeInfo(ordering, edges, cellWidth, cellHeight), []);

  const valueToColor = (value) => {
    if( value > 0 ) return colorPositiveScale(value);
    else if( value < 0 ) return colorNegativeScale(value);
    else return colorNeutral;
  }
  return (
    <>
    <div className="visualization" width={width} height={height}>
      
      
      <div className="matrix" width={matrixWidth} height={matrixHeight} style={{ top:headerWidth, left:headerWidth }}>
      <TransformWrapper
        pan = {{
          disabled: false,
          activationKeys: "alt"
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
            positionY = {matrixWidth/6-matrixWidth/6*scale}
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
          <svg width={matrixWidth} height={headerWidth}>
            {ordering.map((nodeId) => {
              let edgeId= nodeId + "-" + nodeId;
              let fontsize = Math.min(cellWidth/2, 12.5);
              return(
                <>
                  <text x={locationCells[edgeId].x+2*headerNodeAttrColorWidth} y={headerWidth+cellWidth/2+1/2*fontsize} style={
                    {transform: "rotate(-90deg)", 
                    transformOrigin:`${locationCells[edgeId].x}px ${headerWidth}px`,
                    fontSize: fontsize}}
                  >{nodes[nodeId][nodeNameDisplay]}</text>
                  <rect 
                    x={locationCells[edgeId].x} 
                    y={headerWidth-headerNodeAttrColorWidth} 
                    width={cellWidth} 
                    height={headerNodeAttrColorWidth} 
                    fill={colorScheme[nodeAttrColorCoding[nodes[nodeId][nodeColorAttr]]]}
                  ></rect>
                </>
              )
            })}
          </svg>
          </TransformComponent>
          </TransformWrapper>
          </div>
          {/* header left */}
          <div className="headerLeft" width={headerWidth} height={matrixHeight} style={{top:0, left:-headerWidth }} >
          <TransformWrapper
            scale = {scale}
            positionX = {matrixHeight/6-matrixHeight/6*scale}
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
            <svg width={headerWidth} height={matrixHeight} >
              {ordering.map((nodeId) => {
                let edgeId= nodeId + "-" + nodeId;
                let fontsize = Math.min(cellWidth/2, 12.5);
                return(
                  <>
                    <text x={headerWidth-2*headerNodeAttrColorWidth} y={locationCells[edgeId].y+cellWidth/2+1/2*fontsize} style={
                      {transform: "1deg", 
                      transformOrigin:`${headerWidth}px ${locationCells[edgeId].y}px`,
                      fontSize: fontsize,
                      textAnchor: "end" }}
                    >{nodes[nodeId][nodeNameDisplay]}</text>
                    <rect 
                      x={headerWidth-headerNodeAttrColorWidth} 
                      y={locationCells[edgeId].y} 
                      width={headerNodeAttrColorWidth} 
                      height={cellHeight} 
                      fill={colorScheme[nodeAttrColorCoding[nodes[nodeId][nodeColorAttr]]]}
                    ></rect>
                  </>
                )
              })}
            </svg>
          </TransformComponent>
          </TransformWrapper>
          </div>
          {/* Matrix */}
          <TransformComponent>
          <svg width={matrixWidth} height={matrixHeight} >
            {noEdgeCells.map((edgeId) => 
              <rect 
                key={edgeId}
                x={locationCells[edgeId].x} 
                y={locationCells[edgeId].y} 
                width={cellWidth-borderSize}
                height={cellHeight-borderSize}
                fill={noEdgeCellColor}
                onMouseEnter={() => {setHoveredEdge([edgeId.split("-")])}}
                onMouseOut={() => {setHoveredEdge([null,null])}}
              >
              </rect>)}
            {Object.keys(edges).map((edgeId) => 
              <rect 
                key={edgeId}
                x={locationCells[edgeId].x} 
                y={locationCells[edgeId].y} 
                width={cellWidth-borderSize}
                height={cellHeight-borderSize}
                fill={valueToColor(edges[edgeId][edgeAttr])}
                onMouseEnter={() => {setHoveredEdge([edgeId.split("-")])}}
                onMouseOut={() => {setHoveredEdge([null,null])}}
                onClick={() => {setSelectedEdge([edgeId.split("-")])}}
              > 
              </rect>)}
          </svg>
          </TransformComponent>
        </>)}
      </TransformWrapper>
      </div>
    </div>
    </>
  )  
}
export default AdjacencyMatrix;

