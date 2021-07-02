import React from 'react';
import "../Css/Homepage.css";
import Banner from "../Images/DBL_Banner.png";
import BannerNew from "../Images/DBL_banner_new.png";
import Divider from "../Images/divider.png";
import Logo from '../Images/logo 1.png';
import TALogo from '../Images/TA2 logo-image.png';
import AMLogo from '../Images/AM logo-image.png';
import MixedLogo from '../Images/Mixed logo-image.png';
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
                        <h2>for Everyone to see</h2>
                    </div>
                    <div className = "BannerButton">
                        <Link to="/vis"><button>Start visualizing</button></Link>
                        <p> Scroll down for more information... </p>
                    </div>
                </div>

                <div class="marquee">
                    <div>
                        <span> ◈    Basic visualization tool for visualizing    ◈   Nice Adjacency Matrices and Thread Arcs ◈   Start making your visualizations now for free! </span> 
                        <span> ◈    Basic visualization tool for visualizing    ◈   Nice Adjacency Matrices and Thread Arcs ◈   Start making your visualizations now for free! </span>
                    </div>
                </div>

                <div className = "GeneralAd">
                    <img src={Logo} alt="company logo"></img> 
                    <div className = "generalText">
                        <p>
                        On this website you can find 2 beautiful visualisations, carefully programmed by the Amazing Dbl Team. They have put in a grand total of 840 hours, spread over 6 members.
                        Below you will be able to find screenshots of each of the beautiful visualisations, some general information, and a short description of what each page will contain. 
                        Thank you for making use of our accessible visualisation tool, Graphify™, by the Amazing DBL Team.
                        </p>
                    </div>
                </div>

                <div className = "ThreadArcsAd">
                    <img src={TALogo} alt="threadarc logo"></img>
                    <div className = "ThreadText">
                        <p>
                        We will visualise your network data into a "ThreadArc" visualisation. 
                        This visualisation displays the nodes as circles and edges as curved lines. 
                        For more information on how to interact with this visualisation and how to read it, see our <Link to="../about">About page</Link>.
                        </p>
                    </div>
                </div>

                <div className = "AdjacencyAd">
                    <img src={AMLogo} alt="Matrix logo"></img>
                    <div className = "AdjacencyText">
                        <p>
                        We will visualise your network data into a "Adjacency Matrix" visualisation. 
                        This visualisation displays the nodes as headers and edges as coloured cells. 
                        For more information on how to interact with this visualisation and how to read it, see our <Link to="../about">About page</Link>.
                        </p>
                    </div>

                </div>

                <div className = "PageAd">
                    <img src={MixedLogo} alt="company logo"></img> 
                    <div className = "PageText">
                        <p>
                        Our website has 4 pages. 
                        Firstly the home page. This is where you are now.
                        Secondly the visualisation page. This page contains the visualisations. Upload your data here to get started. You can navigate to this page by clicking at the top, or by clicking <Link to="../vis">here</Link>. <br></br>
                        Thirdly the about page. This page provides an extra explanation for the visualisations, as well as a usage. You can navigate to this page by clicking at the top, or by clicking <Link to="../about">here</Link>. <br></br>
                        Lastly the contact page. This provides our contact details for any other projects, and some personal information. You can navigate to this page by clicking at the top, or by clicking <Link to="../contact">here</Link>.
                        </p>
                    </div>
                </div>

            </div>
        )
    }
}

export default HomePage;