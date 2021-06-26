import React from 'react';
import "../Css/About.css";


class About extends React.Component {
    componentDidMount() {
        this.props.update()
    }
    
    render() {    
        return (
            <div> 
            <div class="header">
                <h1>Graphify explained</h1>
            </div>
                <div className = 'generalInfo'><p>Graphify is a visualizing tool created for the purpose of visualizing network data sets.
                Think about things like all the emails send within a company or a network of computers. To visualize these sets we 
                use the Threadarcs visualization and an Adjacency matrix, which are further explained below.</p> 
                <p><h3>Dataset requirements</h3>
                We have made our tool as robust as possible, but there are still some basic requirements for your dataset if you intend to 
                use Graphify. The first requirements is the filetype, this should be a CSV. Secondly is the structure of your dataset:
                Each line in the csv should represent and connection between two network nodes. For example an email send between two 
                adresses or an internet connection between two. This edge is only required to have a date, but more attributes can be added.</p>
                <p><h3>Visually impaired mode</h3>
                Graphify has designed with visually impaired people taken into account. The color scheme of the visualizations can be adjusted
                to be usable by colorblind people, there are different color schemes for normal vision, Protanopia, Deuteranopia and Tritanopia.</p></div>
                <div className = 'threadArcs'><h1>Threadarcs</h1><p>The Threadarcs visualization is a designed to display email threads, but we
                modified it so that it can work for any network dataset(that follows the previously stated requirements). It displays the network
                nodes in a vertical line and draws the connections as arcs between them. On small datasets this works like a charm while on bigger datasets
                this can sadly get clustered and difficult to read at first.</p><p>Therefore the usage of interactions comes in handy. In the threadarcs, hovering over a node will
                display all it's outgoing connections and some extra information will be displayed, clicking this node will pin it and the outgoing connections will stay highlighted
                until you click the same node again. This highlighting in both hovering and clicking will also show up in the Adjacency matrix. The threadarcs 
                can also be panned and zoomed.</p></div>
                <div className = 'AM'><h1>Adjacency matrix</h1><p> The Adjacency matrix is a square matrix representing a finite graph and originates 
                from graph theory and computer science. Normally the connections would be shown by a digit and if there is no connection it is shown by a 0.
                In our tool, we get rid of these numbers and instead use differnent colors based on positive, negative or neutral colors. This is quite an 
                easy visualization to read and is also great for spotting patterns.
                </p><p>As with the threadarcs, some interactions have been added to make the Adjacency matrix more usefull, for starters hovering over 
                connections will show some information about the connection, clicking on a connection will pin it and it's information. </p></div>
            </div>
            );
    }    
}

export default About;