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
    previousMenu = "";
    showMenu = true;
    constructor(props) {
        super(props);

        if (window.location.pathname === "/") {
            this.state = { home: "active", vis: "", about: "", contact: ""};
            this.previousMenu = "home"
        } else if (window.location.pathname === "/vis") {
            this.state = { home: "", vis: "active", about: "", contact: ""};
            this.previousMenu = "vis"
        } else if (window.location.pathname === "/about") {
            this.state = { home: "", vis: "", about: "active", contact: ""};
            this.previousMenu = "about"
        } else if (window.location.pathname === "/contact") {
            this.state = { home: "", vis: "", about: "", contact: "active"};
            this.previousMenu = "contact"
        }



    }

    updateState(newMenu) {
        this.setState({[this.previousMenu]: ""});
        this.setState({[newMenu]: "active"});
        this.previousMenu = newMenu;

    };
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
            <div class = "sidebar" id='sidebar'>
            <button className='Hamburger' onClick={() => this.menuChange()}><img src={Hamburger} alt='Hamburger Icon'width='40px' height="40px"></img></button>
            <ul class= 'sidebarList' id = 'sideBarList'>
                <li><button  className="image"><img src={Logo} alt="company logo" width="168" height="168"></img></button></li>
                <li><Link to="/"><button onClick={() => this.updateState('home')}  className={this.state.home}><span>Home</span></button></Link></li>
                <li><Link to="/vis"><button onClick={() => this.updateState('vis')}  className={this.state.vis}>Visualisation</button></Link></li>
                <li><Link to="/about"><button onClick={() => this.updateState('about')}  className={this.state.about}>About</button></Link></li>
                <li><Link to="/contact"><button onClick={() => this.updateState('contact')}  className={this.state.contact}>Contact</button></Link></li>
            </ul>
            </div>
            <div class = "page">
            <Switch>
                <Route exact path="/">
                    <HomePage />    
                </Route>
                <Route exact path="/about">
                    <About />
                </Route>
                <Route exact path="/Vis">
                    <Vis />
                </Route>
                <Route exact path="/contact">
                    <Contact />
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
