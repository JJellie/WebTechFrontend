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
                return cols;
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
    if (val['error']) {
        throw new Error(val['error']);
    }
    return val['columns'];
}

//Function for sending the sorted columns to the backend for full dataset processing
async function sendOrderedColumns(colArray, filename) {
    let data = new FormData();
    data.append(colArray);
    await fetch('htt[://localhost:3001/upload/columns?file=' +filename, {method: "POST", body:data});
}

export function DatasetPopup({ setDataSet }) {
    const initialPopupState = 'fileSubmit';
    const [filename, setFilename] = useState(null);
    const [popupState, setPopupState] = useState(initialPopupState);
    const [columnNames, setColumns] = useState(null);
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
    
    return (
        <div id='popup' className='popup'>
            <div className='popup-content'>
                {popupState === "fileSubmit" || popupState === "loading" ?
                    <>
                        <span onClick={() => {closePopup(); setPopupState(initialPopupState)}} className="close">&times;</span>
                        <label htmlFor='UploadedFile' className='UploadButton'>Choose file here</label> 
                        <input type = "file" accept = ".csv"  id="UploadedFile" onChange={()=> ShowSubmit()}></input>
                        <span className='nameDisplay'>Chosen file's name:<span className='fileName'>{filename}</span></span>
                        {popupState === "fileSubmit" ?
                            <>
                                <label htmlFor='Submit' id='SubmitBut' className='SubmitButton'><span>Confirm</span></label> 
                                <input type = "submit" id='Submit' onClick={async () => {setPopupState("loading"); setColumns(await postDataSet(document.getElementById('UploadedFile').files[0])); setPopupState("columnSorting")}} className="UploadButton"></input>
                            </>
                            :
                                <label htmlFor='Submit' id='SubmitBut' className='SubmitButton SubmitButtonLoading'><span></span></label> 
                        }
                        <label className='testSetText' id='testSet' onClick={() => {}}>Or click here to use a test data set</label>
                    </>
                :
                    <>
                        <span onClick={() => {(closePopup()); setPopupState(initialPopupState)}} className="close">&times;</span>
                        <div>Lorum ipsum dolor sit amet</div>
                        {columnNames.map((columnName) => (
                            <div className='dataCols' key={columnName}>{columnName}</div>
                        ))}
                    </>
                }
            </div>
        </div>
    );
}

export function popupShow(){
    let box = document.getElementById('popup')
    box.style.display = "block";
}

function closePopup() {
    document.getElementById("popup").style.display = "none";
}
