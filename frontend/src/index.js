import React from 'react';
import ReactDOM from 'react-dom';
import './Css/index.css';
import About from './Pages/About';
import HomePage from './Pages/Homepage';
import Vis from './Pages/vis';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Contact from './Pages/contact';
import Logo from './Images/logo 1.png'
import Hamburger from './Images/Hamburger.png'

class NavBar extends React.Component {
    constructor(props) {
        super(props);
        // this.state["activepage"]:
        // 0 - Home
        // 1 - Visualisation
        // 2 - About
        // 3 - Contact
        this.state = {
            "activepage" : 0
        };
    }

    updateHome = () => {
        this.setState({"activepage" : 0})
    }
    updateVis = () => {
        this.setState({"activepage" : 1})
    }
    updateAbout = () => {
        this.setState({"activepage" : 2})
    }
    updateContact = () => {
        this.setState({"activepage" : 3})
    }
    
    


    menuChange() {
        this.showMenu = !this.showMenu
        if (this.showMenu) {
            document.getElementById('sidebar').style.width = '50px';
            document.getElementById('sidebar').style.borderStyle = 'none';
            document.getElementById('sideBarList').style.display = 'none';
        } else {
            document.getElementById('sidebar').style.width = '200px';
            document.getElementById('sidebar').style.borderRightStyle = 'solid';
            document.getElementById('sideBarList').style.display = 'block';
        }
    }

    render() {
   
        return (    
        <Router>
            <div className = "sidebar" id='sidebar'>
            <button className='Hamburger' onClick={() => this.menuChange()}><img src={Hamburger} alt='Hamburger Icon'width='40px' height="40px"></img></button>
            <ul className= 'sidebarList' id = 'sideBarList'>
                <li><button  className="image"><img src={Logo} alt="company logo" width="168" height="168"></img></button></li>
                <li><Link to="/"><button className={this.state["activepage"] === 0 ? "active" : ""}><span>Home</span></button></Link></li>
                <li><Link to="/vis"><button className={this.state["activepage"] === 1 ? "active" : ""}>Visualisation</button></Link></li>
                <li><Link to="/about"><button className={this.state["activepage"] === 2 ? "active" : ""}>About</button></Link></li>
                <li><Link to="/contact"><button className={this.state["activepage"] === 3 ? "active" : ""}>Contact</button></Link></li>
            </ul>
            </div>
            <div className = "page">
            <Switch>
                <Route exact path="/">
                    <HomePage update={this.updateHome}/>    
                </Route>
                <Route exact path="/about">
                    <About update={this.updateAbout}/>
                </Route>
                <Route exact path="/Vis">
                    <Vis update={this.updateVis}/>
                </Route>
                <Route exact path="/contact">
                    <Contact update={this.updateContact}/>
                </Route>
            </Switch>
            </div>
        </Router>
        )};
}

ReactDOM.render(
    <NavBar />,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
