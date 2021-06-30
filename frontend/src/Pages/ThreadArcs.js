import React, { useState, useMemo, useEffect } from 'react';
import "../Css/visual.css";
import Raphael from 'raphael';
import * as d3 from 'd3';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



const nodeStrokeWidth = 3;
let nodePosition = {}


function createNodeInfo(ordering, distanceBetweenNodes) {
  let nodePositionTemp = {}
  for (let index in ordering) {
    nodePositionTemp[ordering[index]] = (index * distanceBetweenNodes) + ((1 / 2) * distanceBetweenNodes)
  }
  return nodePositionTemp;
}

let canvas;
let clickInfo = {};
let circles = {};
let curves = {};
let nodeInfo = {};
let edgeConnection = {}
let selectedNodesCopy = [];
let previousHoveredEdge = null;

//Pinning nodes
const clickEvent = (clickInfo, curveWidth, nodeRadius, strokeColor, nodeStrokeWidth, setHoveredNode) => {
  let circId = clickInfo["nodeId"];
  let mode = clickInfo["mode"];
  let circ = circles[circId];
  if (mode) {
    // appearance edges
    if (edgeConnection[circId]) {
      for (let edgeId of edgeConnection[circId]) {
        curves[edgeId].animate({ 'stroke-width': 1.5 * curveWidth }, 100);
        curves[edgeId].attr({ 'stroke': '#000' });
        curves[edgeId].toFront();
        // put end nodes to front
        circles[edgeId.split("-")[1]].toFront();
      }
    }
    // appearance node
    circ.attr({ 'r': 1.5 * nodeRadius, 'stroke-width': 1.5 * nodeStrokeWidth });
    circ.toFront();
    // hover
    circ.unhover();
    circles[clickInfo["nodeId"]].hover(
      () => {
        if (edgeConnection[circId]) {
          for (let edgeId of edgeConnection[circId]) {
            let circ2Id = edgeId.split("-")[1];
            if (circ2Id !== circId) {
              if (!selectedNodesCopy.includes(edgeId.split("-")[1])) {
                circles[circ2Id].animate({ 'r': 1.25 * nodeRadius }, 100)
              }
            }
            circles[circ2Id].toFront()
          }
        }
        setHoveredNode(circId);
      },
      () => {
        if (edgeConnection[circId]) {
          for (let edgeId of edgeConnection[circId]) {
            if (!selectedNodesCopy.includes(edgeId.split("-")[1])) {
              circles[edgeId.split("-")[1]].animate({ 'r': nodeRadius }, 100)
            }
          }
        }
        setHoveredNode(null);
      }
    )
  } else {
    // node appearance
    circ.attr({ 'stroke-width': nodeStrokeWidth });

    // hover
    circ.unhover();
    circ.hover(
      //On mouse hovering over
      () => {
        circ.animate({ 'r': 1.5 * nodeRadius }, 100)
        if (edgeConnection[circId]) {
          for (let edgeId of edgeConnection[circId]) {
            curves[edgeId].animate({ 'stroke-width': 1.5 * curveWidth }, 100);
            curves[edgeId].attr({ 'stroke': '#000' });
            curves[edgeId].toFront();
            let circ2Id = edgeId.split("-")[1];
            if (circ2Id !== circId) {
              if (!selectedNodesCopy.includes(edgeId.split("-")[1])) {
                circles[circ2Id].animate({ 'r': 1.25 * nodeRadius }, 100)
              }
            }
            circles[circ2Id].toFront()
          }
        }
        circ.toFront()
      },
      //On mouse leaving hover
      () => {
        circ.animate({ 'r': nodeRadius }, 100)
        if (edgeConnection[circId]) {
          for (let edgeId of edgeConnection[circId]) {
            curves[edgeId].animate({ 'stroke-width': curveWidth }, 100);
            curves[edgeId].attr({ 'stroke': strokeColor });
            curves[edgeId].toBack();
            if (!selectedNodesCopy.includes(edgeId.split("-")[1])) {
              circles[edgeId.split("-")[1]].animate({ 'r': nodeRadius }, 100)
            }
          }
        }
      }
    )
  }
}


