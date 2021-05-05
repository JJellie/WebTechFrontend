import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
//import App from './App';
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
        this.state = { home: "active", vis: "", about: "", contact: ""}
    }
    render() {
        return (    
        <Router>
            <ul>
                <li><button contentStyle={{width:'100%'}} className="active"><img src="https://static.food4rhino.com/s3fs-public/users-files/dale-fugier/app/colorpicker.png" alt="company logo" width="168" height="168"></img></button></li>
                <li><Link to="/"><button contentStyle={{width:'100%'}} className={this.state.home}><span>Home</span></button></Link></li>
                <li><Link to="/Vis"><button contentStyle={{width:'100%'}} className={this.state.vis}>Visualisation</button></Link></li>
                <li><Link to="/about"><button contentStyle={{width:'100%'}} className={this.state.about}>About</button></Link></li>
                <li><Link to="/contact"><button contentStyle={{width:'100%', height: "100%"}} className={this.state.contact}>Contact</button></Link></li>
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
