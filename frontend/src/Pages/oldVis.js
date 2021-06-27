import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import AdjacencyMatrix from './AdjacencyMatrix';
import Banner from "../Images/banner vis.png";
import Divider from "../Images/divider.png";
import { Link, } from "react-router-dom";

class Vis extends React.Component {
    constructor(props) {
        super(props)
        this.state = {"uploaded":false, "filename":"", "emailHover" : 1,"selectedInfo" : ['','','',null,null], "selectedFile": "none"}
        this.isDataReady = false;
        this.data = [];
        this.dataName = this.props.file;
    }
    
    
    componentDidMount() {
        this.props.update()
    }

    SendFile = async (file = null) => {
        if (file === null) {
            file = document.getElementById('UploadedFile').files[0];
            let data = new FormData();
            data.append("file", file);
            let filename = file.name;
            const response = await fetch("http://localhost:3001/upload", { method: "POST", body: data });
                if (response.status === 200) {
                    this.setState({"uploaded": true})
                    this.setState({'filename': filename})
                    this.closePopup()
                    document.getElementById("banner").style.display= "none";
                    document.getElementById("visualizations").style.display= "block";
                    document.getElementById('openPopup').textContent = 'Reupload your data'
                } 
            } else {
                this.setState({"uploaded": true})
                this.setState({'filename': file})
                this.closePopup()
                document.getElementById("banner").style.display= "none";
                document.getElementById("visualizations").style.display= "block";
                document.getElementById('openPopup').textContent = 'Reupload your data'
        }
    }


    popupShow() {
        let box = document.getElementById('popup')
        box.style.display = "block";
    }
    closePopup() {
        document.getElementById("popup").style.display = "none";
    }
    ShowSubmit() {
        try{
        let file = document.getElementById('UploadedFile').files[0].name;
        this.setState({"selectedFile":file})
        document.getElementById('SubmitBut').style.display = "block";
        } catch {
            this.setState({"selectedFile":"none"})
        }
    }
    async loadTestSet() {
        await this.SendFile("enron-v1.csv")
    }
    render() {
        return (
            <div>
            <div id='popup' className='popup'>
                <div className='popup-content'>
                    <span onClick={() => this.closePopup()} className="close">&times;</span>
                    <label htmlFor='UploadedFile' className='UploadButton'>Choose file here</label> 
                    <input type = "file" accept = ".csv"  id="UploadedFile" onChange={()=> this.ShowSubmit()}></input>
                    <span className='nameDisplay'>Chosen file's name:<span className='fileName'> {this.state.selectedFile}</span></span>
                    <label htmlFor='Submit' id='SubmitBut' className='SubmitButton'>Confirm</label> 
                    <input type = "submit" id='Submit' onClick={async () => {await this.SendFile()}} className="UploadButton"></input>
                    <label className='testSetText' id='testSet' onClick={() => this.loadTestSet()}>Or click here to use a test data set</label>
                </div>
            </div>
            <div> 
                <div className="visHeader">
                    <h1>Visualisation</h1>
                </div>

                <div className="line">
                    {/* this will be a line */}
                </div>
                <div className="symbol"> <img src={Divider} alt="Divider"></img> </div>
                <div className="line2">
                    {/* this will be a line */}
                </div>

                <div className="visText">
                     Wecome to the visualisation page. You can upload your data using the big blue button below. In the case you do not have a dataset, you can also use the standard dataset.
                        <br></br>
                        When your data is uploaded, the visualisations will be loaded in. For some extra tips, refer to our <Link to="../about">About page</Link>. <br></br>
                        When the visualisations have loaded, you can select our visual-impairment friendly modes. You can choose a colour scheme, or go for the extra experience with audio cues upon hovering.
                        
                </div>

                <div className="line">
                    {/* this will be a line */}
                </div>
                <div className="symbol"><img src={Divider} alt="Divider"></img></div>
                <div className="line2">
                    {/* this will be a line */}
                </div>

                <div className="uploadbutton">
                    <button id='openPopup' onClick={() => this.popupShow()}>Upload your data here!</button>
                </div>

                <div className="banner" id='banner'>
                    <img src={Banner} alt="Banner"></img>
                </div>


                {/* <ThreadArcs />
                <PlanetVis /> */}
            </div>
            <div className='visualizations' id="visualizations">
               
                <h1 className='Visheader'> Threadarcs </h1>
                <div className='ThreadArc' id='ThreadarcContainter'>
                    <ThreadArcs file={this.state.filename} uploadStatus={this.state.uploaded} updateVisState={(p) => {this.setState(p)}} getVisState={this.state.selectedInfo}/>
                </div>
               
               <div className="Am_block">
               <h1 className='Visheader'> AdjacencyMatrix </h1>
                    <AdjacencyMatrix file={this.state.filename} uploadStatus={this.state.uploaded} updateVisState={(p) => {this.setState(p)}} getVisState={this.state.selectedInfo}/>
               <div id = "block1">
                   <div id = "b1col0">
                       <div className = "infobox">  
                           <p className = "text_infobox">
                               From: {this.state.selectedInfo[0]} <br />
                               To: {this.state.selectedInfo[1]}   <br />
                               Average sentiment: {this.state.selectedInfo[2]} <br /> 
                           </p> 
                       </div>
                       </div>
                   </div>
                   <div id = "b1col1">
                       <div className = "dropdown">
                       </div>
                   </div>
               </div>
           </div>
        </div>
        );
    }
}

export default Vis;