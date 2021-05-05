import React from 'react';
import "../Css/Homepage.css"


class HomePage extends React.Component {
    render () {
        return (
            <div>
            <div class="first"> 
                <h1> Welcome to the homepage of the Amazing DBL team! </h1>
                <p>This page is still in testing phase. If you have any remarks, please do let us know.</p>
            </div>

            <div class="second">
                <img src="https://i.imgur.com/OXhppnI.png" alt = "Banner picure" ></img>
            </div>
            </div>

            );
        
    }
}

export default HomePage;