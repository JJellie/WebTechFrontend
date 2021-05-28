import React from 'react';
import "../Css/visual.css"
import Raphael from 'raphael';
import "../Css/vis2.css";
import loadImg from '../Images/LoadIcon.png'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";


let colorCoding = {'neutral' : [0,2,63], 'positiveMax' : [202,90,54], 'positiveMin' : [202,20,54], 'negativeMax' : [0,0,0], 'negativeMin' : [0,0,0]};

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


class AdjacencyMatrix extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
                hoveredCell : ['','', '']
        };

        this.isDataReady = false;
        this.data = [];
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

        //raphaelRender();
        document.getElementById('loading').style.display = 'none';
        this.raphaelRender();
        this.setState({rendered: true});
    }

    SendFile = async () => {
        let file = document.getElementById('UploadedFile').files[0];
        console.log(file)
        
        let data = new FormData();
        data.append("file", file);
        let filename = file.name;
        const response = await fetch("http://localhost:3001/upload", { method: "POST", body: data });

        if (response.status === 200) {
            console.log("filename", filename);
            this.getParsedData(filename);
        }
    }


    raphaelRender() {
        const MAXWIDTH = 600;
        const MAXHEIGHT = 600;
        const MATRIXHEADERWIDTH = 100;

        if(!this.data) return console.log("No data to render");

        // Test Set
        let nodeOrdering = this.data.nodeOrdering;
        let edges = this.data.edges;

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

        console.log(edgeHash);

        let nodeHash = this.data.nodeHash;

        let squares = [];
        let textsV = [];
        let textsH = [];

        let matrixCanvas = Raphael(document.getElementById('block0'), MAXWIDTH, MAXHEIGHT);
        let headerTopCanvas = Raphael(document.getElementById('headertop'), MAXWIDTH, MATRIXHEADERWIDTH);
        let headerLeftCanvas = Raphael(document.getElementById('headerleft'), MATRIXHEADERWIDTH, MAXHEIGHT);
        let cellWidth = MAXWIDTH / (nodeOrdering.length);
        let cellHeight = MAXHEIGHT / (nodeOrdering.length);

        

        // adding the headers:
        for (let i = 0; i < nodeOrdering.length; i++){

            // i picked the value 40 because 0 didn't work, it can be changed

            //horizontally
            textsH.push(headerTopCanvas.text(((i + .5) * cellWidth), MATRIXHEADERWIDTH-5, nodeHash[nodeOrdering[i]]["firstName"]+" "+nodeHash[nodeOrdering[i]]["lastName"]));
            textsH[i].attr({
                "font-size": (9.0/16.0)*cellWidth,
                "text-anchor" : "end",
                "transform" : "r90,"+((i + .5) * cellWidth).toString()+","+(MATRIXHEADERWIDTH-5).toString()
            });

            //vertically
            textsV.push(headerLeftCanvas.text(MATRIXHEADERWIDTH-5, ((i + .5) * cellHeight), nodeHash[nodeOrdering[i]]["firstName"]+" "+nodeHash[nodeOrdering[i]]["lastName"]));
            textsV[i].attr({ 
                "font-size": (9.0/16.0)*cellHeight,
                "text-anchor" : "end",
            });

        }
        

       // 2 for loops looping through all cells in the adjacency matrix
       for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();
                squares.push(matrixCanvas.rect((j * cellWidth), (i * cellHeight), cellWidth, cellHeight));
                squares[i * nodeOrdering.length+j].attr({"fill" : colorCoding1(edgeHash[id]), "stroke" : "white"});
            }

        }

        // 2 for loops looping through all cells in the adjacency matrix
        for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();


                squares[i * nodeOrdering.length+j].hover(
                    () => {
                        this.setState({ hoveredCell : [nodeHash[nodeOrdering[i]]['email'], nodeHash[nodeOrdering[j]]['email'], edgeHash[id]]})
                    },
                    () => {
                        this.setState({ hoveredCell : ['', '', '']})
                    }
                );
            }
        }
    }



    render () {

        return (
                <div>
                    <label for='UploadedFile' className='UploadButton'>Upload file here</label> 
                    <input type = "file" accept = ".csv"  id="UploadedFile"></input>
                    <input type = "submit" onClick={this.SendFile} className="UploadButton"></input>

                <div class = "block_container">
                    
                    <h1>Adjacency Matrix</h1>
                    <div class='vis'>
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
                        <div id = "b1col0">
                            <div className = "infobox">  
                                <p className = "text_infobox">
                                    From: {this.state.hoveredCell[0]} <br />
                                    To: {this.state.hoveredCell[1]}   <br />
                                    Average sentiment: {this.state.hoveredCell[2]} <br /> 
                                </p> 
                            </div>
                        </div>
                        <div id = "b1col1">
                            <div className = "dropdown">

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

