import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import AdjacencyMatrix from './PlanetVis';


class Vis extends React.Component {
    render() {
        return (
            <div>
                <ThreadArcs />
                <AdjacencyMatrix />
            </div>
        );
    }
}

export default Vis;