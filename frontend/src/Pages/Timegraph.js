import React, {useState, useEffect, useMemo} from 'react';
import Raphael from 'raphael';
import * as d3 from "d3";
import "../Css/Timegraph.css";


function Timegraph({width, height, edges, datesSorted, countMax}) {
  const minDate = datesSorted[datesSorted.length-1];
  const maxDate = datesSorted[0];
  console.log(datesSorted);
  const margin = {top:0.1*height , right:0.1*width, bottom:0.1*height, left:0.1*width}
  const innerWidth = width-margin.left-margin.right;
  const innerHeight = height-margin.bottom-margin.top;
  const timeScale = d3.scaleTime().domain([minDate,maxDate]).range([width-margin.right,margin.left]);
  const countScale = d3.scaleLinear().domain([0,countMax]).range([height-margin.bottom, margin.top]);
  const backgroundLineColor = "#8c8c8c";
  const backgroundColor = "#e8e8e8";
  const strokeWidth = 2;
  const textOffsetBottom = 15;
  const textOffsetLeft = 10;
  const timegraph = d3.select("#timegraph");
  const timeFormat = d3.timeFormat("%d %b %Y");

  let date = minDate;
  let nextDate = null
  while (date <= maxDate) {
    console.log(timeFormat(date));
    nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    date = nextDate
  }
  
  return(
    <svg id="timegraph" width={width} height={height} className="timegraph">
      <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} 
      style={{fill: backgroundColor}}></rect>
      
      {timeScale.ticks().map(tickValue => (
        <g
          key={tickValue}
          transform={`translate(${timeScale(tickValue)},0)`}
        >
          <line y1={margin.top} y2={height-margin.bottom} style={{"stroke":backgroundLineColor, "stroke-width":strokeWidth}}></line>
          <text y={height-margin.bottom+textOffsetBottom} style={{textAnchor: "middle", fontSize: 13}}>{timeFormat(tickValue)}</text>
        </g>
      ))
      }
      {countScale.ticks().slice(1,countScale.ticks().length-1).map(tickValue => (
        <g
          key={tickValue}
          transform={`translate(0,${countScale(tickValue)})`}
        >
          <line x1={margin.left} x2={width-margin.right} style={{"stroke":backgroundLineColor, "stroke-width":strokeWidth}}></line>
          <text x={margin.left-textOffsetLeft} dy={".25rem"} style={{textAnchor: "end"}}>{tickValue}</text>
        </g>
      ))
      }



      <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} 
      style={{stroke: "black", "stroke-width": 1.3*strokeWidth, fillOpacity:0}}></rect>
    </svg>
  )
}

export default Timegraph;


