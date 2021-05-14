import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import PlanetVis from './PlanetVis';


class Vis extends React.Component {
    render() {
        return (
            <div>
                <h1> Threadarcs </h1>
                <ThreadArcs />

                <PlanetVis />
            </div>
        );
    }
}

export default Vis;