import React, {useState} from 'react'
import '../../Css/PopupStyle.css'
import loadImg from '../../Images/LoadIcon.png'

function sortCols(cols) {

}

//Function that returns the full computed dataset from the backend
async function getDataset(filename) {
    const response = await fetch('http://localhost:3001/download/dataset?file='+filename, {method: "GET"})
    return await response.json()
}

//Function that initially uploads the dataset recieved by the user to the backend
async function postDataSet(file = null) {
    if(file) {
        let data = new FormData();
        data.append('file', file);
        let filename = file.name;
        const response = await fetch("http://localhost:3001/upload/dataset", {method: "POST", body: data});
        if (response.status === 200) {
            try{
                let cols = await recieveColumns(filename);
                let colsDict = {};
                cols[0].forEach((key, i) => colsDict[key] = cols[1][i]);
                return colsDict;
            } catch {
                // TODO: catch error
            }
        } 
    }
}

//Function for getting the columns names of a dataset so the user can sort them accordingly
async function recieveColumns(filename) {
    let cols = await fetch('http://localhost:3001/download/columns?file='+filename, {method: "GET"});
    let val =  await cols.json();
    // if (val['error']) {
    //     throw new Error(val['error']);
    // }
    return val;
}

//Function for sending the sorted columns to the backend for full dataset processing
async function sendOrderedColumns(colArray, filename) {
    let data = new FormData();
    data.append(colArray);
    await fetch('htt[://localhost:3001/upload/columns?file=' +filename, {method: "POST", body:data});
}

const errorMessage = ["Select a column", "Don't click next without selecting anything you idiot"];
let errorCount = 0;
let columnData = {date: null, edgeAttr: null, fromId: null, toId: null, nodeAttr: null};
let columns;


