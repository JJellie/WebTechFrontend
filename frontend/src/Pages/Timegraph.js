import React, {useState, useEffect, useMemo, useRef} from 'react';
import Raphael from 'raphael';
import * as d3 from "d3";
import {event} from "d3";
import "../Css/Timegraph.css";

const oneDay = 1000*3600*24;

function Timegraph({width, height, edges, datesSorted, countMax, color, setTimePeriod}) {
  const minDate = datesSorted[0];
  const maxDate = datesSorted[datesSorted.length-1];
  const margin = {top:0.1*height , right:0.1*width, bottom:0.1*height, left:0.1*width}
  const innerWidth = width-margin.left-margin.right;
  const innerHeight = height-margin.bottom-margin.top;
  const timeScale = d3.scaleTime().domain([minDate,maxDate]).range([margin.left,width-margin.right]);
  const countScale = d3.scaleLinear().domain([0,Math.ceil(countMax+0.15*countMax)]).range([height-margin.bottom, margin.top]);
  const backgroundLineColor = "#8c8c8c";
  const backgroundColor = "#e8e8e8";
  const strokeWidth = 2;
  const textOffsetBottom = 15;
  const textOffsetLeft = 10;
  const timeFormat = d3.timeFormat("%d %b %Y");
  const brushRef = useRef();
  useEffect(() => {
    const brush = d3.brushX().extent([[margin.left,margin.top],[width-margin.right,height-margin.bottom]]);
    brush.on('end', (event) => {
      setTimePeriod(event.selection ? [Date.parse(timeScale.invert(event.selection[0])),Date.parse(timeScale.invert(event.selection[1]))] : null);
    });
    brush(d3.select(brushRef.current));
  }, [])

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
      {datesSorted.slice(1).map((date, index) => {
        let currentDate = new Date(parseFloat(date));
        let previousDate = new Date(parseFloat(datesSorted[index]));
        if(currentDate.getTime() - previousDate.getTime() === oneDay) {
          return( <line x1={timeScale(datesSorted[index])} x2={timeScale(date)} y1={countScale(edges[datesSorted[index]].count)} y2={countScale(edges[date].count)}
                        style={{strokeWidth: 1.3*strokeWidth, stroke: color}}
                  ></line>)
        } else {
          let currentDatePreviousDay = new Date(currentDate);
          let previousDateNextDay = new Date(previousDate);
          currentDatePreviousDay = currentDatePreviousDay.setDate(currentDatePreviousDay.getDate() - 1);
          previousDateNextDay = previousDateNextDay.setDate(previousDateNextDay.getDate() + 1);
          return(
            <>
            <line x1={timeScale(previousDate)} x2={timeScale(previousDateNextDay)} y1={countScale(edges[datesSorted[index]].count)} y2={countScale(0)}
                  style={{strokeWidth: 1.3*strokeWidth, stroke: color}}
            ></line>
            <line x1={timeScale(currentDatePreviousDay)} x2={timeScale(currentDate)} y1={countScale(0)} y2={countScale(edges[date].count)}
                  style={{strokeWidth: 1.3*strokeWidth, stroke: color}}
            ></line>
            </>
          )
        }
      })}

      <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} 
      style={{stroke: "black", "stroke-width": 1.3*strokeWidth, fillOpacity:0}}></rect>
      <g ref={brushRef} />
    </svg>
  )
}

export default Timegraph;


