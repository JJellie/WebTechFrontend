import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import PlanetVis from './PlanetVis';
import Banner from "../Images/banner vis.png";
import Divider from "../Images/divider.png";


class Vis extends React.Component {
    componentDidMount() {
        this.props.update()
    }
    
    render() {
        return (
            <div> 
                <div class="visHeader">
                    <h1>Visualisation</h1>
                </div>

                <div class="line">
                    {/* this will be a line */}
                </div>
                <div class="symbol"> <img src={Divider} alt="Divider"></img> </div>
                <div class="line2">
                    {/* this will be a line */}
                </div>

                <div class="visText">
                    <p> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec quis porta lectus. Suspendisse efficitur odio a felis fringilla, at mattis justo porta. Mauris imperdiet sem eu mauris volutpat, sed pulvinar libero convallis. 
                Fusce ullamcorper, enim eget consequat auctor, arcu turpis molestie nisl, rhoncus fringilla nisl lorem sit amet erat. 
                Mauris cursus nunc dolor, vel malesuada ipsum ullamcorper non. Cras in nibh nec lectus semper interdum. 
                Ut non nisi ante. In hac habitasse platea dictumst. Sed at tellus est.</p>
                </div>

                <div class="line">
                    {/* this will be a line */}
                </div>
                <div class="symbol"><img src={Divider} alt="Divider"></img></div>
                <div class="line2">
                    {/* this will be a line */}
                </div>

                <div class="uploadbutton">
                    <button>Upload your data here!</button>
                </div>

                <div class="banner">
                    <img src={Banner} alt="Banner image"></img>
                </div>


                {/* <ThreadArcs />
                <PlanetVis /> */}
            </div>
        );
    }
}

export default Vis;