function ThreadArcs({ width, height, ordering, edges, nodes, nodeNameDisplay, edgeAttr, setSelectedEdges, setHoveredNode, hoveredEdge, setSelectedNodes, selectedNodes, colorSchemeScale, nodeColorAttr, cust }) {
  const distanceBetweenNodes = height / ordering.length
  const nodeStrokeWidth = distanceBetweenNodes / 12;
  const nodeRadius = Math.min((distanceBetweenNodes / 2) - (nodeStrokeWidth / 2), 20);
  const curveWidth = nodeRadius / 5;
  const strokeColor = "#20A4F3";

  nodePosition = useMemo(() => createNodeInfo(ordering, distanceBetweenNodes), []);

  // initialize vis
  useEffect(() => {
    console.log("redraw vis");
    try {
      canvas.clear()
    } catch {
    }

    canvas = Raphael(document.getElementById("TA"), width, height);
    //Draw nodes
    for (let nodeIdIndex in ordering) {
      let x = width / 2;
      let nodeId = ordering[nodeIdIndex]
      circles[nodeId] = canvas.circle(x, nodeIdIndex * distanceBetweenNodes + ((1 / 2) * distanceBetweenNodes), nodeRadius,)
      circles[nodeId].attr({ "fill": colorSchemeScale(nodes[nodeId][nodeColorAttr]) })
      circles[nodeId].attr({ "stroke-width": nodeStrokeWidth })
    }
    //Draw arcs
    for (let edgeId of Object.keys(edges)) {
      const [fromNode, toNode] = edgeId.split("-");
      let distance = circles[toNode].attr('cy') - circles[fromNode].attr('cy')
      curves[edgeId] = canvas.path("M " + (circles[fromNode].attr('cx')) + "," + (circles[fromNode].attr('cy')) + " A" + (Math.abs(distance / 2) > (width / 3 - 20) ? Math.abs(distance / 3) : Math.abs(distance / 2)) + "," + Math.abs(distance / 2) + " 0 0,1 " + circles[toNode].attr('cx')
        + "," + (circles[toNode].attr('cy'))).attr({ "stroke-width": curveWidth, "stroke": strokeColor, });
      curves[edgeId].toBack();
      //curves[edgeId].data({"fromId":fromNode, "toId":toNode})
      if (!edgeConnection[fromNode]) { edgeConnection[fromNode] = [] };
      edgeConnection[fromNode].push(edgeId);
    }
    //Set interactions
    for (let circId of Object.keys(circles)) {
      let circ = circles[circId]
      //On click interaction
      circ.click(() => {
        if (selectedNodesCopy.includes(circId)) {
          selectedNodesCopy.splice(selectedNodesCopy.indexOf(circId), 1);
          setSelectedNodes([...selectedNodesCopy]);
          clickEvent({ 'nodeId': circId, 'mode': false }, curveWidth, nodeRadius, strokeColor, nodeStrokeWidth, setHoveredNode);
        } else {
          selectedNodesCopy.push(circId);
          setSelectedNodes([...selectedNodesCopy]);
          clickEvent({ 'nodeId': circId, 'mode': true }, curveWidth, nodeRadius, strokeColor, nodeStrokeWidth, setHoveredNode);
        }
      })
      //Hover
      circ.hover(
        //On mouse hovering over
        () => {
          circ.animate({ 'r': 1.5 * nodeRadius }, 100)
          if (edgeConnection[circId]) {
            for (let edgeId of edgeConnection[circId]) {
              curves[edgeId].animate({ 'stroke-width': 1.5 * curveWidth }, 100);
              curves[edgeId].attr({ 'stroke': '#000' });
              curves[edgeId].toFront();
              let circ2Id = edgeId.split("-")[1];
              if (circ2Id !== circId) {
                if (!selectedNodesCopy.includes(edgeId.split("-")[1])) {
                  circles[circ2Id].animate({ 'r': 1.25 * nodeRadius }, 100)
                }
              }
              circles[circ2Id].toFront()
            }
          }
          circ.toFront()
          setHoveredNode(circId);
        },
        //On mouse leaving hover
        () => {
          circ.animate({ 'r': nodeRadius }, 100)
          if (edgeConnection[circId]) {
            for (let edgeId of edgeConnection[circId]) {
              curves[edgeId].animate({ 'stroke-width': curveWidth }, 100);
              curves[edgeId].attr({ 'stroke': strokeColor });
              curves[edgeId].toBack();
              if (!selectedNodesCopy.includes(edgeId.split("-")[1])) {
                circles[edgeId.split("-")[1]].animate({ 'r': nodeRadius }, 100)
              }
            }
          }
          setHoveredNode(null);
        }
      )
    }
  }, [cust])

  // cross hover 
  useEffect(() => {
    if (hoveredEdge) {
      const [fromNode, toNode] = hoveredEdge.split("-");
      if (previousHoveredEdge) {
        const [previousFromNode, previousToNode] = previousHoveredEdge.split("-");
        if(!((selectedNodes.includes(previousFromNode) && edgeConnection[previousFromNode].includes(`${previousFromNode}-${previousToNode}`))||
          (selectedNodes.includes(previousToNode) && edgeConnection[previousToNode].includes(`${previousToNode}-${previousFromNode}`)))) {
            curves[previousHoveredEdge].animate({ 'stroke-width': curveWidth }, 100);
            curves[previousHoveredEdge].attr({ 'stroke': strokeColor });
            curves[previousHoveredEdge].toBack();
        }
        if(!selectedNodes.includes(previousFromNode)) {circles[previousFromNode].animate({ 'r': nodeRadius }, 100)}
        if(!selectedNodes.includes(previousToNode)) {circles[previousToNode].animate({ 'r': nodeRadius }, 100)}
        previousHoveredEdge = hoveredEdge;
      } else {
        previousHoveredEdge = hoveredEdge;
      }
      curves[hoveredEdge].animate({ 'stroke-width': 1.5 * curveWidth }, 100);
      curves[hoveredEdge].attr({ 'stroke': '#000' });
      curves[hoveredEdge].toFront();
      circles[fromNode].animate({ 'r': 1.5 * nodeRadius }, 100);
      circles[toNode].animate({ 'r': 1.5 * nodeRadius }, 100);
      circles[fromNode].toFront();
      circles[toNode].toFront();
    } else if (previousHoveredEdge) {
      const [previousFromNode, previousToNode] = previousHoveredEdge.split("-");
      if(!((selectedNodes.includes(previousFromNode) && edgeConnection[previousFromNode].includes(`${previousFromNode}-${previousToNode}`))||
          (selectedNodes.includes(previousToNode) && edgeConnection[previousToNode].includes(`${previousToNode}-${previousFromNode}`)))) {
            curves[previousHoveredEdge].animate({ 'stroke-width': curveWidth }, 100);
            curves[previousHoveredEdge].attr({ 'stroke': strokeColor });
            curves[previousHoveredEdge].toBack();
      }
      if(!selectedNodes.includes(previousFromNode)) {circles[previousFromNode].animate({ 'r': nodeRadius }, 100)}
      if(!selectedNodes.includes(previousToNode)) {circles[previousToNode].animate({ 'r': nodeRadius }, 100)}
      previousHoveredEdge = hoveredEdge;
    }

  }, [hoveredEdge])

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
          maxScale: 2,
        }}
        doubleClick={{
          mode: 'reset'
        }}
      >
        <TransformComponent>
          <div id="TA"></div>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default ThreadArcs;