import '../Css/visual.css';
import React, {useState, useMemo, useEffect, useCallback} from 'react';
import * as d3 from "d3";
import Banner from "../Images/banner vis.png";
import Divider from "../Images/divider.png";
import { Link } from "react-router-dom";
import { popupShow, DatasetPopup } from "./backend.js";
import Vis from "./vis.js";

function VisPage({update}) {
  const [dataSet, setDataSet] = useState(null);
  useEffect(() => {
    update();
  }, [])

  return (
    <>
      <DatasetPopup setDataSet={setDataSet} colorScheme={["#FFBA49", "#57A773", "#F06C9B", "#5B2A86", "#FB3640", "#CE98F5"]} />
      <div>
        {/* ~~~~  This is the main title ~~~~  */}
        {!dataSet ?<div className="visHeader">
          <h1>Visualisation</h1>
        </div> :
        <div className="visHeader" style={{marginBottom: "2.5%"}}>
          <h1>Visualisation</h1>
        </div> }
        {!dataSet ? 
          <>
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
          </>: ""}
        
        {/* ~~~~  This is the upload button which opens the popup ~~~~  */}
        {!dataSet ? <div className="uploadbutton">
          <button id='openPopup' onClick={() => popupShow()}>Upload your data here!</button>
        </div> :""}

        {/* ~~~~  Banner ~~~~  */}
        {!dataSet ?
          <div className="banner" id='banner'>
            <img src={Banner} alt="Banner"></img>
          </div> : ""
        }
      </div>
      {dataSet ? <Vis dataSet={dataSet} /> : ""}
    </>
  )
}

export default VisPage;