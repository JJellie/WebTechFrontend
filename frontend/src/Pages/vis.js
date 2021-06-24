import ThreadArcs from './ThreadArcs.js';
import AdjacencyMatrix from './AdjacencyMatrix.js';
import '../Css/visual.css';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
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




function Vis({ dataSet }) {
  console.log(dataSet);


  //State
  
  const [hoveredEdge, setHoveredEdge] = useState([null,null]);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [edgeAttrDisplayed, setEdgeAttrDisplayed] = useState(dataSet.attrInfo.edgeAttrOrdinal);
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);

  // coloring 
  let colorSchemeScale = d3.scaleOrdinal().domain(Object.keys(dataSet.attrInfo.nodeColorAttrMapping)).range(Object.values(dataSet.attrInfo.nodeColorAttrMapping).map((colorIndex) => colorScheme[colorIndex]));  
  let colorScalePositive = d3.scaleLinear().domain([0,dataSet.attrInfo.max[edgeAttrDisplayed]]).range(["#7cc6f2","#20A4F3"]);
  let colorScaleNegative = d3.scaleLinear().domain([dataSet.attrInfo.min[edgeAttrDisplayed],0]).range(["#ff1900","#ff6554"]);
  let colorNeutral = "#f6ff00"
  
  return (
    <>
      {/* Visualization */}
        <div className="visContainer">
          {/* AdjacencyMatrix */}
          <div className="AMContainer">
            <h1 className='Visheader'> AdjacencyMatrix </h1>
            <AdjacencyMatrix 
              width={500}
              height={500}
              headerWidth={50}
              ordering={dataSet.orderings.incremental}
              edges={dataSet.edgeInfo}
              nodes={dataSet.nodes}
              nodeAttrDisplay={dataSet.attrInfo.nodeNameDisplay}
              edgeAttrDisplay={edgeAttrDisplayed}
              setHoveredEdge={setHoveredEdge}
              setSelectedEdge={setSelectedEdge}
              colorPositiveScale={colorScalePositive}
              colorNegativeScale={colorScaleNegative}
              colorNeutral={colorNeutral}
              nodeAttrColorCoding={dataSet.attrInfo.nodeColorAttrMapping}
              nodeColorAttr={dataSet.attrInfo.nodeColorAttr}
              colorScheme={colorScheme}
            />
          </div>

          <div className="TAContainer">
            <h1 className='Visheader'> Thread Arcs </h1>
            <ThreadArcs 
              width={450}
              height={600}
              ordering={dataSet.orderings.incremental}
              edges={dataSet.edgeInfo}
              nodes={dataSet.nodes}
              nodeNameDisplay={dataSet.attrInfo.nodeNameDisplay}
              edgeAttr={edgeAttrDisplayed}
              setHoveredEdge={setHoveredEdge}
              setSelectedEdge={setSelectedEdge}
              colorSchemeScale={colorSchemeScale}
              nodeColorAttr={dataSet.attrInfo.nodeColorAttr}
            />
          </div>

          <div className="UIConainer">
            <div className="legend"></div>
            <div className="hoverInfo">
              {hoveredEdge[0]}

            </div>
          </div>
        </div> 
    </>
  );
}
export default Vis;

{/*  <h1 className='Visheader'> Threadarcs </h1>
                <div className='ThreadArc' id='ThreadarcContainter'>
                    <ThreadArcs />
                </div> */}