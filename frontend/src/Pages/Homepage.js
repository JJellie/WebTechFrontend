import React from 'react';
import "../Css/Homepage.css";
import Banner from "../Images/DBL_Banner.png";
import BannerNew from "../Images/DBL_banner_new.png";
import Divider from "../Images/divider.png";
import {
    Link,
  } from "react-router-dom";

class HomePage extends React.Component {
    componentDidMount() {
        this.props.update()
    }

    render () {
        return (
            <div className = "Total">
                <div className = "Banner">
                    {/* <img src= {BannerNew} alt = "Oops! This image was loaded incorrectly" ></img> */}
                    <div className = "BannerText">
                        <h1> Graphify </h1>
                        <h2>By the Amazing DBL team</h2>
                    </div>
                    <div className = "BannerButton">
                    <Link to="/vis"><button>Start visualizing</button></Link>
                    </div>
                </div>

                <div className = "BannerBottomText">
                    <p> basic visualization tool for visualizing    ◈   nice Adjacency Matrices and Thread Arcs <br></br> Start making your visualizations now for free! </p>
                </div>



            </div>
        )
    }
}

export default HomePage;