// Popup thing where the dataset will be uploaded and where the user specify the columns
export function DatasetPopup({ setDataSet, colorScheme }) {
    const initialPopupState = 'fileSubmit';
    const initialMenuCount = 0;
    const initialColumnSelected = null;
    const initialError = 0;
    const [filename, setFilename] = useState(null);
    const [popupState, setPopupState] = useState(initialPopupState);
    const [columnNames, setColumns] = useState([]);
    const [menuCount, setMenuCount] = useState(initialMenuCount);
    const [columnSelected, setColumnSelected] = useState(initialColumnSelected);
    const [error, setError] = useState(initialError);

    function dataPassing(filename) {
        setDataSet(getDataset(filename))
    }
    
    function ShowSubmit() {
        try {
            setFilename(document.getElementById('UploadedFile').files[0].name);
            document.getElementById('SubmitBut').style.display = 'block';
        } catch {
            //TODO
        }
    }

    function closePopup() {
        document.getElementById("popup").style.display = "none";
        setPopupState(initialPopupState); 
        setMenuCount(initialMenuCount);
        setError(initialError);
        setColumnSelected(initialColumnSelected);
    }
    
    window.onclick = function(event) {
        if (event.target == document.getElementById("popup")) {
            closePopup();
        }
    }

    function popupPage(popupState, menuCount) {
        const elementsInLine = 5;

        switch(popupState) {
            // file upload popup
            case "fileSubmit":
            case "loading":
                return (
                    <>
                        <label htmlFor='UploadedFile' className='uploadButton'>Choose file here</label> 
                        <input type = "file" accept = ".csv"  id="UploadedFile" onChange={()=> ShowSubmit()}></input>
                        <span className='nameDisplay'>Chosen file's name:<span className='fileName'>{filename}</span></span>
                        {popupState === "fileSubmit" ?
                            <>
                                <label htmlFor='Submit' id='SubmitBut' className='submitButton'><span>Confirm</span></label> 
                                <input 
                                    type = "submit" 
                                    id='Submit' 
                                    onClick={async () => {
                                        setPopupState("loading"); 
                                        setColumns(await postDataSet(document.getElementById('UploadedFile').files[0])); 
                                        setPopupState("columnSorting")
                                        columns=[columnNames.keys()]; console.log(columnNames)}} 
                                    className="uploadButton"></input>
                            </>
                            :
                                <label htmlFor='Submit' id='SubmitBut' className='submitButton submitButtonLoading'><span></span></label> 
                        }
                        <label className='testSetText' id='testSet' onClick={() => {}}>Or click here to use a test data set</label>
                    </>
                )
            // column specification popup
            case "columnSorting":
                switch(menuCount) {
                    // Initial popup screen with some explanation
                    case 0:
                        return (
                            <div className="columnSortingMenu">
                                <h1>Specify Column Names</h1>
                                <p>To fully be able to use your uploaded dataset, we need you to identify which columns correspond to which attributes of the dataset. In the next few pages you can fill in what column of your dataset corresponds to the prompted attribute. <br></br>Press next to proceed.</p>
                                <div className="buttonContainer">
                                    <div>
                                        <button onClick={() => {setPopupState("fileSubmit")}}>Back</button>
                                        <button onClick={() => {setMenuCount(menuCount + 1)}}>Next</button>
                                    </div>
                                </div>
                            </div>
                        )
                    // Selecting the date column popup screen
                    case 1:
                        return (
                            <div className="columnSortingMenu">
                                <h1>Date</h1>
                                <p>Select the column which represents the date.</p>
                                <div className="columnSelection">
                                    {[...Array(Math.ceil(columns[0].length/elementsInLine)).keys()].map((i) =>{
                                        return (
                                            <div key={i} className="columnSelectionRow">
                                                {columns[0][0].slice(i*5,i*5+5).map((column) =>
                                                    (columnSelected === column ?
                                                        <span 
                                                            key={column} 
                                                            className="columnSelectionSelected" 
                                                            style={{color: textColor(colorScheme[0]), backgroundColor : colorScheme[0], borderColor : colorScheme[0]}}
                                                            onClick={() => {setColumnSelected(null)}}
                                                        >
                                                            {column}
                                                        </span> :
                                                        <span 
                                                            key={column} 
                                                            className="columnSelectionUnselected" 
                                                            onClick={() => {setColumnSelected(column); if(error === 2){setError(1)}}}
                                                        >
                                                            {column}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                        )
                                    }
                                    )}
                                </div>
                                {error > 0 ? <div className="errorMessage"><b>{errorCount <= 2 ? errorMessage[0] : errorMessage[1]}</b></div> : ""}
                                <div className="buttonContainer">
                                    <div>
                                        <button onClick={() => {
                                            setError(0);
                                            setMenuCount(menuCount - 1)
                                            }}>Back</button>
                                        {error > 1 ?
                                            <button className="columnSortingButtonDisabled">Next</button>:
                                            <button className="columnSortingButtonEnabled" onClick={() => {
                                                if(columnSelected) {
                                                    columnData["date"] = columnSelected;
                                                    setError(0);
                                                    setColumnSelected(null);
                                                    setMenuCount(menuCount + 1);
                                                } else {
                                                    setError(2);
                                                    errorCount++;
                                                    console.log(errorCount)
                                                }
                                            }}>Next</button>
                                        }
                                        
                                    </div>
                                </div>
                            </div>
                        )
                    case 2:
                        return (
                            <div className="columnSortingMenu">
                                <div className="buttonContainer">
                                    <div>
                                        <button onClick={() => {setMenuCount(menuCount - 1)}}>Back</button>
                                        <button onClick={() => {setMenuCount(menuCount + 1)}}>Next</button>
                                    </div>
                                </div>
                            </div>
                        )
                }
        }
    }

    
    return (
        <div id='popup' className='popup'>
            <div className='popup-content'>
                <span onClick={() => {closePopup()}} className="close">&times;</span> 
                {popupPage(popupState, menuCount)} 
            </div>
        </div>
    );
}

export function popupShow(){
    let box = document.getElementById('popup')
    box.style.display = "block";
}

// returns either black or white depending on contrast with bgColor
function textColor(bgColor) {
    var color = (bgColor.charAt(0) === '#') ? bgColor.substring(1, 7) : bgColor;
    var r = parseInt(color.substring(0, 2), 16); // hexToR
    var g = parseInt(color.substring(2, 4), 16); // hexToG
    var b = parseInt(color.substring(4, 6), 16); // hexToB
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((col) => {
        if (col <= 0.03928) {
            return col / 12.92;
        }
        return Math.pow((col + 0.055) / 1.055, 2.4);
    });
    var L = (0.2126 * c[0]) + (0.7152 * c[1]) + (0.0722 * c[2]);
    return (L > 0.179) ? "#000000" : "#ffffff";
}


