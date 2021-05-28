import React from 'react';
import "../Css/visual.css";
//import $, { data } from 'jquery'
//import DataFrame from 'dataframe-js';
//import './enron-v1Shortened.csv';
import Raphael from 'raphael';
import loadImg from '../Images/LoadIcon.png'
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

class ThreadArcs extends React.Component {
    constructor(props) {
        super(props);
        this.data = [];
        this.isDataReady = false;
        this.state = {"data": [], "testdata": '', "loading": "", "rendered": false};
    }
    getDataSize() {
        if(!this.isDataReady) {
            console.log("Not ready")
        } else {
            return this.data.length;
        }
        return 1
    }
    setData(obj) {
        this.data = obj;
    }
    getData(ArrayIndex, dictEntry = null) {
        
        if(dictEntry !== null) {
            if(!this.isDataReady) {
                console.log('Not ready')
            } else {
                return this.data[ArrayIndex][0][dictEntry]
            }
        } else {
            if(!this.isDataReady) {
                console.log("Not ready")
            } else {
                return this.data[ArrayIndex]
            }
        }
        return "Error";
    }
  
    async getDataset(filename) {
        async function fetchData() {
            const response = await fetch('http://localhost:3001/test/download/csv.json?file=' + filename, {method: 'GET'});
            const obj = await response.json();
            return obj;
        }
        this.setData(await fetchData());
        return;
    }
    
    async getParsedData(filename) {
        document.getElementById('loading').style.display = 'block';

        try {await this.getDataset(filename);
        this.isDataReady = true;} catch {}

        //raphaelRender();
        document.getElementById('loading').style.display = 'none';
        this.raphaelRender();
        this.setState({rendered: true});
    }


    

    raphaelRender() {
        let circles = [];
        let numbers = [];
        let lookup = [];
        let curves = [];
        let circleRadius = 10;
        let datasize = this.getDataSize()    
        let curveWidth = 2;
        //for(let i = 0; i< testSet.length; i++) {
        //    for(let j = 0; j < testSet[i].length; j++) {
        //        if(numbers.includes(testSet[i][j]) === false) {
        //            numbers.push(testSet[i][j]);
        //        }
        //    }
        // }
        
        //Importing data into the correct arrays for processing.
        for(let i = 0; i < datasize; i++) {
            if(numbers.includes(this.getData(i, 'toId')) === false) {
                numbers.push(this.getData(i, 'toId'));
                lookup[this.getData(i, 'toId')] = this.getData(i,'toEmail');
            }
            if(numbers.includes(this.getData(i, 'fromId')) === false){
                numbers.push(this.getData(i, 'fromId'));
                lookup[this.getData(i, 'fromId')] = this.getData(i,'fromEmail');
            }
        }


        let canvas = Raphael(document.getElementById('test'), (numbers.length+1)*100, 1200);
        //numbers.sort(function(a, b){return a - b});
        for(let j = 0; j < numbers.length- 1; j++) {
            let circle = canvas.circle(j*3*circleRadius+50, 600, circleRadius)
            circle.data({"id": numbers[j]})
            circles.push(circle)
            circles[j].attr("fill", "#fff");
            circles[j].attr("stroke-width", "3");
            circles[j].click(() => {
                alert(lookup[circles[j].data("id")])
            })
            circles[j].hover(() => {
                circles[j].attr({"fill" :' #f00'});
                circles[j].animate({"r": 2*circleRadius}, 100);
                for(let i = 0; i < curves.length; i++) {
                    if (curves[i].data("from") === numbers[j]) {
                    curves[i].animate({'stroke-width': curveWidth*2}, 100);
                    curves[i].attr({"stroke": '#000'})
                    curves[i].toFront();
                    circles[numbers.indexOf(curves[i].data("to"))].animate({"r":1.5*circleRadius}, 100)
                    circles[numbers.indexOf(curves[i].data("to"))].toFront();
                    }
                    circles[j].toFront();
                }
                
            }, () => {
                circles[j].attr('fill', "#fff");
                circles[j].animate({"r": circleRadius}, 100);
                for(let i = 0; i < curves.length; i++) {
                    if (curves[i].data("from") === numbers[j]) {
                    curves[i].animate({'stroke-width': curveWidth}, 100);
                    curves[i].attr({"stroke": '#20A4F3'})
                    curves[i].toBack()
                    circles[numbers.indexOf(curves[i].data("to"))].animate({"r":circleRadius}, 100)
                    }
                }
            });
        }

        for(let i = 0; i < datasize-1; i++) {
            let lowest = parseInt(this.getData(i, 'fromId'));
            let highest;
            if(parseInt(this.getData(i, 'toId')) < lowest) {
                highest = lowest;
                parseInt(this.getData(i, 'toId'));
            } else {
                highest = parseInt(this.getData(i, 'toId'));
            }
            let circ1 = circles[numbers.indexOf(String(lowest))];
            let circ2 = circles[numbers.indexOf(String(highest))]
            let distance =  (circ2.attr('cx') - circ1.attr('cx')) 
            var curve = canvas.path("M "+ circ1.attr('cx') +"," + (circ1.attr('cy')-10) + " A"+ Math.abs(distance/2) +"," + (Math.abs(distance/2) > 290 ? 600*(1-(Math.abs(distance/2) / (circles.length*100) )) : Math.abs(distance/2)) + " 0 0,1 " + circ2.attr('cx') 
            +"," + (circ2.attr('cy')-10)).attr({"stroke-width": curveWidth, "stroke": "#20A4F3",});
            curve.data({"from": String(lowest), "to": String(highest)})
            curve.toBack();
            curves.push(curve)


            curves[i].hover(() => {
                curves[i].attr({'stroke':"#000", "stroke-width": curveWidth*3})
                circles[numbers.indexOf(curves[i].data("from"))].attr({"fill" :' #f00'});
                circles[numbers.indexOf(curves[i].data("from"))].animate({"r": 2*circleRadius}, 100);
                for(let q = 0; q < curves.length; q++) {
                    if (curves[q].data("from") === numbers[i]) {
                    curves[q].animate({'stroke-width': curveWidth*3}, 100);
                    circles[numbers.indexOf(curves[q].data("to"))].animate({"r":1.5*circleRadius}, 100);
                    }
                }
                
            }, () => {
                curves[i].attr({'stroke':"#20A4F3", "stroke-width":curveWidth})
                circles[numbers.indexOf(curves[i].data("from"))].attr('fill', "#fff");
                circles[numbers.indexOf(curves[i].data("from"))].animate({"r": circleRadius}, 100);
                for(let q = 0; q < curves.length; q++) {
                    if (curves[q].data("from") === numbers[i]) {
                    curves[q].animate({'stroke-width': curveWidth}, 100);
                    circles[numbers.indexOf(curves[q].data("to"))].animate({"r":circleRadius}, 100);
                    }
                }
            }
        );
          
        }   
        canvas.canvas.className.baseVal += 'canvas';     
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
                
                <TransformWrapper
                  wheel = {{
                    wheelEnabled: true,
                    touchPadEnabled: true,
                    limitsOnWheel: true,
                    step: 200
                    
                  }}  
                  options ={{
                      limitToBounds: false,
                      minScale: -1
                  }}
                  doubleClick ={{
                      mode: 'reset'
                  }}
                    >
                    <TransformComponent>
                        <div id = "test"></div>
                    </TransformComponent>
                </TransformWrapper>
                <img id= "loading" className="loading" src = {loadImg} alt='Loading'></img> 
            </div>
            );
        
    }
}

export default ThreadArcs;