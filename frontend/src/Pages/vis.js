import ThreadArcs from './ThreadArcs';
import '../Css/visual.css';
import React from 'react';
import AdjacencyMatrix from './AdjacencyMatrix';


class Vis extends React.Component {
    componentDidMount() {
        this.props.update()
    }
    SendFile = async () => {
        let file = document.getElementById('UploadedFile').files[0];
        console.log(file)
        
        let data = new FormData();
        data.append("file", file);
        let filename = file.name;
        const response = await fetch("http://localhost:3001/upload", { method: "POST", body: data });

        if (response.status === 200) {
            console.log("filename", filename);
            this.getParsedData(filename);
        }
    }
    
    render() {
        return (
            <div>
                <label for='UploadedFile' className='UploadButton'>Upload file here</label> 
                <input type = "file" accept = ".csv"  id="UploadedFile"></input>
                <input type = "submit" onClick={this.SendFile} className="UploadButton"></input>
                <h1 className='Visheader'> Threadarcs </h1>
                <ThreadArcs />
                <h1 className='Visheader'> AdjacencyMatrix </h1>
                <AdjacencyMatrix />
            </div>
        );
    }
}

export default Vis;