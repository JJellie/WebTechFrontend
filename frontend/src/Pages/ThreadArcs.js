import React, {useState, useMemo, useEffect} from 'react';
import "../Css/visual.css";
import Raphael from 'raphael';
import * as d3 from 'd3';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



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
  let canvas; 
  let circles = {};
  let curves = {};
  let nodeInfo = {};
  const nodeStrokeWidth = 1
  const nodeRadius = (distanceBetweenNodes/2)-(nodeStrokeWidth/2); 
  const curveWidth = 0.5
  let edgeConnection = {}

  nodePosition = useMemo(() => createNodeInfo(ordering, distanceBetweenNodes), []);
  // initialize vis
  useEffect(() => {
    console.log("initialize TA");
    canvas = Raphael(document.getElementById("TA") ,width, height);
    //Draw nodes
    for(let nodeIdIndex in ordering) {
      let x = width/2;
      let nodeId = ordering[nodeIdIndex]
      circles[nodeId] = canvas.circle(x, nodeIdIndex * distanceBetweenNodes + ((1/2) * distanceBetweenNodes), nodeRadius, )
      circles[nodeId].attr({"fill": colorSchemeScale(nodes[nodeId][nodeColorAttr])})
      circles[nodeId].attr({"stroke-width": nodeStrokeWidth})
      
    }
    //Draw arcs
    for(let edgeId of Object.keys(edges)) {
      const [fromNode, toNode] = edgeId.split("-");
      let distance = circles[toNode].attr('cy') - circles[fromNode].attr('cy')
      curves[edgeId] = canvas.path("M "+ (circles[fromNode].attr('cx')) +"," + (circles[fromNode].attr('cy')) + " A"+  (Math.abs(distance/2) > (width/3 -20) ? (width/3)*(1-(Math.abs(distance/2) / (circles.length*50) ))-10 : Math.abs(distance/2)) +"," + Math.abs(distance/2)  + " 0 0,1 " + circles[toNode].attr('cx') 
      +"," + (circles[toNode].attr('cy'))).attr({"stroke-width": curveWidth, "stroke": "#20A4F3",});
      curves[edgeId].toBack();
      //curves[edgeId].data({"fromId":fromNode, "toId":toNode})
      if(!edgeConnection[fromNode]) {edgeConnection[fromNode] = []};
      edgeConnection[fromNode].push(edgeId);
    }
    //Set animations
    for(let circId of Object.keys(circles)) {
      let circ = circles[circId]
      circ.hover(
        () => {
          circ.animate({'r':2*nodeRadius}, 100)
          if(edgeConnection[circId]){
            for(let edgeId of edgeConnection[circId]) {
              console.log(edgeId);
              curves[edgeId].animate({'stroke-width':2*curveWidth},100);
              curves[edgeId].attr({'stroke': '#000'});
              curves[edgeId].toFront();
              circles[edgeId.split("-")[1]].animate({'r': 1.5*nodeRadius},100)
              circles[edgeId.split("-")[1]].toFront()
            }
          }
          circ.toFront()
        },
        () => {
          circ.animate({'r':nodeRadius}, 100)
          if(edgeConnection[circId]){
            for(let edgeId of edgeConnection[circId]) {
              curves[edgeId].animate({'stroke-width':curveWidth},100);
              curves[edgeId].attr({'stroke': '#20A4F3'});
              curves[edgeId].toBack();
              circles[edgeId.split("-")[1]].animate({'r': nodeRadius},100)
            }
          }

        }
      )
    }
  },[])


  useEffect(() => {

  }, [])
  







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