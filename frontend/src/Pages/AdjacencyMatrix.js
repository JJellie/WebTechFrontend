import React from 'react';
import "../Css/visual.css"
import Raphael from 'raphael';
import "../Css/vis2.css";
import loadImg from '../Images/LoadIcon.png'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {Dropdown, DropdownOption} from './Dropdown.js';
import positive from "../Audio/positive.mp3"
import negative from "../Audio/negative.mp3"
import neutral from "../Audio/neutral.mp3"


let colorCoding = {'neutral' : [250, 248, 247], 'positiveMax' : [202,90,54], 'positiveMin' : [202,20,54], 'negativeMax' : [0,0,0], 'negativeMin' : [0,0,0]};

function colorCoding1(i) {
    if(i > 0) {
        return Raphael.hsl(
            ((colorCoding['positiveMax'][0]-colorCoding['positiveMin'][0])*i+colorCoding['positiveMin'][0]),
            ((colorCoding['positiveMax'][1]-colorCoding['positiveMin'][1])*i+colorCoding['positiveMin'][1]),
            ((colorCoding['positiveMax'][2]-colorCoding['positiveMin'][2])*i+colorCoding['positiveMin'][2])
        );
    } else if(i < 0) {
        return Raphael.hsl(
            ((colorCoding['negativeMax'][0]-colorCoding['negativeMin'][0])*-i+colorCoding['negativeMin'][0]),
            ((colorCoding['negativeMax'][1]-colorCoding['negativeMin'][1])*-i+colorCoding['negativeMin'][1]),
            ((colorCoding['negativeMax'][2]-colorCoding['negativeMin'][2])*-i+colorCoding['negativeMin'][2])
        );
    } else {
        return Raphael.hsl(colorCoding['neutral'][0],colorCoding['neutral'][1],colorCoding['neutral'][2]);
    }
}

function dynamicSort(property) { // for alphabetical sorting of array of objects by property
    return function (a,b) {
         return a[property].localeCompare(b[property]);
        }        
    }

function randomSort(data){
    for (let i = 0; i < data.length; i++) { // uses Fisher-Yates shuffle algorithm for random sorting of array 
        let x = data[i];
        let y = Math.floor(Math.random() * (i + 1));
        data[i] = data[y];
        data[y] = x;
      }
    return data;
}

