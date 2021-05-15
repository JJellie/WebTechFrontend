import React from 'react';
import "../Css/visual.css"
import Raphael from 'raphael';
import "../Css/vis2.css";

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// to be called from main function: colorCoding based on sentiment/emails amount
function colorCoding(i) {
    /* if button = sentiment (i ranges from -1 to 1)
     colorCodingSentiment(i)
     else (i ranges from .. to ..)
     colorCodingEmails(i) 
     */
    return colorCodingEmails(i);
}

function colorCodingSentiment(i){ //returns hex code

}

function colorCodingEmails(i){ //returns hex code
    return rgbToHex(255 - Math.floor(i * 223),255-Math.floor(i * 91),255-Math.floor(i * 12))
}


class AdjacencyMatrix extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoveredCell : ['None','None']
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
                squares[i * nodeOrdering.length+j].attr("fill", colorCoding(edgeHash[id]));
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
                        this.setState({ hoveredCell : [nodeHash[nodeOrdering[i]]['email'], nodeHash[nodeOrdering[j]]['email']]})
                    },
                    () => {
                        this.setState({ hoveredCell : ['None', 'None']})
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

                    <div id="block0"></div>

                    <div id = "block1">
                        <div id = "b1col0">
                        <p class = "infobox">  From: {this.state.hoveredCell[0]}  </p>
                        <p class = "infobox">  To: {this.state.hoveredCell[1]}    </p>
                        <p class = "infobox">  Amount of emails:                  </p>
                        <p class = "infobox">  Average sentiment:                 </p>
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

