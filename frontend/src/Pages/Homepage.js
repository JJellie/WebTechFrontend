import React from 'react';
import "../Css/Homepage.css"


class HomePage extends React.Component {
    render () {
        return (
            <div> 
                <h1> Welcome to the homepage of the Amazing DBL team! </h1>
                <p>This page is still in testing phase. If you have any remarks, please do let us know.</p>

                <img src="https://i.imgur.com/OXhppnI.png" alt = "Banner picure" height="400" width = "1300"></img>
            </div>
            );
        
    }
}

export default HomePage;