class AdjacencyMatrix extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                hoveredCell : ['','', ''],
                rendered: false,
                dropdownValue: "", 
                dropdownButtonClicked: false,
                matrixCanvas: "",
                headerTopCanvas: "",
                headerLeftCanvas: ""
        };
        
        this.isDataReady = false;
        this.data = [];
        this.dataName = this.props.file;
        this.handleDropdownSelect = this.handleDropdownSelect.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
    }

    handleDropdownSelect(e) {
        this.setState({ dropdownValue: e.target.value });
      }
    
      handleButtonClick(e){
        console.log("clicked");
        console.log(this.state.dropdownValue);
        this.draw(false);
      
      };

    componentDidMount() {
        if(this.props.uploadStatus === true) {
            this.setState({rendered: true});
        }
    }

    getDataSize() {
        if(!this.isDataReady) {
            console.log("Not ready.");
        } else {
            return this.data.length;
        }
        return 1;
    }

    setData(obj) {
        this.data = obj;
    }

    getData(ArrayIndex, dictEntry = null) {
        if(dictEntry !== null) {
            if(!this.isDataReady) {
                console.log("Not ready.");
            } else {
                return this.data[ArrayIndex][0][dictEntry];
            }
        } else {
            if(!this.isDataReady) {
                console.log("Not ready.");
            } else {
                return this.data[ArrayIndex];
            }
        }
        return "Error";
    }

    async getDataset(filename) {
        async function fetchData() {
            const response = await fetch('http://localhost:3001/test/download/am.json?file=' + filename, {method: 'GET'});
            const obj = await response.json();
            return obj;
        }
        this.setData(await fetchData());
        return;
    }

    async getParsedData(filename) {
        document.getElementById('loading').style.display = 'block';

        try {await this.getDataset(filename);
        this.isDataReady = true;} catch {console.log()}
        this.raphaelRender();
    }

    raphaelRender(){
        this.draw(true);
        console.log("MATRIISIS");
    }


    draw(initial){ // still needs the codes to sort random, alphabetically, etc. (will update once headers are correct)

        let nodeOrdering = this.data.nodeOrdering;
        let edges = this.data.edges;
        let nodeHash = this.data.nodeHash;

        const MAXWIDTH = 600;
        const MAXHEIGHT = 600;
        const MATRIXHEADERWIDTH = 100;

        console.log(nodeHash);
        if (initial === true){
            this.matrixCanvas = Raphael(document.getElementById('block0'), MAXWIDTH, MAXHEIGHT);
            this.headerTopCanvas = Raphael(document.getElementById('headertop'), MAXWIDTH, MATRIXHEADERWIDTH);
            this.headerLeftCanvas = Raphael(document.getElementById('headerleft'), MATRIXHEADERWIDTH, MAXHEIGHT);
            this.dropdownValue = "Sorted in ascending order by id (default)";
            this.drawMatrix(nodeOrdering, edges, nodeHash, MAXWIDTH, MAXHEIGHT, MATRIXHEADERWIDTH);
        }
        else{
            // first we need to clear the canvas (delete the existing drawn matrix)
            this.matrixCanvas.clear();
            this.headerTopCanvas.clear();
            this.headerLeftCanvas.clear();
            if (this.state.dropdownValue === "Shuffle randomly"){
                let nodeOrderingRand = this.sortRandomly(nodeOrdering, nodeHash);
                this.drawMatrix(nodeOrderingRand, edges, nodeHash, MAXWIDTH, MAXHEIGHT, MATRIXHEADERWIDTH);
            }
            else if (this.state.dropdownValue === "Alphabetically"){ 
                let nodeOrderingAlph= this.sortAlphabetically(nodeOrdering, nodeHash); //contains the alphabetic order of the nodes
                this.drawMatrix(nodeOrderingAlph, edges, nodeHash, MAXWIDTH, MAXHEIGHT, MATRIXHEADERWIDTH);
            }
            else if (this.state.dropdownValue === "Sorted in ascending order by id (default)"){
                this.drawMatrix(nodeOrdering, edges, nodeHash, MAXWIDTH, MAXHEIGHT, MATRIXHEADERWIDTH);
            }
        } 
    }

    sortAlphabetically(nodeOrdering, nodeHash){ // in JS objects are always passed around by reference, assigning new var changes initial
        let nodeOrderingAlph = [];
        let nodeHashAlph = Object.assign([], nodeHash);
    
        nodeHashAlph = nodeHashAlph.slice(1);
        console.log(nodeHashAlph);
        nodeHashAlph.sort(dynamicSort("lastName"));
        nodeHashAlph.sort(dynamicSort("firstName"));
    
        for (let i = 0; i < nodeOrdering.length; i++){
          nodeOrderingAlph.push(nodeHashAlph[i]['id']);
        }
        return nodeOrderingAlph;
    }

    sortRandomly(nodeOrdering, nodeHash){
        let nodeOrderingRand = [];
        let nodeHashRand = Object.assign([], nodeHash);
        nodeHashRand = nodeHashRand.slice(1);

        nodeHashRand = randomSort(nodeHashRand);
    
        for (let i = 0; i < nodeOrdering.length; i++){
          nodeOrderingRand.push(nodeHashRand[i]['id']);
        }
        return nodeOrderingRand;
    }



    drawMatrix(nodeOrdering, edges, nodeHash, MAXWIDTH, MAXHEIGHT, MATRIXHEADERWIDTH) {

        let positiveAudio = new Audio(positive);
        let negativeAudio = new Audio(negative);
        let neutralAudio = new Audio(neutral);

        if(!this.data) return console.log("No data to render");

        console.log(nodeOrdering)

        let edgeHash = {};

        for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = i.toString() + '-' + j.toString();
                if(edges[id]) {
                    edgeHash[id] = edges[id];
                } else {
                    edgeHash[id] = 0;
                }
            }
        }

        let squares = [];
        let textsV = [];
        let textsH = [];

        let cellWidth = MAXWIDTH / (nodeOrdering.length);
        let cellHeight = MAXHEIGHT / (nodeOrdering.length);

        
        // adding the headers:
        for (let i = 0; i < nodeOrdering.length; i++){

            //horizontally
            textsH.push(this.headerTopCanvas.text(((i + .5) * cellWidth), MATRIXHEADERWIDTH-5, nodeHash[nodeOrdering[i]]["firstName"]+" "+nodeHash[nodeOrdering[i]]["lastName"]));
            textsH[i].attr({
                "font-size": (9.0/16.0)*cellWidth,
                "text-anchor" : "end",
                "transform" : "r90,"+((i + .5) * cellWidth).toString()+","+(MATRIXHEADERWIDTH-5).toString()
            });

            //vertically
            textsV.push(this.headerLeftCanvas.text(MATRIXHEADERWIDTH-5, ((i + .5) * cellHeight), nodeHash[nodeOrdering[i]]["firstName"]+" "+nodeHash[nodeOrdering[i]]["lastName"]));
            textsV[i].attr({ 
                "font-size": (9.0/16.0)*cellHeight,
                "text-anchor" : "end",
            });

        }
        

       // 2 for loops looping through all cells in the adjacency matrix
       for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();
                squares.push(this.matrixCanvas.rect((j * cellWidth), (i * cellHeight), cellWidth, cellHeight));
              //  squares[i * nodeOrdering.length+j].attr({"fill" : colorCoding1(edgeHash[id]), "stroke" : "white"});
              // i think there are some issues with the colorCoding function
              if (edgeHash[id] > 0){
                  squares[i * nodeOrdering.length+j].attr({"fill" : "#20A4F3", "stroke" : "white"});
              }
              else if (edgeHash[id] < 0){
                squares[i * nodeOrdering.length+j].attr({"fill" : "black", "stroke" : "white"});
              }
              else{
                squares[i * nodeOrdering.length+j].attr({"fill" : "#F2F0F4", "stroke" : "white"});
              }
            }

        }

        // 2 for loops looping through all cells in the adjacency matrix
        for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();
                squares[i * nodeOrdering.length+j].hover(
                    () => {
                        console.log(nodeHash[nodeOrdering[i]]['email']);
                        this.props.updateVisState({ selectedInfo : [nodeHash[nodeOrdering[i]]['email'], nodeHash[nodeOrdering[j]]['email'], edgeHash[id], i+1, j+1]})
                    },
                    () => {
                        //this.props.updateVisState({ selectedInfo : ['', '', '', null, null]})
                    }
                );
                squares[i * nodeOrdering.length + j].click(
                    () => {
                        console.log(edgeHash[id]);
                        if (edgeHash[id] > 0){
                            positiveAudio.play();
                        }
                        else if (edgeHash[id] === 0){
                            neutralAudio.play();
                        }
                        else if (edgeHash[id] < 0){
                            negativeAudio.play();
                        }
                    }
                );
            }
        }
    }



    render () {
        if(this.props.uploadStatus === true) {
            if(this.state.rendered === false) {
                if(this.props.file !== "") {
                    this.getParsedData(this.props.file);
                    this.setState({rendered: true});
                }
            }
            
        }
        return (
                <div>
                <div className = "block_container">
                    <div className='vis'>
                    <div className='matrix'>
                            <TransformWrapper
                                options = {{
                                    transformEnabled : true,
                                    limitToWrapper: true,
                                    limitToBounds: false
                                    }}

                                pan = {{
                                    velocityEqualToMove: true,
                                    velocity: true,
                                    paddingSize: 0,
                                    animationTime: 20
                                }}

                                zoomIn = {{
                                    animationTime: 20
                                }}

                                zoomOut ={{
                                    animationTime: 20
                                }}
                    
                                wheel = {{
                                    wheelEnabled: true,
                                    touchPadEnabled: true,
                                    limitsOnWheel: true,
                                    step: 8
                                }}
                            >
                                {({scale, positionX, positionY}) => (
                                    <React.Fragment>
                                        <div className='header_top'>
                                            <TransformWrapper
                                                scale = {scale}
                                                positionX = {positionX}
                                                positionY = {100-100*scale}
                                                options = {{
                                                    transformEnabled : true,
                                                    limitToWrapper: true,
                                                    limitToBounds: false
                                                    }}

                                                pan = {{
                                                   disabled: true
                                                }}

                                                zoomIn = {{
                                                    animationTime: 20
                                                }}

                                                zoomOut ={{
                                                    animationTime: 20
                                                }}
                                    
                                                wheel = {{
                                                    wheelEnabled: false,
                                                    touchPadEnabled: false,
                                                    limitsOnWheel: false,
                                                    step: 8
                                                }}
                                            >
                                                <TransformComponent>
                                                        <div id="headertop"> </div>
                                                </TransformComponent>
                                            </TransformWrapper>
                                        </div>
                                        <div className='header_left'>
                                            <TransformWrapper
                                                scale = {scale}
                                                positionX = {100-100*scale}
                                                positionY = {positionY}
                                                options = {{
                                                    transformEnabled : true,
                                                    limitToWrapper: true,
                                                    limitToBounds: false
                                                    }}

                                                pan = {{
                                                    disabled: true
                                                }}

                                                zoomIn = {{
                                                    animationTime: 20
                                                }}

                                                zoomOut ={{
                                                    animationTime: 20
                                                }}
                                    
                                                wheel = {{
                                                    wheelEnabled: false,
                                                    touchPadEnabled: false,
                                                    limitsOnWheel: false,
                                                    step: 8
                                                }}
                                            >
                                                <TransformComponent>
                                                        <div id="headerleft"> </div>
                                                </TransformComponent>
                                            </TransformWrapper>
                                        </div> 
                                        <TransformComponent>
                                                <div id="block0"> </div>
                                        </TransformComponent>
                                    </React.Fragment>
                                )}
                            </TransformWrapper>
                        </div>
                        
                    </div>

                    <div id = "block1">
                        <div id = "b1col1">
                            <div className = "dropdown">
                            <Dropdown
                            formLabel = "You can reorder the nodes:"
                            buttonText = "submit"
                            onChange = {this.handleDropdownSelect}
                            action = "/">

                                <DropdownOption selected value = "Sorted in ascending order by id (default)" />
                                <DropdownOption value = "Shuffle randomly" />
                                <DropdownOption value = "Alphabetically" />

                            </Dropdown>
                            <p> You have selected {this.state.dropdownValue}. </p>

                           <button onClick = {this.handleButtonClick} id = "dropdownButton"> Reorder. </button> 

                            </div>
                        </div>
                    </div>
                </div>
                <img id= "loading" className="loading" src = {loadImg} alt='Loading'></img> 
            </div>
        );
    }
}


export default AdjacencyMatrix;

