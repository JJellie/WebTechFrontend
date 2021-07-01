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
// previous hovered node in the thread arcs for cross hover
let previousHoveredNode = null;
let highlight = {row: null, column: null}

const borderSize = 0;
const noEdgeCellColor = "#e8e8e8";

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

let selectedEdgesCopy = [];

// audio
let positiveAudio = new Audio(positive);
let negativeAudio = new Audio(negative);
let neutralAudio = new Audio(neutral);


// canvas
let canvas; 
let headertop;
let headerleft;

// arrays containing svg elements
let cells = {};
let headertopNames = {};
let headerleftNames = {};

let locationMapping;

function AdjacencyMatrix({dataSet, width, height, headerWidth, ordering, edges, nodes, nodeAttrDisplay, edgeAttrDisplay, setHoveredEdge, hoveredNode, setSelectedEdges, selectedEdges, colorPositiveScale, colorNegativeScale, colorNeutral, nodeAttrColorCoding, nodeColorAttr,  colorSchemeScale, cust, network}) {
  
  const matrixWidth = width-headerWidth;
  const matrixHeight = height-headerWidth;
  const cellWidth = (matrixWidth)/ordering.length;
  const cellHeight = (matrixHeight)/ordering.length;
  const headerNodeColorTop = cellHeight/5;
  const headerNodeColorLeft = cellWidth/5;
  const hoverHeaderDisplacement = 5;
  const headerNameColorDistance = 3;
  const cellBorderSize = ((cellWidth+cellHeight)/2)/20;

  let fontsizeTop = (9.0/16.0)*cellWidth;
  let fontsizeLeft = (9.0/16.0)*cellHeight;
  let fontsizeMax = 8;
  locationMapping = useMemo(() => createLocationMapping(ordering), [ordering]);

  const [zoomScale, setZoomScale] = useState(1); 


  useEffect(() => {
    console.log("redraw vis");
    try {
      canvas.clear();
      headertop.clear();
      headerleft.clear();
    } catch {

    }
    
    // create canvas
    canvas = Raphael(document.getElementById("matrix") ,matrixWidth, matrixHeight);
    headertop = Raphael(document.getElementById("headerTop") ,width, headerWidth);
    headerleft = Raphael(document.getElementById("headerLeft") ,headerWidth, height);

    // background of matrix
    canvas.rect(0,0,matrixWidth,matrixHeight).attr({"fill" : noEdgeCellColor, "stroke-width" : 0});

    


    // matrix headers
    for( let nodeId of ordering) {
      let location = locationMapping[nodeId];
      let tx = (location * cellWidth) + .5*cellWidth;
      let ty = headerWidth - headerNodeColorTop;
      let lx = headerWidth - headerNodeColorTop;
      let ly = (location * cellHeight) + .5*cellHeight;
      // top header
      headertopNames[nodeId] = {};
      headertopNames[nodeId]["color"] = headertop.rect(tx - .5*cellWidth, ty, cellWidth, headerNodeColorTop);
      headertopNames[nodeId]["color"].attr({
        "stroke-width" : 0,
        "fill" : colorSchemeScale(nodes[nodeId][nodeColorAttr])
      })
      headertopNames[nodeId]["name"] = headertop.text(tx, ty-headerNameColorDistance, nodes[nodeId][nodeAttrDisplay]);
      headertopNames[nodeId]["name"].attr({
        "font-size": fontsizeTop,
        "text-anchor" : "start",
        "transform" : `r-90,${tx},${ty-headerNameColorDistance}` 
      })
      // left header
      headerleftNames[nodeId] = {};
      headerleftNames[nodeId]["color"] = headerleft.rect(lx, ly - .5*cellHeight, headerNodeColorLeft, cellHeight);
      headerleftNames[nodeId]["color"].attr({
        "stroke-width" : 0,
        "fill" : colorSchemeScale(nodes[nodeId][nodeColorAttr])
      })
      headerleftNames[nodeId]["name"] = headerleft.text(lx-headerNameColorDistance, ly, nodes[nodeId][nodeAttrDisplay]);
      headerleftNames[nodeId]["name"].attr({
        "font-size": fontsizeTop,
        "text-anchor" : "end",
      })
    }
    // loop through all edges
    let edgeIds = [...Object.keys(edges)];
    for( let edgeId of edgeIds ) {
      // variable initializations
      const [fromNode, toNode] = edgeId.split("-");
      let color;
      if(edges[edgeId]){
        color = network === "undirected" && edges[`${toNode}-${fromNode}`] ? valueToColor((edges[edgeId][edgeAttrDisplay]+edges[`${toNode}-${fromNode}`][edgeAttrDisplay])/2,colorPositiveScale, colorNegativeScale, colorNeutral):valueToColor(edges[edgeId][edgeAttrDisplay],colorPositiveScale, colorNegativeScale, colorNeutral); 
      } else {
        color = valueToColor(edges[`${toNode}-${fromNode}`][edgeAttrDisplay],colorPositiveScale, colorNegativeScale, colorNeutral);
      }
      if(!edges[`${toNode}-${fromNode}`] && network === "undirected") {
        edgeIds.push(`${toNode}-${fromNode}`);
      }
      const x = locationMapping[toNode]*cellWidth;
      const y = locationMapping[fromNode]*cellHeight;
      const leftNameX = headerleftNames[fromNode]["name"].attr("x");
      const topNameY = headertopNames[toNode]["name"].attr("y");
      const leftColorWidth = headerleftNames[fromNode]["color"].attr("width");
      const topNameTransform = headertopNames[toNode]["name"].attr("transform")[0];
      const topColorHeight = headertopNames[toNode]["color"].attr("height");
      //Create matrix
      cells[edgeId] = canvas.rect(x, y, cellWidth, cellHeight);
      cells[edgeId].attr({"fill" : color, "stroke-width" : 0});
      //Hover
      cells[edgeId].hover(
        () => {
          // make the names in the headers move by hoverHeaderDisplacement 
          // and the color rectangle to increase by hoverHeaderDisplacement
          headerleftNames[fromNode]["name"].attr({"x":leftNameX-hoverHeaderDisplacement});
          headertopNames[toNode]["name"].attr({"y":topNameY-hoverHeaderDisplacement, transform:`${topNameTransform[0]}${topNameTransform[1]},${topNameTransform[2]},${topNameTransform[3]-hoverHeaderDisplacement}`});
          headerleftNames[fromNode]["color"].attr({"width": leftColorWidth+hoverHeaderDisplacement, "x":leftNameX-hoverHeaderDisplacement+headerNameColorDistance});
          headertopNames[toNode]["color"].attr({"height": topColorHeight+hoverHeaderDisplacement, "y":topNameY-hoverHeaderDisplacement+headerNameColorDistance});
          highlight.row.attr({"y":y});
          highlight.column.attr({"x":x});
          highlight.row.show();
          highlight.column.show();
          highlight.row.toFront();
          highlight.column.toFront(); 
          setHoveredEdge(edgeId);
        },
        () => {
          // make everything go back to normal
          headerleftNames[fromNode]["name"].attr({"x":leftNameX});
          headertopNames[toNode]["name"].attr({"y":topNameY, transform:`${topNameTransform[0]}${topNameTransform[1]},${topNameTransform[2]},${topNameTransform[3]}`});
          headerleftNames[fromNode]["color"].attr({"width": leftColorWidth,"x":leftNameX+headerNameColorDistance});
          headertopNames[toNode]["color"].attr({"height": topColorHeight,"y":topNameY+headerNameColorDistance});
          highlight.row.hide();
          highlight.column.hide(); 
          setHoveredEdge(null);
        }
      );
      //Click
      cells[edgeId].click((e) =>  {
        // play sound when clicked and ctrl key pressed
        if(e.ctrlKey) {   
          let attrValue = edges[edgeId][edgeAttrDisplay];
          if(attrValue>0){
            positiveAudio.play();
          } else if (attrValue<0) {
            negativeAudio.play();
          } else {
            neutralAudio.play();
          }
        // if ctrl key not pressed pin the edge
        } else {
          if(selectedEdgesCopy.includes(edgeId)){
            selectedEdgesCopy = selectedEdgesCopy.filter(edge => edge !== edgeId);
            setSelectedEdges(edges => selectedEdgesCopy);
            cells[edgeId].attr({"stroke-width": 0})
          } else {
            selectedEdgesCopy = [...selectedEdgesCopy, edgeId];
            cells[edgeId].toFront();
            setSelectedEdges(edges => selectedEdgesCopy);
            cells[edgeId].attr({"stroke-width": cellBorderSize})
          }
        }
      })
    }
    // hover highlight element initialization
    highlight.row = canvas.rect(0,0,matrixWidth,cellHeight)
    highlight.column = canvas.rect(0,0,cellWidth,matrixHeight)
    highlight.row.attr({"fill-opacity": 0, "stroke-width": cellBorderSize})
    highlight.column.attr({"fill-opacity": 0, "stroke-width": cellBorderSize})
    highlight.row.toFront();
    highlight.column.toFront();
    highlight.row.hide();
    highlight.column.hide();
  }, [cust, network, dataSet])

  // Cross Hover
  useEffect(() => {
    if (hoveredNode) {
      const leftNameX = headerleftNames[hoveredNode]["name"].attr("x");
      const topNameY = headertopNames[hoveredNode]["name"].attr("y");
      const leftColorWidth = headerleftNames[hoveredNode]["color"].attr("width");
      const topNameTransform = headertopNames[hoveredNode]["name"].attr("transform")[0];
      const topColorHeight = headertopNames[hoveredNode]["color"].attr("height");
      if (previousHoveredNode) {
        const previousLeftNameX = headerleftNames[previousHoveredNode]["name"].attr("x");
        const previousTopNameY = headertopNames[previousHoveredNode]["name"].attr("y");
        const previousLeftColorWidth = headerleftNames[previousHoveredNode]["color"].attr("width");
        const previousTopNameTransform = headertopNames[previousHoveredNode]["name"].attr("transform")[0];
        const previousTopColorHeight = headertopNames[previousHoveredNode]["color"].attr("height");
        headerleftNames[previousHoveredNode]["name"].attr({"x":previousLeftNameX+hoverHeaderDisplacement});
        headertopNames[previousHoveredNode]["name"].attr({"y":previousTopNameY+hoverHeaderDisplacement, transform:`${previousTopNameTransform[0]}${previousTopNameTransform[1]},${previousTopNameTransform[2]},${previousTopNameTransform[3]+hoverHeaderDisplacement}`});
        headerleftNames[previousHoveredNode]["color"].attr({"width": previousLeftColorWidth-hoverHeaderDisplacement,"x":previousLeftNameX+hoverHeaderDisplacement+headerNameColorDistance});
        headertopNames[previousHoveredNode]["color"].attr({"height": previousTopColorHeight-hoverHeaderDisplacement,"y":previousTopNameY+hoverHeaderDisplacement+headerNameColorDistance});
        previousHoveredNode = hoveredNode;
      } else {
        previousHoveredNode = hoveredNode;
      }

      headerleftNames[hoveredNode]["name"].attr({"x":leftNameX-hoverHeaderDisplacement});
      headertopNames[hoveredNode]["name"].attr({"y":topNameY-hoverHeaderDisplacement, transform:`${topNameTransform[0]}${topNameTransform[1]},${topNameTransform[2]},${topNameTransform[3]-hoverHeaderDisplacement}`});
      headerleftNames[hoveredNode]["color"].attr({"width": leftColorWidth+hoverHeaderDisplacement, "x":leftNameX-hoverHeaderDisplacement+headerNameColorDistance});
      headertopNames[hoveredNode]["color"].attr({"height": topColorHeight+hoverHeaderDisplacement, "y":topNameY-hoverHeaderDisplacement+headerNameColorDistance});
      highlight.row.attr({"y":headerleftNames[hoveredNode]["color"].attr("y")});
      highlight.column.attr({"x":headertopNames[hoveredNode]["color"].attr("x")});
      highlight.row.show();
      highlight.column.show();
    } else if (previousHoveredNode) {
      const previousLeftNameX = headerleftNames[previousHoveredNode]["name"].attr("x");
      const previousTopNameY = headertopNames[previousHoveredNode]["name"].attr("y");
      const previousLeftColorWidth = headerleftNames[previousHoveredNode]["color"].attr("width");
      const previousTopNameTransform = headertopNames[previousHoveredNode]["name"].attr("transform")[0];
      const previousTopColorHeight = headertopNames[previousHoveredNode]["color"].attr("height");
      headerleftNames[previousHoveredNode]["name"].attr({"x":previousLeftNameX+hoverHeaderDisplacement});
      headertopNames[previousHoveredNode]["name"].attr({"y":previousTopNameY+hoverHeaderDisplacement, transform:`${previousTopNameTransform[0]}${previousTopNameTransform[1]},${previousTopNameTransform[2]},${previousTopNameTransform[3]+hoverHeaderDisplacement}`});
      headerleftNames[previousHoveredNode]["color"].attr({"width": previousLeftColorWidth-hoverHeaderDisplacement,"x":previousLeftNameX+hoverHeaderDisplacement+headerNameColorDistance});
      headertopNames[previousHoveredNode]["color"].attr({"height": previousTopColorHeight-hoverHeaderDisplacement,"y":previousTopNameY+hoverHeaderDisplacement+headerNameColorDistance});
      previousHoveredNode = hoveredNode;
      highlight.row.hide();
      highlight.column.hide();
    }

  }, [hoveredNode])

  // resize header fontsize
  useEffect(()=>{
    if(Object.entries(headertopNames).length !== 0) {
      for(let nodeId of ordering) { 
        if(fontsizeTop*zoomScale>fontsizeMax) {
          headertopNames[nodeId].name.attr({"font-size" : fontsizeMax/zoomScale});
        } else {
          headertopNames[nodeId].name.attr({"font-size" : fontsizeTop});
        }
        if(fontsizeLeft*zoomScale>fontsizeMax) {
          headerleftNames[nodeId].name.attr({"font-size" : fontsizeMax/zoomScale});
        } else {
          headerleftNames[nodeId].name.attr({"font-size" : fontsizeLeft});
        }
      }
    }
  }, [zoomScale, cust, dataSet]);

  // render
  return (
    <div className="visualization" width={width} height={height} style= {{marginLeft:headerWidth, marginTop:headerWidth}}>
      <div className="matrix" width={matrixWidth} height={matrixHeight} style={{ top:headerWidth, left:headerWidth }}>
      <TransformWrapper
        pan = {{
        }}
        doubleClick={{
          disabled: true
        }}
        limitToBounds={true}
      >
        {({scale, positionX, positionY}) => {
        setZoomScale(scale);   
        return <>
          {/* header top */}
          <div className="headerTop" width={matrixWidth} height={headerWidth} style={{left:0, top:-headerWidth}} > 
          <TransformWrapper
            scale = {scale}
            positionX = {positionX}
            positionY = {(headerWidth/matrixWidth)*matrixWidth-(headerWidth/matrixWidth)*matrixWidth*scale}
            doubleClick={{
              disabled: true
            }}
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
            doubleClick={{
              disabled: true
            }}
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
        </>}}
      </TransformWrapper>
      </div>
    </div>
  )  
}
export default AdjacencyMatrix;

