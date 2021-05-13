import React from 'react';
import "../Css/visual.css"
import Raphael from 'raphael';

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

        // Test Set
        let nodeOrdering = [7,2,6,1,0,4,5,8,9,3];
        let edges = {
            "1-0" : 1,
            "9-0" : 1
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
        // last row of nodeHash is for the default message of the information textbox
        
        let squares = [];

        let canvas = Raphael(document.getElementById('test0'), MAXWIDTH, MAXHEIGHT);
        let cellWidth = MAXWIDTH / (nodeOrdering.length + 1);
        let cellHeight = MAXHEIGHT / (nodeOrdering.length + 1);

        function rowColumnHover(i, j, width, color) {
            for(let k = 0; k < nodeOrdering.length; k++) {
                squares[k * nodeOrdering.length+j].attr({ "stroke-width": width, "stroke": color });
                squares[i * nodeOrdering.length+k].attr({ "stroke-width": width, "stroke": color });
            }
        }

        // 2 for loops looping through all cells in the adjacency matrix
        for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();
                console.log(id);
                squares.push(canvas.rect(cellWidth + (j * cellWidth), cellHeight + (i * cellHeight), cellWidth, cellHeight));
                squares[i * nodeOrdering.length+j].attr("fill", colorCoding(edgeHash[id]));
                
            }
        }

        // 2 for loops looping through all cells in the adjacency matrix
        for(let i = 0; i < nodeOrdering.length; i++) {
            for(let j = 0; j < nodeOrdering.length; j++) {
                let id = nodeOrdering[i].toString() + "-" + nodeOrdering[j].toString();
                squares[i * nodeOrdering.length+j].hover(
                    () => {
                        for(let k = 0; k < nodeOrdering.length; k++) {
                            squares[k * nodeOrdering.length+j].attr({ "stroke-width": 3, "stroke": "black" });
                            squares[i * nodeOrdering.length+k].attr({ "stroke-width": 3, "stroke": "black" }); 
                        }
                        this.setState({ hoveredCell : [nodeHash[nodeOrdering[i]]['email'], nodeHash[nodeOrdering[j]]['email']]})
                    },
                    () => {
                        for(let k = 0; k < nodeOrdering.length; k++) {
                            squares[k * nodeOrdering.length+j].attr({ "stroke-width": 1, "stroke": "black" });
                            squares[i * nodeOrdering.length+k].attr({ "stroke-width": 1, "stroke": "black" });
                        }
                        this.setState({ hoveredCell : ['None', 'None']})
                    }
                );
            }
        }

        // TODO
        // Adding Matrix header

    }

    render () {

        return (
            <div>
                <h1>Adjacency Matrix</h1> 
                <div id="test0"></div>
                <div>{this.state.hoveredCell[0]} to {this.state.hoveredCell[1]}</div>
            </div>
        );
    }
}


export default AdjacencyMatrix;

