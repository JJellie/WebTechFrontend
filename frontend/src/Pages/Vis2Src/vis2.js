import ThreadArcs from '../ThreadArcs';
import '../../Css/visual.css';
import React, {useState, useMemo, useEffect} from 'react';
import AdjacencyMatrix from '../AdjacencyMatrix';
import Banner from "../../Images/banner vis.png";
import Divider from "../../Images/divider.png";
import { Link } from "react-router-dom";
import { popupShow, DatasetPopup } from "./backend.js";



function Vis2() {
    const [dataSet, setDataSet] = useState(null);

    return(
        <>  
            <DatasetPopup setDataSet={setDataSet}/>
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

                <div className="banner" id='banner'>
                    <img src={Banner} alt="Banner"></img>
                </div>
            </div>
    {/*        <div className='visualizations' id="visualizations">
                
                <h1 className='Visheader'> Threadarcs </h1>
                <div className='ThreadArc' id='ThreadarcContainter'>
                    <ThreadArcs />
                </div>
                
                <div className="Am_block">
                <h1 className='Visheader'> AdjacencyMatrix </h1>
                    <AdjacencyMatrix />
                <div id = "block1">
                    <div id = "b1col0">
                        <div className = "infobox">  
                            <p className = "text_infobox">
                                From: {} <br />
                                To: {}   <br />
                                Average sentiment: {} <br /> 
                            </p> 
                        </div>
                        </div>
                    </div>
                    <div id = "b1col1">
                        <div className = "dropdown">
                        </div>
                    </div>
                </div>
            </div> */}
        </>
    );
}
export default Vis2;