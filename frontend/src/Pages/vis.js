import ThreadArcs from './ThreadArcs.js';
import AdjacencyMatrix from './AdjacencyMatrix.js';
import Timegraph from './Timegraph.js';
import '../Css/visual.css';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import * as d3 from "d3";
import Banner from "../Images/banner vis.png";
import Divider from "../Images/divider.png";
import { Link } from "react-router-dom";
import { popupShow, DatasetPopup } from "./backend.js";
const reorder = require("reorder.js");

// Different colorschemes for color blindness 
const colorSchemes =
  [["#20A4F3", "#FFBA49", "#57A773", "#F06C9B", "#5B2A86", "#FB3640", "#CE98F5"], //default
  ['#3b1f2b', '#a23b72', '#c73e1d', '#f18f01', '#2e86ab', '#00ffc5', '#4acee0'], //prot
  ["#813405", "#7f0799", "#ff4365", "#058ed9", "#00d9c0", "#e4ff1a", "#b7ad99"], //deut
  ["#693668", "#a74482", "#b9415f", "#ff3562", "#b7986e", "#ee8e2c", "#ffb86f"]] //trit

//Variable to keep track of collapsable max-height
  let height = 10;

//All ordering names 
const orderings = ["incremental", "alphabetically", "random", "spectral", "barycenter","reverse cuthill mckee"];

//Function to change collapsable max-height when collapsing others
function updateCss(collaps, mode) {
  if (collaps === 'edge' || collaps === "node") {
    if(mode) {
      height = height- 10;
    } else {
      height = height+ 10;
    }
  }
  if (collaps === 'legend') {
    if(mode) {
      height = height- 15;
    } else {
      height = height+ 15;
    }
  }
  if (collaps === 'hover') {
    if(mode) {
      height = height- 2;
    } else {
      height = height+ 2;
    }
  }
  document.documentElement.style.setProperty('--dropdownheight', ""+ height+ "vh")
}

//Function to collapse all pinned node info boxes
function clickInfoCollapse() {
  let content = document.getElementById('clickInfoContent')
  let plus = document.getElementById('plusButton')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
    updateCss('node', false)
  } else {
    plus.textContent = '-'
    content.style.display = "block";
    updateCss('node', true)
  }
}

//Function to collapse all pinned edge info boxes
function edgeInfoCollapse() {
  let content = document.getElementById('edgeInfoContent')
  let plus = document.getElementById('plusButtonEdge')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
    updateCss('edge', false)
  } else {
    plus.textContent = '-'
    content.style.display = "block";
    updateCss('edge', true)

  }
}

//Function to collapse legend box
function legendInfoCollapse() {
  let content = document.getElementById('legend')
  let plus = document.getElementById('plusButtonLegend')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
    updateCss('legend', false)
  } else {
    plus.textContent = '-'
    content.style.display = "block";
    updateCss('legend', true)
  }
}

//Function to collapse hover info
function hoverInfoCollapse() {
  let content = document.getElementById('hoverInfoContent')
  let plus = document.getElementById('plusButtonHover')
  if (content.style.display === "block") {
    plus.textContent = "+"
    content.style.display = "none";
    updateCss('hover', false)
  } else {
    plus.textContent = '-'
    content.style.display = "block";
    updateCss('hover', true)
  }
}

//Function to collapse a pinned nodes info
function pinnedCollapse(element) {
  let btn = document.getElementById("pinnedNode" + element);
  let content = btn.nextElementSibling;

  if (content.style.display === "block") {
    content.style.display = "none";
    btn.style.backgroundColor = "inherit";
  } else {
    content.style.display = "block";
    btn.style.backgroundColor = "#CCCCCCAA";
  }
}

//Function to collapse a pinned edges info
function pinnedEdgeCollapse(element) {
  let btn = document.getElementById("pinnedEdge" + element);
  let content = btn.nextElementSibling;

  if (content.style.display === "block") {
    content.style.display = "none";
    btn.style.backgroundColor = "inherit";
  } else {
    content.style.display = "block";
    btn.style.backgroundColor = "#CCCCCCAA";
  }
}

