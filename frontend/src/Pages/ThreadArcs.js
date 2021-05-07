import React from 'react';
import "../Css/Homepage.css";
//import $, { data } from 'jquery'
//import DataFrame from 'dataframe-js';
//import './enron-v1Shortened.csv';
import Raphael from 'raphael';

class ThreadArcs extends React.Component {
    componentDidMount() {
        //function raphaelRender() {
            let testSet = [[5, 77], [112, 77], [96, 112], [72, 96], [77, 72], [5, 96]]
            let circles = [];
            let numbers = [];
            let curves = [];    
            for(let i = 0; i< testSet.length; i++) {
                for(let j = 0; j < testSet[i].length; j++) {
                    if(numbers.includes(testSet[i][j]) === false) {
                        numbers.push(testSet[i][j]);
                    }
                }
            }
            let canvas = Raphael(document.getElementById('test'), (numbers.length+1)*100, (numbers.length+1)*100);
            numbers.sort(function(a, b){return a - b});
            for(let j = 0; j < numbers.length; j++) {
                    circles.push(canvas.circle(j*100+50, numbers.length*50, 10))
                    circles[j].attr("fill", "#fff");
                    circles[j].attr("stroke-width", "3");
                    circles[j].click(() => {
                        alert(numbers[j])
                    })
                    circles[j].hover(() => {
                        circles[j].attr({"fill" :' #f00'});
                        circles[j].animate({"r": 20}, 100);
                        //curves[j].animate({'stroke-width': 6}, 100);
                    }, () => {
                        circles[j].attr('fill', "#fff");
                        circles[j].animate({"r": 10}, 100);
                        //curves[j].animate({'stroke-width': 3}, 100);
                    });
            }
            for(let i = 0; i < testSet.length; i++) {
                let lowest = testSet[i][0];
                let highest;
                if(testSet[i][1] < lowest) {
                    highest = lowest;
                    lowest = testSet[i][1];
                } else {
                    highest = testSet[i][1];
                }
                let circ1 = circles[numbers.indexOf(lowest)];
                let circ2 = circles[numbers.indexOf(highest)]
                let distance =  (circ2.attr('cx') - circ1.attr('cx')) 
                var curve1 = canvas.path("M "+ circ1.attr('cx') +"," + (circ1.attr('cy')+10) + " A"+ distance/2 +"," + distance/2 + " 0 0,1 " + circ2.attr('cx') 
                +"," + (circ2.attr('cy')-10)).attr({"stroke-width": 3, "stroke": "#259",});
                curve1.toBack();
                curves.push(curve1)
            }        
    }
 
    render () {
        return (
            <div> 
                <h1> Threadarcs </h1>
                <div id = "test"></div>  
            </div>
            );
        
    }
}

export default ThreadArcs;