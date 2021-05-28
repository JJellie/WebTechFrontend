import React from 'react';
import "../Css/visual.css"
import Raphael from 'raphael';
import "../Css/vis2.css";
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
    }


    componentDidMount() {
        //raphaelRender();
        document.getElementById('loading').style.display = 'none';
        this.raphaelRender();
        this.setState({rendered: true});
    }


    raphaelRender() {
        const MAXWIDTH = 600;
        const MAXHEIGHT = 600;
        const MATRIXHEADERWIDTH = 100;

        // Test Set
        let nodeOrdering = [7,2,6,1,0,4,5,8,9,3,7,2,6,1,0,4,5,8,9,3,7,2,6,1,0,4,5,8,9,3];

        let edges = {
                "1-0" : 1,
                "9-0" : 1,
                "4-3" : 1
        };

        let edgeHash = {};

        for(let i = 0; i < 10; i++) {
            for(let j = 0; j < 10; j++) {
                let id = i.toString() + '-' + j.toString();
                if(edges[id]) {
                    edgeHash[id] = edges[id];
                } else {
                    edgeHash[id] = 0;
                }
            }
        }

        console.log(edgeHash);

        let nodeHash = [
        {"email" : "matthew.lenhart@enron.com", "jobtitle" : "Employee",        "firstname" : 'Matthew',    "lastname" : 'Lenhart'},
        {"email" : "eric.bass@enron.com",       "jobtitle" : 'Trader',          "firstname" : 'Eric',       "lastname" : 'Bass'},
        {"email" : "danny.mccarty@enron.com",   "jobtitle" : 'Vice President',  "firstname" : 'Danny',      "lastname" : 'Mccarty'},
        {"email" : "susan.scott@enron.com",     "jobtitle" : 'Unknown',         "firstname" : 'Susan',      "lastname" : 'Scott'},
        {"email" : "andy.zipper@enron.com",     "jobtitle" : 'Employee',        "firstname" : 'Andy',       "lastname" : 'Zipper'},
        {"email" : "kimberly.watson@enron.com", "jobtitle" : 'Employee',        "firstname" : 'Kimberly',   "lastname" : 'Watson'},
        {"email" : "drew.fossum@enron.com",     "jobtitle" : 'Manager',         "firstname" : 'Drew',       "lastname" : 'Fossum'},
        {"email" : "errol.mclaughlin@enron.com","jobtitle" : 'CEO',             "firstname" : 'Errol',      "lastname" : 'Mclauchlin'},
        {"email" : "lavorato@enron.com",        "jobtitle" : 'Employee',        "firstname" : 'Lavorato',   "lastname" : ''},
        {"email" : "jeff.dasovich@enron.com",   "jobtitle" : 'Employee',        "firstname" : 'Jeff',       "lastname" : 'Dasovich'},
        ];

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
            textsH.push(headerTopCanvas.text(((i + .5) * cellWidth), MATRIXHEADERWIDTH-5, nodeHash[nodeOrdering[i]]["firstname"]+" "+nodeHash[nodeOrdering[i]]["lastname"]));
            textsH[i].attr({
                "font-size": (9.0/16.0)*cellWidth,
                "text-anchor" : "end",
                "transform" : "r90,"+((i + .5) * cellWidth).toString()+","+(MATRIXHEADERWIDTH-5).toString()
            });

            //vertically
            textsV.push(headerLeftCanvas.text(MATRIXHEADERWIDTH-5, ((i + .5) * cellHeight), nodeHash[nodeOrdering[i]]["firstname"]+" "+nodeHash[nodeOrdering[i]]["lastname"]));
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
            </div>
        );
    }
}


export default AdjacencyMatrix;