//Function to calculate color scale for visualisations
function colorCoding(nodeAttrCategorical, colorScheme) {
  if(!nodeAttrCategorical) {
    return [[], [colorScheme[0]]];
  }
  // nodeAttrCategorical = [{"Attr" : "ceo", "count" : 2}, {"Attr" : "unknown", "count" : 2}]
  let domain = [];
  let range = [];
  for(let i = 0; i < nodeAttrCategorical.length; i++) {
    if(i < 5) {
      domain.push(nodeAttrCategorical[i].Attr)
      range.push(colorScheme[i])
    } else {
      domain.push(nodeAttrCategorical[i].Attr)
      range.push(colorScheme[5])
    }
  }
  return [domain, range];
}

let matrixDirected; //2d array for a Directed adjacency matrix
let matrixUndirected; //2d array for an Undirected adjacency matrix

//Compute spectral reordering
function computeSpectral(ordering, matrix){
  let graph = reorder.mat2graph(matrix, false);
  let spectral = reorder.spectral_order(graph);
  let spectralOrdering = [];
  for (let i = 0; i < spectral.length; i++){
    spectralOrdering.push(ordering[spectral[i]]);
  }
  return spectralOrdering;
}

//Compute barycenter reordering
function computeBarycenter(ordering, matrix, network){
  let val = (network === "undirected") ? false : true;
  let graph = reorder.mat2graph(matrix, val);
  let barycenter = reorder.barycenter_order(graph);
  let improved = reorder.adjacent_exchange(graph, barycenter[0],  barycenter[1]);
  let barycenterOrdering = [];
  for (let i = 0; i < improved[0].length; i++){
    barycenterOrdering.push(ordering[improved[0][i]]);
  }
  return barycenterOrdering;
}

//Compute RCM reordering
function computeRCM(ordering, matrix){ // bandwith reduction: reverse cuthill-mckee
  let graph = reorder.mat2graph(matrix, false);
  let rcm = reorder.reverse_cuthill_mckee_order(graph);
  let rcmOrder = [];
  for (let i = 0; i < rcm.length; i++){
    rcmOrder.push(ordering[rcm[i]]);
  }
  return rcmOrder;
}

//Compute alphabetical reordering
function sortAlphabetically(ordering, nodes, identifier) { // in JS objects are always passed around by reference, assigning new var changes initial
  if(identifier === 'id'){
    return ordering.sort((a,b) => a-b)
  } else {
    return ordering.sort((a,b) => {
      if(nodes[a][identifier] < nodes[b][identifier]) { return -1; }
      if(nodes[a][identifier] > nodes[b][identifier]) { return 1; }
      return 0;
    })
  }
}

//Compute random reordering
function sortRandomly(ordering){
  for (let i = 0; i < ordering.length; i++) { // uses Fisher-Yates shuffle algorithm for random sorting of array 
      let x = ordering[i];
      let y = Math.floor(Math.random() * (i + 1));
      ordering[i] = ordering[y];
      ordering[y] = x;
    }
  return ordering;
}


//Search through dates
function dateBinarySearch(dates, date, begin){
  let max = dates.length-1;
  let min = 0;
  let mid = Math.round((max+min)/2);
  while(max-min > 1){
    if(date > dates[mid]){
      min = mid;
    } else if (date < dates[mid]) {
      max = mid;
    } else {
      return mid;
    }
    mid = Math.round((max+min)/2);
  }
  if(begin) {
    return max
  } else {
    return min
  }
}

//Reverse edge id from 1-2 to 2-1
function reverseEdgeId(edgeId) {
  const [fromNode, toNode] = edgeId.split("-");
  return `${toNode}-${fromNode}`;
}

let edgeInfoDirected;     //Timegraph filtered edgeinfo for directed vis
let edgeInfoUndirected;   //Timegraph filtered edgeinfo for undirected vis
let previousTimePeriod = null;  //For comparing previousperiod to current to avoid recomputing

