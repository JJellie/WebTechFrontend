import React from 'react';
import "../Css/Homepage.css";
import Banner from "../Images/DBL_Banner.png";
import {
    Link,
  } from "react-router-dom";

class HomePage extends React.Component {
    componentDidMount() {
        this.props.update()
    }


    render () {
        return (
            <div>
                <div className="first"> 
                    <h1>NAME</h1>
                    <h2>By the Amazing DBL team</h2>
                    <p> Basic visualization tool for visualizing <br></br> Nice Adjacency Matrices and Thread Arcs <br></br> Start making your visualizations now for free </p>
                    <Link to="/vis"><button>Start visualizing</button></Link>
                </div>

                <div className="second">
                    <img src={Banner} alt = "Banner picure" ></img>
                </div>
            </div>

            );
        
    }
}

export default HomePage;