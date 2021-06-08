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

        this.colours = [["#20A4F3", "#FFBA49", "#57A773", "#F06C9B", "#5B2A86", "#FB3640", "#CE98F5"], //default
                        ['#3b1f2b', '#a23b72', '#c73e1d', '#f18f01', '#2e86ab', '#00ffc5', '#4acee0'], //prot
                        ["#813405", "#7f0799", "#ff4365", "#058ed9", "#00d9c0", "#e4ff1a", "#b7ad99"], //deut
                        ["#693668", "#a74482", "#b9415f", "#ff3562", "#b7986e", "#ee8e2c", "#ffb86f"]] //trit
        this.currentScheme = "default";
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
    colorCircle(number, color) {
        this.circles[number].attr("fill", color);
        this.circles[number].data({"fill": color});
    }


    

    raphaelRender() {
        this.svgWidth= 500;
        this.circles = [];
        this.numbers = [];
        let lookup = [];
        this.curves = [];
        this.circleRadius = 5;
        let datasize = this.getDataSize()    
        let curveWidth = 1;
        let jobCount = {'jobs':[],};
        for(let i = 0; i < datasize; i++) {
            if(this.numbers.includes(this.getData(i, 'toId')) === false) {
                this.numbers.push(this.getData(i, 'toId'));
                lookup[this.getData(i, 'toId')] = {'email': this.getData(i,'toEmail'), 'jobTitle': this.getData(i,'toJob')};
            }
            if(this.numbers.includes(this.getData(i, 'fromId')) === false){
                this.numbers.push(this.getData(i, 'fromId'));
                lookup[this.getData(i, 'fromId')] = {'email': this.getData(i,'fromEmail'), 'jobTitle': this.getData(i,'fromJob')};
            }
        }
        // console.log(this.getData(1))
        // console.log(lookup)
        
        // Counting all the jobs per jobTitle
        for(let key in lookup) {
            if(lookup[key]['jobTitle'] in jobCount) {
                jobCount[lookup[key]['jobTitle']] += 1;
            } else {
                jobCount['jobs'].push(lookup[key]['jobTitle'])
                jobCount[lookup[key]['jobTitle']] = 1;
            }
        }
        // console.log(jobCount)
        // console.log("Employee" in jobCount)

        // Assigning colour to each job based on amount of times it occurs
        let jobColour = [[]]       
        for(let i = 0; i < 7; i++){
            let highest = 0;
            let title;
            for(let key in jobCount){
                if(key !== "jobs" & jobCount[key] > highest) {
                    highest = jobCount[key];
                    title = key;
                }
            }
            
            jobColour[i] = [title, highest];
            delete jobCount[title];
        }
        // console.log(jobColour)
        
        // Selection of the right first dimension of the colours array
        let colour_x;
        if (this.currentScheme === "default"){
            colour_x = 0;
        } else if (this.currentScheme === "prot"){
            colour_x = 1;
        } else if (this.currentScheme === "deut"){
            colour_x = 2;
        } else if (this.currentScheme === "trit"){ 
            colour_x = 3;
        }


        let canvas = Raphael(document.getElementById('test'),  this.svgWidth, (this.numbers.length+2)*(3*this.circleRadius)+50,);
        //numbers.sort(function(a, b){return a - b});
        for(let j = 0; j < this.numbers.length-1; j++) {
            let circle = canvas.circle(this.svgWidth/2, j*3*this.circleRadius+50, this.circleRadius)
            circle.data({"id": this.numbers[j]})
            this.circles.push(circle)

            //              ~~~~ Below is an experiment for code optimalisation ~~~~
            // let id;
            // id = jobColour.find(lookup[this.circles[j].data('id')]['jobTitle']);
            // this.colorCircle(j, this.colours[colour_x][id]);

            // Buncha if statements to give the nodes the right colour
            if (lookup[this.circles[j].data('id')]['jobTitle'] === jobColour[0][0]){
                this.colorCircle(j, this.colours[colour_x][0]);
            } else if (lookup[this.circles[j].data('id')]['jobTitle'] === jobColour[1][0]){
                this.colorCircle(j, this.colours[colour_x][1]);
            } else if (lookup[this.circles[j].data('id')]['jobTitle'] === jobColour[2][0]){
                this.colorCircle(j, this.colours[colour_x][2]);
            } else if (lookup[this.circles[j].data('id')]['jobTitle'] === jobColour[3][0]){
                this.colorCircle(j, this.colours[colour_x][3]);
            } else if (lookup[this.circles[j].data('id')]['jobTitle'] === jobColour[4][0]){
                this.colorCircle(j, this.colours[colour_x][4]);
            } else if (lookup[this.circles[j].data('id')]['jobTitle'] === jobColour[5][0]){
                this.colorCircle(j, this.colours[colour_x][5]);
            } else {
                this.colorCircle(j, this.colours[colour_x][6]);
            }

           
            this.circles[j].attr("stroke-width", Math.floor(this.circleRadius/3)+1);
            this.circles[j].click(() => {
                alert(lookup[this.circles[j].data("id")]['email'])
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
                this.circles[j].attr('fill', this.circles[j].data('fill'));
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
            if(highest !== lowest) {
                let circ1 = this.circles[this.numbers.indexOf(String(lowest))];
                let circ2 = this.circles[this.numbers.indexOf(String(highest))]
                let distance =  (circ2.attr('cy') - circ1.attr('cy')) 
                var curve = canvas.path("M "+ (circ1.attr('cx')) +"," + (circ1.attr('cy')) + " A"+  (Math.abs(distance/2) > (this.svgWidth/2 -20) ? (this.svgWidth/2)*(1-(Math.abs(distance/2) / (this.circles.length*50) ))-10 : Math.abs(distance/2)) +"," + Math.abs(distance/2)  + " 0 0,1 " + circ2.attr('cx') 
                +"," + (circ2.attr('cy'))).attr({"stroke-width": curveWidth, "stroke": "#20A4F3",});
                curve.data({"from": String(lowest), "to": String(highest)})
                curve.toBack();
                this.curves.push(curve)
                }
            }
            for(let i = 0; i< this.curves.length; i++) {
                this.curves[i].hover(() => {
                    this.curves[i].attr({'stroke':"#000", "stroke-width": curveWidth*3})
                    this.curves[i].toFront()
                    this.circles[this.numbers.indexOf(this.curves[i].data("from"))].attr({"fill" :' #f00'});
                    this.circles[this.numbers.indexOf(this.curves[i].data("from"))].toFront()
                    this.circles[this.numbers.indexOf(this.curves[i].data("from"))].animate({"r": 2*this.circleRadius}, 100);
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].attr({"fill" :' #f00'});
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].toFront()
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].animate({"r": 2*this.circleRadius}, 100);
                    
                }, () => {
                    this.curves[i].attr({'stroke':"#20A4F3", "stroke-width":curveWidth})
                    this.curves[i].toBack()
                    this.circles[this.numbers.indexOf(this.curves[i].data("from"))].attr('fill', this.circles[this.numbers.indexOf(this.curves[i].data("from"))].data('fill'));
                    this.circles[this.numbers.indexOf(this.curves[i].data("from"))].animate({"r": this.circleRadius}, 100);
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].attr('fill',  this.circles[this.numbers.indexOf(this.curves[i].data("to"))].data('fill'));
                    this.circles[this.numbers.indexOf(this.curves[i].data("to"))].animate({"r": this.circleRadius}, 100);
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
                  defaultScale={1}
                  defaultPositionX = {0}
                  wheel = {{
                    wheelEnabled: true,
                    touchPadEnabled: true,
                    limitsOnWheel: true,
                    step: 5
                    
                  }}  
                  options ={{
                      limitToBounds: false,
                      limitToWrapper:true,
                      minScale: 0.3,
                      maxScale: 1.5,
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