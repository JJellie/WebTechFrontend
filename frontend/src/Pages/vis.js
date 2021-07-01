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

const orderings = ["incremental", "alphabetically", "random", "spectral", "barycenter","reverse cuthill mckee"];


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

function colorCoding(nodeAttrCategorical, colorScheme) {
  if(!nodeAttrCategorical) {
    return [[], [colorScheme[0]]];
  }
  // nodeAttrCategorical = [{"Attr" : "ceo", "count" : 2}, {"Attr" : "unknown", "count" : 2}]
  let domain = []
  let range = []
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
let matrixDirected;
let matrixUndirected;

function computeSpectral(ordering, matrix){
  let graph = reorder.mat2graph(matrix, false);
  let spectral = reorder.spectral_order(graph);
  console.log(spectral);
  let spectralOrdering = [];
  for (let i = 0; i < spectral.length; i++){
      spectralOrdering.push(spectral[i]+1);
  }
  console.log(computeSpectral);
  return spectralOrdering;
}

function computeBarycenter(ordering, matrix, network){
  console.log(matrix);
  let val = (network === "undirected") ? false : true;
  let graph = reorder.mat2graph(matrix, val);
  let barycenter = reorder.barycenter_order(graph);
  console.log(barycenter);
  let improved = reorder.adjacent_exchange(graph, barycenter[0],  barycenter[1]);
  console.log(improved);
  let barycenterOrdering = [];
  for (let i = 0; i < improved[0].length; i++){
      barycenterOrdering.push(improved[0][i]+1);
  }
  console.log(barycenterOrdering);
  return barycenterOrdering;
}

function computeRCM(ordering, matrix){ // bandwith reduction: reverse cuthill-mckee
  let graph = reorder.mat2graph(matrix, false);
  let rcm = reorder.reverse_cuthill_mckee_order(graph);
  let rcmOrder = [];
  for (let i = 0; i < rcm.length; i++){
      rcmOrder.push(rcm[i]+1);
  }
  return rcmOrder;
}


function sortAlphabetically(ordering, nodes, identifier) { // in JS objects are always passed around by reference, assigning new var changes initial
  return ordering.sort((a,b) => {
    if(nodes[a][identifier] < nodes[b][identifier]) { return -1; }
    if(nodes[a][identifier] > nodes[b][identifier]) { return 1; }
    return 0;
  })
}

function sortRandomly(ordering){
  for (let i = 0; i < ordering.length; i++) { // uses Fisher-Yates shuffle algorithm for random sorting of array 
      let x = ordering[i];
      let y = Math.floor(Math.random() * (i + 1));
      ordering[i] = ordering[y];
      ordering[y] = x;
    }
  return ordering;
}


function Vis({ dataSet }) {
  console.log(dataSet);
  //State
  const [hoveredEdge, setHoveredEdge] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [popupNode, setPopupNode] = useState(null);
  const [popupEdge, setPopupEdge] = useState(null);
  const [customization, setCustom] = useState({
    "cScheme": 0, 
    "amValue":dataSet.attrInfo.edgeAttrOrdinal[0], 
    "ordering": "incremental",
    "network" : "directed", 
    "identifier": dataSet.attrInfo.nodeAttrUnique[0] ? dataSet.attrInfo.nodeAttrUnique[0] : null, 
    "colorGrouping": Object.keys(dataSet.attrInfo.nodeAttrCategorical).length !== 0 ? (Object.keys(dataSet.attrInfo.nodeAttrCategorical).find(element => !dataSet.attrInfo.nodeAttrUnique.includes(element)) ? Object.keys(dataSet.attrInfo.nodeAttrCategorical).find(element => !dataSet.attrInfo.nodeAttrUnique.includes(element)) : dataSet.attrInfo.nodeAttrCategorical[0]) : null });
  const [colorScheme, setColorScheme] = useState(colorSchemes[customization.cScheme]);
  console.log(customization);
  // coloring 
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
  let colorSchemeScale = useMemo(() => {
    const [domain, range] = colorCoding(dataSet.attrInfo.nodeAttrCategorical[customization.colorGrouping] ? dataSet.attrInfo.nodeAttrCategorical[customization.colorGrouping] : null, colorSchemes[customization.cScheme]);
    console.log(domain, range);
    return d3.scaleOrdinal().domain(domain).range(range)}, [customization.cScheme]);
  let colorScalePositive = d3.scaleLinear().domain([0, dataSet.attrInfo.max[customization.amValue]]).range(["#7cc6f2", "#20A4F3"]);
  let colorScaleNegative = d3.scaleLinear().domain([dataSet.attrInfo.min[customization.amValue], 0]).range(["#ff1900", "#ff6554"]);
  let colorNeutral = "#f6ff00"
  
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
  useEffect(()=>{
    let directed = [];
    let undirected = [];
    for(let y in dataSet.orderings.incremental) {
      directed.push([]);
      undirected.push([]);
      for(let x in dataSet.orderings.incremental) {
        let edgeId = `${dataSet.orderings.incremental[y]}-${dataSet.orderings.incremental[x]}`;
        let edgeIdOther = `${dataSet.orderings.incremental[x]}-${dataSet.orderings.incremental[y]}`;
        let directedValue = dataSet.edgeInfo[edgeId] ? 1:0;
        let undirectedValue = dataSet.edgeInfo[edgeIdOther] || directedValue ? 1 : 0;

        directed[y][x] = directedValue;
        undirected[y][x] = undirectedValue;
      }
    }

    matrixDirected = directed;
    matrixUndirected = undirected;
  }, [])



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
            edges={dataSet.edgeInfo}
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
            edges={dataSet.edgeInfo}
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
          />
        </div>
        <div className="taHeaderContainer">
          <h3 className='header'>Threadarcs</h3>
        </div>
        
        {/* Container for extra info */}
        <div className="UIContainer">
          <div className="infoContainer">
            {/* Container for legend */}
            <div className="legend"></div>
            {/* Container for hover info */}
            <div className="hoverInfo"></div>
            <button className="clickInfoCollaps" onClick={hoverInfoCollapse}>Hover info<span className="PlusButton" id='plusButtonHover'>-</span></button>
            <div id="hoverInfoContent" className="hoverInfoContent" style={{ display: "block", minHeight: "5vh" }}>
              {hoveredEdge  ? (<>
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
                {popupEdge ? <EdgeTable dataSet={dataSet} edgeId={popupEdge} closeFunction={() => popupEdgeClose()} /> : ""}
              </div>
            </div>
          </div>
          <div className="cmContainer">
            <label htmlFor="cScheme">Choose a colorscheme for color defficiency: </label>
            <select id="cScheme" className='custDropdown' onChange={() => colorChange()}>
              <option value={0}>Default</option>
              <option value={2}>Deuteranopia</option>
              <option value={3}>Tritanopia</option>
              <option value={1}>Protanopia</option>
            </select>
            <label htmlFor="cScheme">Choose a value to be presented in the Adjacency matrix: </label>
            <select id="amValue" className='custDropdown' onChange={() => amValChange()}>
              {dataSet.attrInfo.edgeAttrOrdinal.map((i) => { 
              return(<option value={i}>{i}</option>)})}
            </select>
            <label htmlFor="cScheme">Select an ordering: </label>
            <select id="ordering" className='custDropdown' onChange={() => chooseOrdering()}>
              {orderings.map((i) => { 
              return(<option value={i}>{i}</option>)})}
            </select>
            <label htmlFor="cScheme">Choose a value to be presented in the Adjacency matrix: </label>
            <select id="identifier" className='custDropdown' onChange={() => identifierChange()}>
              {dataSet.attrInfo.nodeAttrUnique.map((i) => { 
              return(<option value={i}>{i}</option>)})}
              <option value={null}>{"id"}</option>
            </select>
            
            <label htmlFor="cScheme">Choose an attribute for the color coding: </label>
            <select id="colorGrouping" className='custDropdown' onChange={() => colorGrouping()}>
              {Object.keys(dataSet.attrInfo.nodeAttrCategorical).map((i) => { 
              return(<option value={i}>{i}</option>)})}
            </select>

            <label htmlFor="cScheme">Undirected or directed network: </label>
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
          />, [dataSet, customization])}
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


const timeFormat = d3.timeFormat("%d %b %Y");

function EdgeTable({ dataSet, edgeId, closeFunction }) {

  let edgeInfo = dataSet.edgeInfo[edgeId];
  console.log(edgeId);
  console.log(edgeInfo);

  let edges = edgeInfo.edges;
  let edgeDates = Object.keys(edges);
  let edgeAttrs = Object.keys(edges[edgeDates[0]][0]);

  let counter = 0;

  return (
    <div className="popTable">
      <div className='tablepopup-content'>
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
              edgeDates.map(date => { counter++;
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

        <button onClick={closeFunction}>Wtf</button>
      </div>
      
    </div>
  )
}