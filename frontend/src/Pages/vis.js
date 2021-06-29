import ThreadArcs from './ThreadArcs.js';
import AdjacencyMatrix from './AdjacencyMatrix.js';
import '../Css/visual.css';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as d3 from "d3";
import Banner from "../Images/banner vis.png";
import Divider from "../Images/divider.png";
import { Link } from "react-router-dom";
import { popupShow, DatasetPopup } from "./backend.js";

// Different colorschemes for color blindness 
const colorSchemes =
  [["#20A4F3", "#FFBA49", "#57A773", "#F06C9B", "#5B2A86", "#FB3640", "#CE98F5"], //default
  ['#3b1f2b', '#a23b72', '#c73e1d', '#f18f01', '#2e86ab', '#00ffc5', '#4acee0'], //prot
  ["#813405", "#7f0799", "#ff4365", "#058ed9", "#00d9c0", "#e4ff1a", "#b7ad99"], //deut
  ["#693668", "#a74482", "#b9415f", "#ff3562", "#b7986e", "#ee8e2c", "#ffb86f"]] //trit




function clickInfoCollapse() {
  let content = document.getElementById('clickInfoContent')
  let plus = document.getElementById('plusButton')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
  } else {
    plus.textContent = '-'
    content.style.display = "block";
  }
}
function edgeInfoCollapse() {
  let content = document.getElementById('edgeInfoContent')
  let plus = document.getElementById('plusButtonEdge')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
  } else {
    plus.textContent = '-'
    content.style.display = "block";
  }
}
function hoverInfoCollapse() {
  let content = document.getElementById('hoverInfoContent')
  let plus = document.getElementById('plusButtonHover')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
  } else {
    plus.textContent = '-'
    content.style.display = "block";
  }
}

function pinnedCollapse(element) {
  let content = document.getElementById("pinnedNode" + element).nextElementSibling

  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
}

function pinnedEdgeCollapse(element) {
  let content = document.getElementById("pinnedEdge" + element).nextElementSibling

  if (content.style.display === "block") {
    content.style.display = "none";
  } else {
    content.style.display = "block";
  }
}



function Vis({ dataSet }) {
  //State

  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [edgeAttrDisplayed, setEdgeAttrDisplayed] = useState(dataSet.attrInfo.edgeAttrOrdinal);
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [popupNode, setPopupNode] = useState(null);
  const [popupEdge, setPopupEdge] = useState(null);
  // coloring 
  let colorSchemeScale = d3.scaleOrdinal().domain(Object.keys(dataSet.attrInfo.nodeColorAttrMapping)).range(Object.values(dataSet.attrInfo.nodeColorAttrMapping).map((colorIndex) => colorScheme[colorIndex]));
  let colorScalePositive = d3.scaleLinear().domain([0, dataSet.attrInfo.max[edgeAttrDisplayed]]).range(["#7cc6f2", "#20A4F3"]);
  let colorScaleNegative = d3.scaleLinear().domain([dataSet.attrInfo.min[edgeAttrDisplayed], 0]).range(["#ff1900", "#ff6554"]);
  let colorNeutral = "#f6ff00"

  function showEdgeTable(nodeId) {
    setPopupNode(nodeId);
  }
  function showEdgyTable(edgeId) {
    setPopupEdge(edgeId);
  }
  function popupNodeClose() {
    setPopupNode(null);
  }
  function popupEdgeClose() {
    setPopupEdge(null);
  }

  return (
    <>
      {/* Visualization */}
      <div className="visContainer">
        {/* AdjacencyMatrix */}
        <div className="AMContainer">

          <AdjacencyMatrix
            width={550}
            height={550}
            headerWidth={100}
            ordering={dataSet.orderings.incremental}
            edges={dataSet.edgeInfo}
            nodes={dataSet.nodes}
            nodeAttrDisplay={dataSet.attrInfo.nodeNameDisplay}
            edgeAttrDisplay={edgeAttrDisplayed}
            hoveredNode={hoveredNode}
            setHoveredEdge={setHoveredEdge}
            setSelectedEdges={setSelectedEdges}
            selectedEdges={selectedEdges}
            colorPositiveScale={colorScalePositive}
            colorNegativeScale={colorScaleNegative}
            colorNeutral={colorNeutral}
            nodeAttrColorCoding={dataSet.attrInfo.nodeColorAttrMapping}
            nodeColorAttr={dataSet.attrInfo.nodeColorAttr}
            colorSchemeScale={colorSchemeScale}
          />
          
        </div>
        <h3 className="amHeader">Adjacency Matrix</h3>
        <div className="TAContainer">

          <ThreadArcs
            width={450}
            height={600}
            ordering={dataSet.orderings.incremental}
            edges={dataSet.edgeInfo}
            nodes={dataSet.nodes}
            nodeNameDisplay={dataSet.attrInfo.nodeNameDisplay}
            edgeAttr={edgeAttrDisplayed}
            colorSchemeScale={colorSchemeScale}
            nodeColorAttr={dataSet.attrInfo.nodeColorAttr}
            setHoveredNode={setHoveredNode}
            hoveredEdge={hoveredEdge}
            setSelectedNodes={setSelectedNodes}
            selectedNodes={selectedNodes}
          />
        </div>
        <h3 className='threadArcHeader'>Threadarcs</h3>
        {/* Container for extra info */}
        <div className="UIContainer">
          <div className="infoContainer">
            {/* Container for legend */}
            <div className="legend"></div>
            {/* Container for hover info */}
            <div className="hoverInfo"></div>
            <button className="clickInfoCollaps" onClick={hoverInfoCollapse}>Hover info<span className="PlusButton" id='plusButtonHover'>-</span></button>
            <div id="hoverInfoContent" className="hoverInfoContent" style={{ display: "block", minHeight: "5vh" }}>
              {hoveredEdge ? (<>
                <div>From: {dataSet.nodes[hoveredEdge.split("-")[0]].Email}</div>
                <div>To: {dataSet.nodes[hoveredEdge.split("-")[1]].Email}</div>
                {dataSet.attrInfo.edgeAttrOrdinal.map((j) => {
                  return <div className="attrInfo">Average {j}: {dataSet.edgeInfo[hoveredEdge][j]}</div>
                })}</>)
                : (hoveredNode ? (dataSet.attrInfo.nodeAttr.map((j) => {
                  return <div className="attrInfo">{j}: {dataSet.nodes[hoveredNode][j]} </div>
                }
                )) : "")}
            </div>
            {/* Container for pinned nodes */}
            <div className="ClickInfo" id='clickInfo'>
              <button onClick={clickInfoCollapse} className='clickInfoCollaps'>Pinned node info<span className="PlusButton" id='plusButton'>-</span></button>
              <div className='clickInfoContent' style={{ display: "block" }} id='clickInfoContent'>
                {selectedNodes.map((i) =>
                  <>
                    <button id={'pinnedNode' + i} className="clickShow" onClick={() => pinnedCollapse(i)}

                    >Node ID: {i}</button>
                    <div className="pinnedContent" style={{ display: 'none' }}>
                      {dataSet.attrInfo.nodeAttr.map((j) => {
                        return <div className="attrInfo">{j}: {dataSet.nodes[i][j]} </div>
                      }
                      )}
                      <button onClick={() => showEdgeTable(i)}>More info</button>

                    </div>

                  </>
                )}
                {popupNode ? <EdgesOfNodeTable dataSet={dataSet} nodeId={popupNode} closeFunction={() => popupNodeClose()} /> : ""}
              </div>
            </div>
            <div className="ClickInfo" id='clickInfo'>
              <button onClick={edgeInfoCollapse} className='clickInfoCollaps'>Pinned edge info<span className="PlusButton" id='plusButtonEdge'>-</span></button>
              <div className='clickInfoContent' style={{ display: "block" }} id='edgeInfoContent'>
                {selectedEdges.map((i) =>
                  <>
                    <button id={'pinnedEdge' + i} className="clickShow" onClick={() => pinnedEdgeCollapse(i)}

                    >Edge ID: {i}</button>
                    <div className="pinnedContent" style={{ display: 'none' }}>
                      <div>From: {dataSet.nodes[i.split("-")[0]].Email}</div>
                      <div>To: {dataSet.nodes[i.split("-")[1]].Email}</div>
                      {dataSet.attrInfo.edgeAttrOrdinal.map((j) => {
                        return <div className="attrInfo">Average {j}: {dataSet.edgeInfo[i][j]}</div>
                      })}
                      <button onClick={() => showEdgyTable(i)}>More info</button>
                    </div>
                  </>
                )}
                {popupEdge ? <EdgeTable dataSet={dataSet} nodeId={popupNode} closeFunction={() => popupEdgeClose()} /> : ""}
              </div>
            </div>
          </div>
          <div className="cmContainer">
            
          </div>
        </div>
      </div>
    </>
  );
}
export default Vis;

