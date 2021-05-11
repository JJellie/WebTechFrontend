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

class AdjacencyMatrix extends React.Component {
    componentDidMount() {
        let testSet = [[1,0,0,0,0,0,1,0,1,1],
        [1,0,1,0,1,0,1,0,1,0],
        [0,1,0,0,0,0,1,1,1,1],
        [1,0,0,1,0,0,0,0,1,0],
        [1,1,0,0,0.5,0,1,0,1,1],
        [1,0,0,0,0,0,1,0,1,1],
        [0,1,1,0,1,0,0,1,1,1],
        [1,0,1,0,0,0,1,0,1,0],
        [1,0,0,1,0,0,0,0,1,1],
        [0,1,1,0,0,0,1,1,1,1]];
        let squares = [];

        let canvas = Raphael(document.getElementById('test'), testSet.length[0]*30, testSet.length*30);
        for(let i = 0; i < testSet.length; i++) {
            for(let j = 0; j < testSet[i].length; j++) {
                squares.push(canvas.rect(j*30,i*30,30,30))
                squares[i*testSet[i].length+j].attr("fill", rgbToHex(Math.floor(testSet[i][j] * 255),Math.floor(testSet[i][j] * 255),Math.floor(testSet[i][j] * 255)))
            }
        }
    }

    render () {

        return (
            <div>
                <h1>Adjacency Matrix</h1> 
                <div id="test"></div> 
            </div>
        );
    }
}


export default AdjacencyMatrix;

