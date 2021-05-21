import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import AdjacencyMatrix from './AdjacencyMatrix';


class Vis extends React.Component {
    render() {
        return (
            <div>
                <h1 className='Visheader'> Threadarcs </h1>
                <ThreadArcs />
                <h1 className='Visheader'> AdjacencyMatrix </h1>
                <AdjacencyMatrix />
            </div>
        );
    }
}

export default Vis;