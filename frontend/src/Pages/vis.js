import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import PlanetVis from './PlanetVis';


class Vis extends React.Component {
    componentDidMount() {
        this.props.update()
    }
    
    render() {
        return (
            <div>
                <ThreadArcs />
                <PlanetVis />
            </div>
        );
    }
}

export default Vis;