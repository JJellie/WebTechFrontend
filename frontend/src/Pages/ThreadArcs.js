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
        this.lastHover = ['', '', '', null, null];
        this.state = {"data": [], "testdata": '', "loading": "", "rendered": false, 'hover': this.props.getVisState};
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
        this.svgWidth= 1200;
        this.circles = [];
        this.numbers = [];
        let lookup = [];
        this.curves = [];
        this.circleRadius = 10;
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
            if(this.numbers.includes(this.getData(i, 'toId')) === false) {
                this.numbers.push(this.getData(i, 'toId'));
                lookup[this.getData(i, 'toId')] = this.getData(i,'toEmail');
            }
            if(this.numbers.includes(this.getData(i, 'fromId')) === false){
                this.numbers.push(this.getData(i, 'fromId'));
                lookup[this.getData(i, 'fromId')] = this.getData(i,'fromEmail');
            }
        }

        let canvas = Raphael(document.getElementById('test'),  this.svgWidth, (this.numbers.length+1)*(3*this.circleRadius),);
        //numbers.sort(function(a, b){return a - b});
        for(let j = 0; j < this.numbers.length-1; j++) {
            let circle = canvas.circle(this.svgWidth/2, j*3*this.circleRadius+50, this.circleRadius)
            circle.data({"id": this.numbers[j]})
            this.circles.push(circle)
            this.circles[j].attr("fill", "#fff");
            this.circles[j].attr("stroke-width", "3");
            this.circles[j].click(() => {
                alert(lookup[this.circles[j].data("id")])
            })
            this.circles[j].hover(() => {
                this.props.updateVisState({"hoverEmail":lookup[this.circles[j].data("id")]})
                this.circles[j].attr({"fill" :' #f00'});
                this.circles[j].animate({"r": 2*this.circleRadius}, 100);
                for(let i = 0; i < this.curves.length; i++) {
                    if (this.curves[i].data("from") === this.numbers[j]) {
                    this.curves[i].animate({'stroke-width': curveWidth*2}, 100);
                    this.curves[i].attr({"stroke": '#000'})
                    this.curves[i].toFront();
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].animate({"r":1.5*this.circleRadius}, 100)
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].toFront();
                    }
                    this.circles[j].toFront();
                }
                
            }, () => {
                this.circles[j].attr('fill', "#fff");
                this.circles[j].animate({"r": this.circleRadius}, 100);
                for(let i = 0; i < this.curves.length; i++) {
                    if (this.curves[i].data("from") === this.numbers[j]) {
                        this.curves[i].animate({'stroke-width': curveWidth}, 100);
                        this.curves[i].attr({"stroke": '#20A4F3'})
                        this.curves[i].toBack()
                        this.circles[this.numbers.indexOf(this.curves[i].data("to"))].animate({"r":this.circleRadius}, 100)
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
            let circ1 = this.circles[this.numbers.indexOf(String(lowest))];
            let circ2 = this.circles[this.numbers.indexOf(String(highest))]
            let distance =  (circ2.attr('cy') - circ1.attr('cy')) 
            var curve = canvas.path("M "+ (circ1.attr('cx')+10) +"," + (circ1.attr('cy')) + " A"+  (Math.abs(distance/2) > (this.svgWidth/2 -10) ? (this.svgWidth/2)*(1-(Math.abs(distance/2) / (this.circles.length*100) )) : Math.abs(distance/2)) +"," + Math.abs(distance/2)  + " 0 0,1 " + circ2.attr('cx') 
            +"," + (circ2.attr('cy'))).attr({"stroke-width": curveWidth, "stroke": "#20A4F3",});
            curve.data({"from": String(lowest), "to": String(highest)})
            curve.toBack();
            this.curves.push(curve)


            this.curves[i].hover(() => {
                this.curves[i].attr({'stroke':"#000", "stroke-width": curveWidth*3})
                this.circles[this.numbers.indexOf(this.curves[i].data("from"))].attr({"fill" :' #f00'});
                this.circles[this.numbers.indexOf(this.curves[i].data("from"))].animate({"r": 2*this.circleRadius}, 100);
                for(let q = 0; q < this.curves.length; q++) {
                    if (this.curves[q].data("from") === this.numbers[i]) {
                    this.curves[q].animate({'stroke-width': curveWidth*3}, 100);
                    this.circles[this.numbers.indexOf(this.curves[q].data("to"))].animate({"r":1.5*this.circleRadius}, 100);
                    }
                }
                
            }, () => {
                this.curves[i].attr({'stroke':"#20A4F3", "stroke-width":curveWidth})
                this.circles[this.numbers.indexOf(this.curves[i].data("from"))].attr('fill', "#fff");
                this.circles[this.numbers.indexOf(this.curves[i].data("from"))].animate({"r": this.circleRadius}, 100);
                for(let q = 0; q < this.curves.length; q++) {
                    if (this.curves[q].data("from") === this.numbers[i]) {
                        this.curves[q].animate({'stroke-width': curveWidth}, 100);
                        this.circles[this.numbers.indexOf(this.curves[q].data("to"))].animate({"r":this.circleRadius}, 100);
                    }
                }
            }
        );
          
        }   
        canvas.canvas.className.baseVal += 'canvas';     
    } 
    crossHover() {
        let lastId1 = this.lastHover[3];
        let lastId2 = this.lastHover[4];
        this.lastHover = this.props.getVisState;
        let id1 = this.props.getVisState[3];
        let id2 = this.props.getVisState[4];
        if(!(id1 === null)) {
            this.circles[this.numbers.indexOf(String(id1))].animate({"r": 2*this.circleRadius}, 100);
            this.circles[this.numbers.indexOf(String(id2))].animate({"r": 2*this.circleRadius}, 100);
        }
        if(!(lastId1 === null)) {
            this.circles[this.numbers.indexOf(String(lastId1))].animate({"r": this.circleRadius}, 100);
            this.circles[this.numbers.indexOf(String(lastId2))].animate({"r": this.circleRadius}, 100);
        }
    }
     
   
    render () {
        if(this.state.rendered) {
            this.crossHover();
        }


        if(this.props.uploadStatus === true) {
            if(this.state.rendered === false) {
                if(this.props.file !== "") {
                    this.getParsedData(this.props.file);
                    
                }
            }
            
        }
        return (
            <div>
                
                <TransformWrapper
                  defaultScale={0.5}
                  wheel = {{
                    wheelEnabled: true,
                    touchPadEnabled: true,
                    limitsOnWheel: true,
                    step: 20
                    
                  }}  
                  options ={{
                      limitToBounds: false,
                      limitToWrapper:true,
                      minScale: -1,
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