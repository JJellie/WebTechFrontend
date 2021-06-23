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




function Vis2() {
  const updateDataSet = (dataSet) => {setDataSet(dataSet)};

  //State
  const [dataSet, setDataSet] = useState(null);
  const [hoveredEdge, setHoveredEdge] = useState([null,null]);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [edgeAttrDisplayed, setEdgeAttrDisplayed] = useState(null);
  const [colorScaleValues, setColorScaleValues] = useState({max : 1, min : -1})
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
  let colorSchemeScale = d3.scaleOrdinal().domain([]).range([]);
  // Coloring of edges attribute
  let colorScalePositive = d3.scaleLinear().domain([0,colorScaleValues.max]).range(["#7cc6f2","#20A4F3"]);
  let colorScaleNegative = d3.scaleLinear().domain([colorScaleValues.min,0]).range(["#ff1900","#ff6554"]);
  let colorNeutral = "#f6ff00"
  	
  //Update some values when the dataSet is changed
  useEffect(() => {
    if(dataSet) {
      setEdgeAttrDisplayed(dataSet.attrInfo.edgeAttrOrdinal[0]);
      setColorScaleValues({max : dataSet.attrInfo.max[edgeAttrDisplayed], min : dataSet.attrInfo.min[edgeAttrDisplayed]})
      colorSchemeScale = d3.scaleOrdinal().domain(Object.keys(dataSet.attrInfo.nodeColorAttrMapping)).range(Object.values(dataSet.attrInfo.nodeColorAttrMapping).map((color)=> colorScheme[color]));
    }
  }, [dataSet])
  
  console.log(colorSchemeScale);

  return (
    <>
      <DatasetPopup setDataSet={updateDataSet} colorScheme={["#FFBA49", "#57A773", "#F06C9B", "#5B2A86", "#FB3640", "#CE98F5"]} />
      <div>
        {/* ~~~~  This is the main title ~~~~  */}
        <div className="visHeader">
          <h1>Visualisation</h1>
        </div>

        {/* ~~~~  This is the top divider  ~~~~  */}
        <div className="line">
          {/* this will be a line */}
        </div>
        <div className="symbol"> <img src={Divider} alt="Divider"></img> </div>
        <div className="line2">
          {/* this will be a line */}
        </div>

        {/* ~~~~  This is the text displayed between dividers  ~~~~  */}
        <div className="visText">
          Welcome to the visualisation page. You can upload your data using the big blue button below. In the case you do not have a dataset, you can also use the standard dataset.
                        <br></br>
                        When your data is uploaded, the visualisations will be loaded in. For some extra tips, refer to our <Link to="../about">About page</Link>. <br></br>
                        When the visualisations have loaded, you can select our visual-impairment friendly modes. You can choose a colour scheme, or go for the extra experience with audio cues upon hovering.
                </div>

        {/* ~~~~  This is the bottom divider  ~~~~  */}
        <div className="line">
          {/* this will be a line */}
        </div>
        <div className="symbol"><img src={Divider} alt="Divider"></img></div>
        <div className="line2">
          {/* this will be a line */}
        </div>

        {/* ~~~~  This is the upload button which opens the popup ~~~~  */}
        <div className="uploadbutton">
          <button id='openPopup' onClick={() => popupShow()}>Upload your data here!</button>
        </div>
        {/* ~~~~  Banner ~~~~  */}
        {!dataSet ?
          <div className="banner" id='banner'>
            <img src={Banner} alt="Banner"></img>
          </div> : ""
        }
      </div>
      {/* Visualization */}
      {dataSet ? <>
        <div className="visContainer">
          {/* AdjacencyMatrix */}
          <div className="AMContainer">
            <h1 className='Visheader'> AdjacencyMatrix </h1>
            <AdjacencyMatrix 
              width={650}
              height={650}
              headerWidth={50}
              ordering={dataSet.orderings.incremental}
              edges={dataSet.edgeInfo}
              nodes={dataSet.nodes}
              nodeNameDisplay={dataSet.attrInfo.nodeNameDisplay}
              edgeAttr={edgeAttrDisplayed}
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
              height={650}
              ordering={dataSet.orderings.incremental}
              edges={dataSet.edgeInfo}
              nodes={dataSet.nodes}
              nodeNameDisplay={dataSet.attrInfo.nodeNameDisplay}
              edgeAttr={edgeAttrDisplayed}
              setHoveredEdge={setHoveredEdge}
              setSelectedEdge={setSelectedEdge}
              colorPositiveScale={colorScalePositive}
              colorNegativeScale={colorScaleNegative}
              colorNeutral={colorNeutral}
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
        </div> </>: ""}
    </>
  );
}
export default Vis2;

{/*  <h1 className='Visheader'> Threadarcs </h1>
                <div className='ThreadArc' id='ThreadarcContainter'>
                    <ThreadArcs />
                </div> */}