function Vis({ dataSet }) {
  //State
  const [hoveredEdge, setHoveredEdge] = useState(null);   //Keep track of which edge is hovered for crosshover
  const [hoveredNode, setHoveredNode] = useState(null);   //Keep track of which node is hovered for crosshover
  const [selectedNodes, setSelectedNodes] = useState([]); //Keep track of which nodes are pinned
  const [selectedEdges, setSelectedEdges] = useState([]); //Keep track of which edges are pinned
  const [popupNode, setPopupNode] = useState(null);       //Keep track of node for more info button
  const [popupEdge, setPopupEdge] = useState(null);       //Keep track of edge for more info button
  const [customization, setCustom] = useState({           //Keep track of customization options
    "cScheme": 0, 
    "amValue":dataSet.attrInfo.edgeAttrOrdinal[0], 
    "ordering": "incremental",
    "network" : "directed", 
    "identifier": dataSet.attrInfo.nodeAttrUnique[0] ? dataSet.attrInfo.nodeAttrUnique[0] : "id", 
    "colorGrouping": Object.keys(dataSet.attrInfo.nodeAttrCategorical).length !== 0 ? (Object.keys(dataSet.attrInfo.nodeAttrCategorical).find(element => !dataSet.attrInfo.nodeAttrUnique.includes(element)) ? Object.keys(dataSet.attrInfo.nodeAttrCategorical).find(element => !dataSet.attrInfo.nodeAttrUnique.includes(element)) : dataSet.attrInfo.nodeAttrCategorical[0]) : null });
  const [unpinNode, setUnpinNode] = useState(null);       //For unpinning a node with the unpin button
  const [unpinEdge, setUnpinEdge] = useState(null);       //For unpinning an edge with the unpin button
  const [timePeriod, setTimePeriod] = useState(null);     //For checking edges against time selected time


  // date filter
  if(timePeriod) {
    if(previousTimePeriod ? !(timePeriod[0] == previousTimePeriod[0] && timePeriod[1] == previousTimePeriod[1]) : true) {
      previousTimePeriod = [...timePeriod];
      const datesSorted = dataSet.datesSorted;
      const edges = dataSet.edges;
      const beginIndex = dateBinarySearch(datesSorted, timePeriod[0], true);
      const endIndex = dateBinarySearch(datesSorted, timePeriod[1], false);
      edgeInfoDirected = JSON.parse(JSON.stringify(dataSet.edgeInfo));
      edgeInfoUndirected = JSON.parse(JSON.stringify(dataSet.edgeInfoUndirected));
      
      if(endIndex-beginIndex > datesSorted.length/2) {
        for(let edgeId of Object.keys(edgeInfoUndirected)) {
          for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
            edgeInfoUndirected[edgeId][attr] = edgeInfoUndirected[edgeId][attr]*edgeInfoUndirected[edgeId].count;
            if(edgeInfoDirected[edgeId]) {edgeInfoDirected[edgeId][attr] = edgeInfoDirected[edgeId][attr]*edgeInfoDirected[edgeId].count}
          }
        }
        let date;
        for(let i = 0; i<beginIndex; i++) {
          date = datesSorted[i];
          for(let edgeId of Object.keys(edges[date].edges)){
            for(let edgeIndex in edges[date].edges[edgeId]){
              for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
                let attrValue = edges[date].edges[edgeId][edgeIndex][attr]
                edgeInfoUndirected[edgeId][attr] -= attrValue;
                edgeInfoUndirected[reverseEdgeId(edgeId)][attr] -= attrValue;
                edgeInfoDirected[edgeId][attr] -= attrValue;
              }
              edgeInfoUndirected[edgeId].count--
              edgeInfoUndirected[reverseEdgeId(edgeId)].count--
              edgeInfoDirected[edgeId].count--
            }
          }
        }
        for(let i = endIndex+1; i<datesSorted.length; i++) {
          date = datesSorted[i];
          for(let edgeId of Object.keys(edges[date].edges)){
            for(let edgeIndex in edges[date].edges[edgeId]){
              for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
                let attrValue = edges[date].edges[edgeId][edgeIndex][attr]
                edgeInfoUndirected[edgeId][attr] -= attrValue;
                edgeInfoUndirected[reverseEdgeId(edgeId)][attr] -= attrValue;
                edgeInfoDirected[edgeId][attr] -= attrValue;
              }
              edgeInfoUndirected[edgeId].count--
              edgeInfoUndirected[reverseEdgeId(edgeId)].count--
              edgeInfoDirected[edgeId].count--
            }
          }
        }
        for(let edgeId of Object.keys(edgeInfoUndirected)) {
          if(edgeInfoUndirected[edgeId].count === 0){
            delete edgeInfoUndirected[edgeId];
            if(edgeInfoDirected[edgeId]) {delete edgeInfoDirected[edgeId]}
          } else {
            for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
              edgeInfoUndirected[edgeId][attr] = edgeInfoUndirected[edgeId][attr]/edgeInfoUndirected[edgeId].count;
              if(edgeInfoDirected[edgeId]) {edgeInfoDirected[edgeId][attr] = edgeInfoDirected[edgeId][attr]/edgeInfoDirected[edgeId].count}
            }
          }
        }
      // else
      } else {
        for(let edgeId of Object.keys(edgeInfoUndirected)) {
          for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
            edgeInfoUndirected[edgeId][attr] = 0;
            edgeInfoUndirected[edgeId].count = 0;
            if(edgeInfoDirected[edgeId]) {
              edgeInfoDirected[edgeId][attr] = 0;
              edgeInfoDirected[edgeId].count = 0;
            }
          }
        }
        let date;
        for(let i = beginIndex; i<=endIndex; i++) {
          date = datesSorted[i];
          for(let edgeId of Object.keys(edges[date].edges)){
            for(let edgeIndex in edges[date].edges[edgeId]){
              for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
                let attrValue = edges[date].edges[edgeId][edgeIndex][attr]
                console.log("attrbalue", attrValue);
                console.log(typeof(attrValue));
                edgeInfoUndirected[edgeId][attr] += attrValue;
                edgeInfoUndirected[reverseEdgeId(edgeId)][attr] += attrValue;
                edgeInfoDirected[edgeId][attr] += attrValue;
                console.log("edge", edgeInfoDirected[edgeId][attr]);
              }
              edgeInfoUndirected[edgeId].count++
              edgeInfoUndirected[reverseEdgeId(edgeId)].count++
              edgeInfoDirected[edgeId].count++
            }
          }
        }
        for(let edgeId of Object.keys(edgeInfoUndirected)) {
          if(edgeInfoUndirected[edgeId].count === 0) {
            delete edgeInfoUndirected[edgeId];
            if(edgeInfoDirected[edgeId]) {delete edgeInfoDirected[edgeId]}
          } else {
            for(let attr of dataSet.attrInfo.edgeAttrOrdinal) {
              edgeInfoUndirected[edgeId][attr] = edgeInfoUndirected[edgeId][attr]/edgeInfoUndirected[edgeId].count;
              if(edgeInfoDirected[edgeId]) {edgeInfoDirected[edgeId][attr] = edgeInfoDirected[edgeId][attr]/edgeInfoDirected[edgeId].count}
            }
          }
        }
      }
    }
  } 

  // Change network type if changed to some specific orderings
  let ordering = useMemo(() => {
    if (customization.ordering === "random") {
      return sortRandomly([...dataSet.orderings.incremental]);
    }
    else if (customization.ordering === "alphabetically") {
      return sortAlphabetically([...dataSet.orderings.incremental], dataSet.nodes, customization.identifier); //contains the alphabetic order of the nodes
    }
    else if (customization.ordering === "incremental") {
      return dataSet.orderings.incremental;
    }
    else if (customization.ordering === "spectral") {
      setCustom({...customization, 'network': "undirected"});
      return computeSpectral([...dataSet.orderings.incremental], matrixUndirected);
    }
    else if (customization.ordering === "barycenter") {
      return (customization.network === "undirected") ? computeBarycenter([...dataSet.orderings.incremental],matrixUndirected,customization.network) : computeBarycenter([...dataSet.orderings.incremental],matrixDirected,customization.network);
    }
    else if (customization.ordering === "reverse cuthill mckee") {
      setCustom({...customization, 'network': "undirected"});
      return computeRCM([...dataSet.orderings.incremental], matrixUndirected);
    }
  }, [customization.ordering, customization.network])

  // coloring
  let colorSchemeScale = useMemo(() => {
    const [domain, range] = colorCoding(dataSet.attrInfo.nodeAttrCategorical[customization.colorGrouping] ? dataSet.attrInfo.nodeAttrCategorical[customization.colorGrouping] : null, colorSchemes[customization.cScheme]);
    return d3.scaleOrdinal().domain(domain).range(range)}, [customization.cScheme,customization.colorGrouping]);
  let colorScalePositive = d3.scaleLinear().domain([0, dataSet.attrInfo.max[customization.amValue]]).range(["#7cc6f2", "#20A4F3"]);
  let colorScaleNegative = d3.scaleLinear().domain([dataSet.attrInfo.min[customization.amValue], 0]).range(["#ff1900", "#ff6554"]);
  let colorNeutral = "#f6ff00"
  


  //Functions to change state variable
  function unPinNode(circId) {
    setUnpinNode(circId)
  }
  function unPinEdge(edgeId) {
    setUnpinEdge(edgeId)
  }
  
  function networkChange() {
    setCustom({...customization, 'network': document.getElementById('network').value})
  }
  function identifierChange() {
    setCustom({...customization, 'identifier': document.getElementById('identifier').value})
  }
  function colorGrouping() {
    setCustom({...customization, 'colorGrouping': document.getElementById('colorGrouping').value})
  }

  function amValChange() {
    setCustom({...customization, "amValue": document.getElementById('amValue').value})
  }
  function chooseOrdering() {
    setCustom({...customization, "ordering": document.getElementById('ordering').value})
  }
  function colorChange() {
    setCustom({...customization, "cScheme": document.getElementById('cScheme').value})
  }
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
  
  //Create undirected and directed sets
  useEffect(()=>{
    let directed = [];
    let undirected = [];
    for(let y in dataSet.orderings.incremental) {
      directed.push([]);
      undirected.push([]);
      for(let x in dataSet.orderings.incremental) {
        let edgeId = `${dataSet.orderings.incremental[y]}-${dataSet.orderings.incremental[x]}`;
        directed[y][x] = (timePeriod ? (edgeInfoDirected[edgeId] ? 1 : 0) : (dataSet.edgeInfo[edgeId] ? 1 : 0));
        undirected[y][x] = (timePeriod ? (edgeInfoUndirected[edgeId] ? 1 : 0) : (dataSet.edgeInfoUndirected[edgeId] ? 1 : 0));
      }
    }

    matrixDirected = directed;
    matrixUndirected = undirected;
  }, [customization.ordering])


  //Html for webpage
  return (
    <>
      {/* Visualization */}
      <div className="visContainer" >
        {/* AdjacencyMatrix */}
        <div className="AMContainer" id='amContainer'>

          <AdjacencyMatrix
            dataSet={dataSet}
            width={Math.min(window.innerHeight*0.61, window.innerWidth*0.45)}
            height={Math.min(window.innerHeight*0.61, window.innerWidth*0.45)}
            headerWidth={0.2*Math.min(window.innerHeight*0.61, window.innerWidth*0.45)}
            ordering={ordering}
            edges={timePeriod ? (customization.network === "directed" ? edgeInfoDirected : edgeInfoUndirected) : (customization.network === "directed" ? dataSet.edgeInfo : dataSet.edgeInfoUndirected)}
            nodes={dataSet.nodes}
            nodeAttrDisplay={customization.identifier}
            edgeAttrDisplay={customization.amValue}
            hoveredNode={hoveredNode}
            setHoveredEdge={setHoveredEdge}
            setSelectedEdges={setSelectedEdges}
            selectedEdges={selectedEdges}
            colorPositiveScale={colorScalePositive}
            colorNegativeScale={colorScaleNegative}
            colorNeutral={colorNeutral}
            nodeAttrColorCoding={dataSet.attrInfo.nodeColorAttrMapping}
            nodeColorAttr={customization.colorGrouping}
            colorSchemeScale={colorSchemeScale}
            cust={customization}
            network={customization.network}
            unpinEdge={unpinEdge}
            setUnpinEdge={setUnpinEdge}
          />
          
        </div>
        <div className="amHeaderContainer">
          <h3 className="header">Adjacency Matrix</h3>
        </div>
        <div className="TAContainer">

          <ThreadArcs
            dataSet={dataSet}
            width={window.innerWidth*0.35}
            height={window.innerHeight*0.61}
            ordering={ordering}
            edges={timePeriod ? (customization.network === "directed" ? edgeInfoDirected : edgeInfoUndirected) : (customization.network === "directed" ? dataSet.edgeInfo : dataSet.edgeInfoUndirected)}
            nodes={dataSet.nodes}
            nodeNameDisplay={dataSet.attrInfo.nodeNameDisplay}
            edgeAttr={customization.amValue}
            colorSchemeScale={colorSchemeScale}
            nodeColorAttr={customization.colorGrouping}
            setHoveredNode={setHoveredNode}
            hoveredEdge={hoveredEdge}
            setSelectedNodes={setSelectedNodes}
            selectedNodes={selectedNodes}
            cust={customization}
            unpinNode={unpinNode}
            setUnpinNode={setUnpinNode}
          />
        </div>
        <div className="taHeaderContainer">
          <h3 className='header'>Threadarcs</h3>
        </div>
        
        {/* Container for extra info */}
        <div className="UIContainer">
          


          <div className="infoContainer">
          
            {/* Container for legend */}
            {customization.colorGrouping ?
            <> 
            
            <button className="clickInfoCollaps" onClick={legendInfoCollapse}>Legend<span className="PlusButton" id='plusButtonLegend'>-</span></button>
            <div id="legend" className="legend" style={{ display: "block" }}>
              <svg width="100%" height="100%">
              {d3.range(6).map(i=>{
                if(i === 5){
                  return (
                    <>
                    <circle cx={`15%`} cy={`${(i*15)+12}%`} r={`3.5%`} fill={colorSchemeScale.range()[i]} />
                    <text x={`22%`} y={`${(i*15)+14.5}%`}>{"Other"}</text>
                    </>
                  )
                }
                return (
                  <>
                  <circle cx={`15%`} cy={`${(i*15)+12}%`} r={`3.5%`} fill={colorSchemeScale.range()[i]} />
                  <text x={`22%`} y={`${(i*15)+13.5}%`}>{colorSchemeScale.domain()[i]}</text>
                  </>
                )
              })}
              </svg>
            </div>
            
            
            </>
            
            :""}
            {/* Container for hover info */}
            <div className="hoverInfo"></div>
            <button className="clickInfoCollaps" onClick={hoverInfoCollapse}>Hover info<span className="PlusButton" id='plusButtonHover'>-</span></button>
            <div id="hoverInfoContent" className="hoverInfoContent" style={{ display: "block", minHeight: "5vh" }}>
              {hoveredEdge  ? (<>
                <div>From: {customization.identifier === "id" ? hoveredEdge.split("-")[0] : dataSet.nodes[hoveredEdge.split("-")[0]][customization.identifier]}</div>
                <div>To: {customization.identifier === "id" ? hoveredEdge.split("-")[1] : dataSet.nodes[hoveredEdge.split("-")[1]][customization.identifier]}</div>
                {dataSet.attrInfo.edgeAttrOrdinal.map((j) => {
                  return <div className="attrInfo">Average {j}: {timePeriod ? (customization.network === "directed" ? edgeInfoDirected[hoveredEdge][j] : edgeInfoUndirected[hoveredEdge][j]) : (customization.network === "directed" ? dataSet.edgeInfo[hoveredEdge][j] : dataSet.edgeInfoUndirected[hoveredEdge][j])}</div>
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
                      <button onClick={() => unPinNode(i)}>Unpin</button>

                    </div>

                  </>
                )}
                {popupNode ? <EdgesOfNodeTable dataSet={dataSet} nodeId={popupNode} closeFunction={() => popupNodeClose()} timePeriod={timePeriod} customization={customization} /> : ""}
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
                        
                        return <div className="attrInfo">Average {j}: {timePeriod ? (customization.network === "directed" ? edgeInfoDirected[i][j] : edgeInfoUndirected[i][j]) : (customization.network === "directed" ? dataSet.edgeInfo[i][j] : dataSet.edgeInfoUndirected[i][j])}</div>
                      })}
                      <button onClick={() => showEdgyTable(i)}>More info</button>
                      <button onClick={() => unPinEdge(i)}>Unpin</button>


                    </div>
                  </>
                )}
                {popupEdge ? <EdgeTable dataSet={dataSet} edgeId={popupEdge} closeFunction={() => popupEdgeClose()} timePeriod={timePeriod} customization={customization} /> : ""}
              </div>
            </div>
          </div>
          <div className="cmContainer">
            <div><h3>Customization options:</h3></div>
            <label htmlFor="cScheme">Choose colorscheme: </label>
            <select id="cScheme" className='custDropdown' onChange={() => colorChange()}>
              <option value={0}>Default</option>
              <option value={2}>Deuteranopia</option>
              <option value={3}>Tritanopia</option>
              <option value={1}>Protanopia</option>
            </select>
            <br />
            <label htmlFor="cScheme">Displayed edge attribute: </label>
            <select id="amValue" className='custDropdown' onChange={() => amValChange()}>
              {dataSet.attrInfo.edgeAttrOrdinal.map((i) => { 
              return(<option value={i}>{i}</option>)})}
            </select>
            <br />
            <label htmlFor="cScheme">Ordering: </label>
            <select id="ordering" className='custDropdown' onChange={() => chooseOrdering()}>
              {orderings.map((i) => { 
              return(<option value={i}>{i}</option>)})}
            </select>
            <br />
            <label htmlFor="cScheme">Node identifier: </label>
            <select id="identifier" className='custDropdown' onChange={() => identifierChange()}>
              {dataSet.attrInfo.nodeAttrUnique.map((i) => { 
              return(<option value={i}>{i}</option>)})}
              <option value={"id"}>{"id"}</option>
            </select>
            <br />
            <label htmlFor="cScheme">Attribute for color coding: </label>
            <select id="colorGrouping" className='custDropdown' onChange={() => colorGrouping()}>
              {Object.keys(dataSet.attrInfo.nodeAttrCategorical).map((i) => { 
              return(   i===customization.colorGrouping ?
              (<option value={i} selected>{i}</option>): 
              (<option value={i} >{i}</option>))} )}
            </select>
            <br />
            <label htmlFor="cScheme">Network type: </label>
            <select id="network" className='custDropdown' onChange={() => networkChange()}>
              {customization.ordering !== "spectral" && customization.ordering !== "reverse cuthill mckee" ? <option value={"directed"}>{"directed"}</option> : ""}
              <option value={"undirected"}>{"undirected"}</option>
            </select>
          </div>
        </div>
        <div className="TGContainer">
          {useMemo(()=><Timegraph className="test"
            width={window.innerWidth*0.8}
            height={window.innerHeight*0.35}
            edges={dataSet.edges}
            datesSorted={dataSet.datesSorted}
            countMax={dataSet.attrInfo.maxCount}
            color={colorSchemes[customization.cScheme][0]}
            setTimePeriod={setTimePeriod}
          />, [dataSet, customization])}
        </div>
      </div>
    </>
  );
}
export default Vis;

