import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import AdjacencyMatrix from './AdjacencyMatrix';


class Vis extends React.Component {
    constructor(props) {
        super(props)
        this.state = {"uploaded":false, "filename":"", "emailHover" : 1,"selectedInfo" : ['','','',null,null],}
    }
    componentDidMount() {
        this.props.update()
    }

    SendFile = async () => {
        let file = document.getElementById('UploadedFile').files[0];

        let data = new FormData();
        data.append("file", file);
        let filename = file.name;
        const response = await fetch("http://localhost:3001/upload", { method: "POST", body: data });

        if (response.status === 200) {
            this.setState({"uploaded": true})
            this.setState({'filename': filename})
        }   
    }
    
    render() {
        return (
            <div>
                <label htmlFor='UploadedFile' className='UploadButton'>Upload file here</label> 
                <input type = "file" accept = ".csv"  id="UploadedFile"></input>
                <input type = "submit" onClick={async () => {await this.SendFile()}} className="UploadButton"></input>
                <h1 className='Visheader'> Threadarcs </h1>
                <ThreadArcs file={this.state.filename} uploadStatus={this.state.uploaded} updateVisState={(p) => {this.setState(p)}} getVisState={this.state.selectedInfo}/>
                <h1 className='Visheader'> AdjacencyMatrix </h1>
                <AdjacencyMatrix file={this.state.filename} uploadStatus={this.state.uploaded} updateVisState={(p) => {this.setState(p)}} getVisState={this.state.selectedInfo}/>
                <div id = "block1">
                    <div id = "b1col0">
                        <div className = "infobox">  
                            <p className = "text_infobox">
                                From: {this.state.selectedInfo[0]} <br />
                                To: {this.state.selectedInfo[1]}   <br />
                                Average sentiment: {this.state.selectedInfo[2]} <br /> 
                            </p> 
                        </div>
                    </div>
                    <div id = "b1col1">
                        <div className = "dropdown">
                        </div>
                    </div>
                </div>
            </div>
            
        );
    }
}

export default Vis;