import React from 'react';
import "../Css/Homepage.css";
import Banner from "../Images/DBL_Banner.png";


class HomePage extends React.Component {
    render () {
        return (
            <div>
            <div class="first"> 
                <h1> Welcome to the homepage of the Amazing DBL team! </h1>
                <p>This page is still in testing phase. If you have any remarks, please do let us know.</p>
                <p></p>
            </div>

            <div class="second">
                <img src={Banner} alt = "Banner picure" ></img>
            </div>
            </div>

            );
        
    }
}

export default HomePage;