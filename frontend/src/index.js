import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import About from './About';
import reportWebVitals from './reportWebVitals';
import HomePage from './Homepage';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class NavBar extends React.Component {
    constructor(props){
        super(props)
        this.state = { home: ""}
    }
    render() {
        return (    
        <Router>
            <ul>
                <li><a href="none" className="active"><img src="https://static.food4rhino.com/s3fs-public/users-files/dale-fugier/app/colorpicker.png" alt="company logo" width="168" height="168"></img></a></li>
                <li><a className="active"><Link to="/">Home</Link></a></li>
                <li><a><Link to="/Vis">Visualisation</Link></a></li>
                <li><a><Link to="/about">About</Link></a></li>
                <li><a><Link to="/contact">Contact</Link></a></li>
            </ul>
            <Switch>
                <Route exact path="/">
                    <HomePage />
                </Route>
                <Route exact path="/about">
                    <About />
                </Route>
                <Route exact path="/Vis">
                    <HomePage />
                </Route>
                <Route exact path="/contact">
                    <HomePage />
                </Route>
            </Switch>
        </Router>
        )};
}

ReactDOM.render(
    <NavBar />,
  document.getElementById('menu')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