//React component creating the moreinfo table for nodes
function EdgesOfNodeTable({ dataSet, nodeId, closeFunction, timePeriod, customization }) {
  let edges = (timePeriod ? (customization.network === "directed" ? edgeInfoDirected: edgeInfoUndirected) : (customization.network === "directed" ? dataSet.edgeInfo : dataSet.edgeInfoUndirected));
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
        <h3 style={{ marginTop: "5px" }}>Edges from ID {nodeId}</h3>
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
        
        <h3>Edges to ID {nodeId}</h3>
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
          <br />
        </table>
        <button onClick={closeFunction}>Close</button>
      </div>
    </div>
  )
}


const timeFormat = d3.timeFormat("%d %b %Y");

//React component creating the moreinfo table for edges 
function EdgeTable({ dataSet, edgeId, closeFunction, timePeriod, customization }) {

  let [fromId, toId] = edgeId.split("-");

  let edgeInfo = (timePeriod ? (customization.network === "directed" ? edgeInfoDirected[edgeId]: edgeInfoUndirected[edgeId]) : (customization.network === "directed" ? dataSet.edgeInfo[edgeId] : dataSet.edgeInfoUndirected[edgeId]));
  console.log(edgeId);
  console.log(edgeInfo);

  let edges = edgeInfo.edges;
  let edgeDates = Object.keys(edges);
  let edgeAttrs = Object.keys(edges[edgeDates[0]][0]);

  let counter = 0;

  return (
    <div className="popTable">
      <div className='tablepopup-content'>
        <h3 style={{ marginTop: "5px" }}>Edges between ID {fromId} and {toId}</h3>
        <table style={{ width: "100%" }}>
          <thead style={{ backgroundColor: "#DDD" }}>
            <tr>
              <th>Date</th>
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
              edgeDates.sort((a, b) => parseInt(a) - parseInt(b)).map(date => { counter++;
                return <><tr className="node-table-row" style={{backgroundColor: (counter % 2 === 0 ? "#EEE" : "#FFF")}}><td rowSpan={edges[date].length}>{timeFormat(date)}</td><td rowSpan={edges[date].length}>{edges[date].length}</td> {[edges[date][0]].map(edge => {
                  return edgeAttrs.map(attr => {
                    return <td>{edge[attr]}</td>
                  })
                })}</tr>
                {
                  [...edges[date]].splice(1).map(edge => {
                    return <tr style={{backgroundColor: (counter % 2 === 0 ? "#EEE" : "#FFF")}}>{edgeAttrs.map(attr => {
                      return <td>{edge[attr]}</td>
                    })}</tr>
                  })
                }
                </>
              })
            }
          </tbody>
        </table>

        <button onClick={closeFunction}>Close</button>
      </div>
      
    </div>
  )
}