function EdgesOfNodeTable({ dataSet, nodeId, closeFunction }) {

  let edges = dataSet.edgeInfo;
  let edgesFrom = [];
  let edgesTo = [];

  let exEdge;
  let edgeAttrs = [];

  // Find the edges from/to the selected node
  Object.keys(edges).map(key => {
    let [from, to] = key.split("-");
    if (from == nodeId) edgesFrom.push(edges[key]);
    if (to == nodeId) edgesTo.push(edges[key]);

    if(!exEdge) exEdge = edges[key];
  });

  // Store the custom edge attributes to retrieve them later
  if(exEdge) {
    for(var key in exEdge) {
      if(!["count", "edges", "fromId", "toId"].includes(key)) {
        edgeAttrs.push(key);
      }
    }
  }

  return (
    <div className="popTable"> {console.log("edge table")}
      <div className='tablepopup-content'>
        <table style={{ width: "100%" }}>
          <thead style={{ backgroundColor: "#DDD" }}>
            <tr>
              <th>To ID</th>
              <th>Count</th>
              {
                edgeAttrs.map(attr => {
                  return <th>{attr.charAt(0).toUpperCase() + attr.substring(1)}</th>
                })
              }
            </tr>
          </thead>  
          <tbody>
            {
              edgesFrom.map(edge => {
                return <tr className="node-table-row" ><td>{edge.toId}</td><td>{edge.count}</td>{
                  edgeAttrs.map(attr => {
                    return <td>{edge[attr]}</td>
                  })
                }</tr>
              })
            }
          </tbody>
        </table>
        <br />
        <table style={{ width: "100%" }}>
          <thead style={{ backgroundColor: "#DDD" }}>
            <tr>
              <th>From ID</th>
              <th>Count</th>
              {
                edgeAttrs.map(attr => {
                  return <th>{attr.charAt(0).toUpperCase() + attr.substring(1)}</th>
                })
              }
            </tr>
          </thead>  
          <tbody>
            {
              edgesTo.map(edge => {
                return <tr className="node-table-row" ><td>{edge.fromId}</td><td>{edge.count}</td>{
                  edgeAttrs.map(attr => {
                    return <td>{edge[attr]}</td>
                  })
                }</tr>
              })
            }
          </tbody>
        </table>
        <button onClick={closeFunction}>Wtf</button>
      </div>
    </div>
  )
}



function EdgeTable({ dataSet, nodeId, closeFunction }) {
  return (
    <div className="popTable">
      <button className="tableClose" onClick={closeFunction}>Wtf</button>
    </div>
  )
}