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
        const MAXWIDTH = 600;
        const MAXHEIGHT = 600;
        const MATRIXHEADERWIDTH = 50;

        // Test Set
        let nodeOrdering = [7,2,6,1,0,4,5,8,9,3];
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

        let canvas = Raphael(document.getElementById('block0'), MAXWIDTH+MATRIXHEADERWIDTH, MAXHEIGHT+MATRIXHEADERWIDTH);
        let cellWidth = MAXWIDTH / (nodeOrdering.length);
        let cellHeight = MAXHEIGHT / (nodeOrdering.length);


       // 2 for loops looping through all cells in the adjacency matrix
       for(let i = 0; i < nodeOrdering.length; i++) {
        for(let j = 0; j < nodeOrdering.length; j++) {
            let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();
            squares.push(canvas.rect(MATRIXHEADERWIDTH+(j * cellWidth), MATRIXHEADERWIDTH+(i * cellHeight), cellWidth, cellHeight));
            squares[i * nodeOrdering.length+j].attr({"fill" : colorCoding1(edgeHash[id]), "stroke" : "white"});
        }
    }

        let rowHighlight = canvas.rect(0,0, MAXWIDTH, cellHeight);
        let columnHighlight = canvas.rect(0,0, cellWidth, MAXHEIGHT);
        rowHighlight.attr({"stroke-width" : 3})
        columnHighlight.attr({"stroke-width" : 3})
        rowHighlight.hide();
        columnHighlight.hide();
        let matrix = canvas.rect(0,0, MAXWIDTH, MAXHEIGHT);
        matrix.hide();
        matrix.hover(
                () => {
                rowHighlight.show();
        columnHighlight.show();
        matrix.hide();
        matrix.show();
            },
        () => {
            rowHighlight.hide();
            columnHighlight.hide();
        }
        );

        // 2 for loops looping through all cells in the adjacency matrix
        for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();


                squares[i * nodeOrdering.length+j].hover(
                        () => {
                        rowHighlight.attr({"x" : 0, "y" : (i * cellHeight)})
                columnHighlight.attr({"x" : (j * cellWidth), "y" : 0})
                this.setState({ hoveredCell : [nodeHash[nodeOrdering[i]]['email'], nodeHash[nodeOrdering[j]]['email'], edgeHash[id]]})
                    },
                () => {
                    this.setState({ hoveredCell : ['', '', '']})
                }
                );
            }
        }

        console.log(squares)
        // TODO
        // Adding Matrix header

    }



    render () {

        return (
                <div>
                <div class = "block_container">
                    <h1>Adjacency Matrix</h1>

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
                        <TransformComponent>
                        <div id = "block00">
                        <div id = "block0"> </div>
                        </div>
                        </TransformComponent>


                    </TransformWrapper>
                      

                    <div id = "block1">
                        <div id = "b1col0">
                        <div class = "infobox">  
                        <p class = "text_infobox">
                        From: {this.state.hoveredCell[0]} <br />
                        To: {this.state.hoveredCell[1]}   <br />
                        Average sentiment: {this.state.hoveredCell[2]} <br /> </p> </div>
                        </div>
                        <div id = "b1col1">
                            <div class = "dropdown">

                            </div>

                        </div>


                    </div>

                </div>
            </div>
        );
    }
}


export default AdjacencyMatrix;

