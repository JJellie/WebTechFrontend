import React, { useState } from 'react'
import '../Css/PopupStyle.css'

function sortCols(cols) {

}

//Function that returns the full computed dataset from the backend
async function getDataset(filename) {
  const response = await fetch("http://localhost:3001/download/dataset?file=" + filename, { method: "GET" });
  return await response.json()
}

//Function that initially uploads the dataset recieved by the user to the backend
async function postDataSet(file = null) {
  if (file.name) {
    let data = new FormData();
    data.append('file', file);
    let filename = file.name;
    const response = await fetch("http://localhost:3001/upload/dataset", { method: "POST", body: data });
    if (response.status === 200) {
      try {
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
  let cols = await fetch('http://localhost:3001/download/columns?file=' + filename, { method: "GET" });
  let val = await cols.json();
  // if (val['error']) {
  //     throw new Error(val['error']);
  // }
  return val;
}

//Function for sending the sorted columns to the backend for full dataset processing
async function sendOrderedColumns(columnData, filename) {
  await fetch("http://localhost:3001/upload/columns?file=" + filename , { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(columnData) });
}

function nodeAttrNamePopupShow() {
  nodeAttrNameActice = true;
  document.getElementById('nodeAttrNamePopup').style.display = "block";
}


let nodeAttrNameActice = false;
let errorMessage;
let errorCount = 0;
let columnData = { date: null, edgeAttr: [], fromId: null, toId: null, nodeAttr: {} };
let nodeAttrSelectionData = { colors: {}, columnInfo: {} };
let edgeAttrSelectionData = { colors: {}, columnInfo: {} };
let nodeAttrSelectionColor = 0;
let edgeAttrSelectionColor = 0;

let columns = [[], [], {}, {}];
let rowExample = null;

// Popup thing where the dataset will be uploaded and where the user specify the columns
export function DatasetPopup({ setDataSet, colorScheme }) {
  const initialPopupState = 'fileSubmit';
  const initialMenuCount = 0;
  const initialColumnSelected = null;
  const initialError = 0;
  const initialNodeAttrSelection = false;
  const initialNodeAttrName = "";
  const initialConfirmButtonLoading = false;
  const [file, setFile] = useState({name: null});
  const [popupState, setPopupState] = useState(initialPopupState);
  const [menuCount, setMenuCount] = useState(initialMenuCount);
  const [columnSelected, setColumnSelected] = useState(initialColumnSelected);
  const [error, setError] = useState(initialError);
  const [nodeAttrSelection, setNodeAttrSelection] = useState(initialNodeAttrSelection);
  const [nodeAttrName, setNodeAttrName] = useState(initialNodeAttrName)
  const [confirmButtonLoading, setConfirmButtonLoading] = useState(initialConfirmButtonLoading);

  // Get and set the dataset for the given filename
  function dataPassing(filename) {
    setDataSet(getDataset(filename))
  }

  // Show the submit button after a file has been uploaded
  function ShowSubmit() {
    try {
      setFile(document.getElementById('UploadedFile').files[0]);
      document.getElementById('SubmitBut').style.display = 'block';
    } catch {
      //TODO
    }
  }

  // Close the note attribute name popup
  function nodeAttrNamePopupClose() {
    document.getElementById('AttrNameErrorMessage').style.visibility = 'hidden';
    nodeAttrNameActice = false;
    document.getElementById("nodeAttrNamePopup").style.display = "none";
    setNodeAttrName(initialNodeAttrName);
  }

  // Close the popup and reset all variables
  function closePopup() {
    document.getElementById("popup").style.display = "none";
    setPopupState(initialPopupState);
    setMenuCount(initialMenuCount);
    setError(initialError);
    setColumnSelected(initialColumnSelected);
    setNodeAttrSelection(initialNodeAttrSelection);
    setNodeAttrName(initialNodeAttrName);
    setConfirmButtonLoading(initialConfirmButtonLoading);
    nodeAttrSelectionData = { colors: {}, columnInfo: {} };
    edgeAttrSelectionData = { colors: {}, columnInfo: {} };
    nodeAttrSelectionColor = 0;
    edgeAttrSelectionColor = 0;
    columnData = { date: null, edgeAttr: [], fromId: null, toId: null, nodeAttr: {} };
    errorCount = 0;
    columns = [[], [], {}, {}];
    rowExample = null;
    nodeAttrNameActice = false;
  }

  // Add onclick event for popup clicks
  window.onclick = function (event) {
    if (event.target === document.getElementById("popup")) {
      if (nodeAttrNameActice) {
        setColumnSelected([columnSelected[0], null]);
        nodeAttrNamePopupClose();
      } else {
        closePopup();
      }
    } else if (event.target === document.getElementById("nodeAttrNamePopup")) {
      setColumnSelected([columnSelected[0], null]);
      nodeAttrNamePopupClose();
    }
  }

  // The popup page itself
  function popupPage(popupState, menuCount) {
    const elementsInLine = 5;

    switch (popupState) {
      // file upload popup
      case "fileSubmit":
      case "loading":
        return (
          <>
            <label htmlFor='UploadedFile' className='uploadButton'>Choose file here</label>
            <input type="file" accept=".csv" id="UploadedFile" onChange={() => ShowSubmit()}></input>
            <span className='nameDisplay'>Chosen file's name:<span className='fileName'>{file.name}</span></span>
            {popupState === "fileSubmit" ?
              <>
                <label htmlFor='Submit' id='SubmitBut' className='submitButton'><span>Confirm</span></label>
                <input
                  type="submit"
                  id='Submit'
                  onClick={async () => {
                    setPopupState("loading");
                    rowExample = await postDataSet(file);
                    columns[0] = Object.keys(rowExample);
                    setPopupState("columnSorting")
                  }}
                  className="uploadButton"></input>
              </>
              :
              <label htmlFor='Submit' id='SubmitBut' className='submitButton submitButtonLoading'><span></span></label>
            }
            <label className='testSetText' id='testSet' onClick={async () => {
              await sendOrderedColumns({date: 0, edgeAttr: [8, 7], fromId: 1, nodeAttr: {Email: [2, 5], Jobtitle: [3, 6]} ,toId: 4}, "enron-v1-small.csv");
              setDataSet(await getDataset("enron-v1-small.csv"));
              closePopup();
            }}>Or click here to use a test data set</label>
          </>
        )
      // column specification popup
      case "columnSorting":
        switch (menuCount) {
          // Initial popup screen with some explanation
          case 0:
            return (
              <div className="columnSortingMenu">
                <h1>Specify Column Names</h1>
                <p>To fully be able to use your uploaded dataset, we need you to identify which columns correspond to which attributes of the dataset. In the next few pages you can fill in what column of your dataset corresponds to the prompted attribute. <br></br>Press next to proceed.</p>
                <div className="buttonContainer">
                  <div>
                    <button className="columnSortingButtonEnabled" onClick={() => { setPopupState("fileSubmit") }}>Back</button>
                    <button className="columnSortingButtonEnabled" onClick={() => { setMenuCount(menuCount + 1) }}>Next</button>
                  </div>
                </div>
              </div>
            )
          // Selecting the date column popup screen
          case 1:
            errorMessage = ["Select a column", "This application requires you to fill in a date column, please select a date column"];
            return (
              <div className="columnSortingMenu">
                <h1>Date</h1>
                <p>Select the <b>column</b> which represents the <b>date</b></p>
                <div className="columnSelection">
                  {[...Array(Math.ceil(columns[0].length / elementsInLine)).keys()].map((i) => {
                    return (
                      <div key={i} className="columnSelectionRow">
                        {columns[0].slice(i * 5, i * 5 + 5).map((column) =>
                        (columnSelected === column ?
                          <span
                            key={column}
                            className={"columnSelectionSelected"}
                            style={{ color: textColor(colorScheme[0]), backgroundColor: colorScheme[0], borderColor: colorScheme[0] }}
                            onClick={() => { setColumnSelected(null) }}
                          >
                            {column}
                          </span> :
                          <span
                            key={column}
                            className={"columnSelectionUnselected"}
                            onClick={() => { setColumnSelected(column); if (error === 2) { setError(1) } }}
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
                    <button className="columnSortingButtonEnabled" onClick={() => {
                      setError(0);
                      setMenuCount(menuCount - 1)
                    }}>Back</button>
                    {error > 1 ?
                      <button className="columnSortingButtonDisabled">Next</button> :
                      <button className="columnSortingButtonEnabled" onClick={() => {
                        if (columnSelected) {
                          columns[1] = columns[0].filter(e => e !== columnSelected);
                          setError(0);
                          if (columnData.fromId === columnSelected || columnData.toId === columnSelected) {
                            setColumnSelected([null, null]);
                            columnData.fromId = null;
                            columnData.toId = null;
                          }
                          if (columnData.edgeAttr.includes(columnSelected)) {
                            columnData.edgeAttr = columnData.edgeAttr.filter(e => e !== columnSelected);
                            if (columns[2].columnInfo[columnSelected] < edgeAttrSelectionColor) {
                              edgeAttrSelectionColor = columns[2].columnInfo[columnSelected];
                            }
                            delete edgeAttrSelectionData.colors[columns[2].columnInfo[columnSelected]];
                            delete edgeAttrSelectionData.columnInfo[columnSelected];
                          }
                          for (const [key, value] of Object.entries(columnData.nodeAttr)) {
                            if (value.includes(columnSelected)) {
                              delete columnData.nodeAttr[key];
                              delete nodeAttrSelectionData.colors[nodeAttrSelectionData.columnInfo[value[0]][1]];
                              delete nodeAttrSelectionData.columnInfo[value[0]];
                              delete nodeAttrSelectionData.columnInfo[value[1]];
                            }
                          }
                          columnData["date"] = columnSelected;
                          setColumnSelected([columnData.fromId, columnData.toId]);
                          setMenuCount(menuCount + 1);
                        } else {
                          setError(2);
                          errorCount++;
                        }
                      }}>Next</button>
                    }

                  </div>
                </div>
              </div>
            )
          // Selecting node id popup screen.
          case 2:
            errorMessage = ["The selection was unfinished click next again to proceed but your selection will be lost"];
            return (
              <div className="columnSortingMenu">
                <h1>Node ID</h1>
                {columnSelected[0] === null && columnSelected[1] === null ?
                  <p>Select the <b>column</b> which represents the <b>ID</b> of the <b>sending node</b> <br></br> or click next if there is no node ID</p> :
                  columnSelected[1] === null ?
                    <p>Select the <b>column</b> which represents the <b>ID</b> of the <b>receiving node</b></p> :
                    <p>Click <b>next</b> to proceed or click on the selected column to reset</p>
                }
                <div className="columnSelection">
                  {[...Array(Math.ceil(columns[1].length / elementsInLine)).keys()].map((i) => {
                    return (
                      <div key={i} className="columnSelectionRow">
                        {columns[1].slice(i * 5, i * 5 + 5).map((column) =>
                        (columnSelected.includes(column) ?
                          <span
                            key={column}
                            className="columnSelectionSelected"
                            style={{ color: textColor(colorScheme[0]), backgroundColor: colorScheme[0], borderColor: colorScheme[0] }}
                            onClick={() => {
                              if (columnSelected[0] === column) {
                                setColumnSelected([null, null]);
                              } else {
                                setColumnSelected([columnSelected[0], null]);
                              }
                              if (error === 1) { setError(0); }
                            }}
                          >
                            {column}
                          </span> :
                          (columnSelected.includes(null)) ?
                            <span
                              key={column}
                              className="columnSelectionUnselected"
                              onClick={() => {
                                if (columnSelected[0] === null) {
                                  setColumnSelected([column, null]);
                                } else {
                                  setColumnSelected([columnSelected[0], column]);
                                }
                                if (error === 1) { setError(0); }
                              }}
                            >
                              {column}
                            </span> :
                            <span
                              key={column}
                              className="columnSelectionUnselectedDisabled"
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
                {error === 1 ? <div className="errorMessage"><b>{errorMessage[0]}</b></div> : ""}
                <div className="buttonContainer">
                  <div>
                    <button className="columnSortingButtonEnabled" onClick={() => {
                      columnData.fromId = columnSelected[0];
                      columnData.toId = columnSelected[1];
                      setError(0);
                      setMenuCount(menuCount - 1)
                      setColumnSelected(columnData["date"]);
                    }}>Back</button>
                    <button className="columnSortingButtonEnabled" onClick={() => {
                      if (columnSelected[1] === null && columnSelected[0] !== null && error !== 1) {
                        setError(1);
                      } else if (error === 1) {
                        columnData.fromId = null;
                        columnData.toId = null;
                        columns[2] = {};
                        columns[2].columnInfo = Object.assign({}, ...columns[1].map(e => (
                          { [e]: e in edgeAttrSelectionData.columnInfo ? edgeAttrSelectionData.columnInfo[e] : null }
                        )));
                        columns[2].colors = edgeAttrSelectionData.colors;
                        setColumnSelected(columnData.edgeAttr);
                        setError(0);
                        setColumnSelected(columnData.edgeAttr);
                        setMenuCount(menuCount + 1);
                      } else {

                        setError(0);
                        if (columnData.edgeAttr.includes(columnSelected[0])) {
                          columnData.edgeAttr = columnData.edgeAttr.filter(e => e !== columnSelected[0]);
                        }
                        if (columnData.edgeAttr.includes(columnSelected[1])) {
                          columnData.edgeAttr = columnData.edgeAttr.filter(e => e !== columnSelected[1]);
                        }
                        for (const column of columnSelected) {
                          for (const [key, value] of Object.entries(columnData.nodeAttr)) {
                            if (value.includes(column)) {
                              delete columnData.nodeAttr[key];
                              delete nodeAttrSelectionData.colors[nodeAttrSelectionData.columnInfo[value[0]][1]];
                              delete nodeAttrSelectionData.columnInfo[value[0]];
                              delete nodeAttrSelectionData.columnInfo[value[1]];
                            }
                          }
                        }
                        if (!(columnData.fromId === columnSelected[0]) && nodeAttrSelectionData.columnInfo !== null) {
                          nodeAttrSelectionData.columnInfo[columnData.fromId] = null;
                        }
                        if (!(columnData.toId === columnSelected[1]) && nodeAttrSelectionData.columnInfo !== null) {
                          nodeAttrSelectionData.columnInfo[columnData.toId] = null;
                        }
                        columnData.fromId = columnSelected[0];
                        columnData.toId = columnSelected[1];
                        columns[2].columnInfo = Object.assign({}, ...columns[1].filter(e =>
                          (e !== columnSelected[0] && e !== columnSelected[1])).map(e => (
                            { [e]: e in edgeAttrSelectionData.columnInfo ? edgeAttrSelectionData.columnInfo[e] : null }
                          )));
                        columns[2].colors = edgeAttrSelectionData.colors;
                        setColumnSelected(columnData.edgeAttr);
                        setMenuCount(menuCount + 1);
                      }
                    }}>Next</button>
                  </div>
                </div>
              </div>
            )
          // Selecting the edge attributes columns popup screen
          case 3:
            errorMessage = [];
            return (
              <div className="columnSortingMenu">
                <h1>Edge Attributes</h1>
                <p>Select the <b>columns</b> which represents the <b>edge attributes</b> or click next if there aren't any</p>
                <div className="columnSelection">
                  {[...Array(Math.ceil((Object.keys(columns[2].columnInfo)).length / elementsInLine)).keys()].map((i) => {
                    return (
                      <div key={i} className="columnSelectionRow">
                        {(Object.keys(columns[2].columnInfo)).slice(i * 5, i * 5 + 5).map((column) =>
                        (columns[2].columnInfo[column] !== null ?
                          <span
                            key={column}
                            className="columnSelectionSelected"
                            style={{ color: textColor(colorScheme[columns[2].columnInfo[column]]), backgroundColor: colorScheme[columns[2].columnInfo[column]], borderColor: colorScheme[columns[2].columnInfo[column]] }}
                            onClick={() => {
                              if (columns[2].columnInfo[column] < edgeAttrSelectionColor) {
                                edgeAttrSelectionColor = columns[2].columnInfo[column];
                              }
                              delete columns[2].colors[columns[2].columnInfo[column]];
                              columns[2].columnInfo[column] = null;
                              setColumnSelected(columnSelected.filter(e => e !== column));
                            }}
                          >
                            {column}
                          </span> :
                          <span
                            key={column}
                            className="columnSelectionUnselected"
                            onClick={() => {
                              columns[2].columnInfo[column] = edgeAttrSelectionColor;
                              columns[2].colors[edgeAttrSelectionColor] = column;
                              for (let i = edgeAttrSelectionColor + 1; i < colorScheme.length; i++) {
                                if (!columns[2].colors[i]) {
                                  edgeAttrSelectionColor = i;
                                  break;
                                }
                              }
                              setColumnSelected([...columnSelected, column])
                            }}
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
                <div className="buttonContainer">
                  <div>
                    <button className="columnSortingButtonEnabled" onClick={() => {
                      edgeAttrSelectionData.colors = columns[2].colors;
                      edgeAttrSelectionData.columnInfo = columns[2].columnInfo;
                      columnData["edgeAttr"] = columnSelected;
                      setMenuCount(menuCount - 1)
                      setColumnSelected([columnData.fromId, columnData.toId]);
                    }}>Back</button>
                    <button className="columnSortingButtonEnabled" onClick={() => {
                      columns[3] = {};
                      for (const column of columnSelected) {
                        for (const [key, value] of Object.entries(columnData.nodeAttr)) {
                          if (value.includes(column)) {
                            delete columnData.nodeAttr[key];
                            delete nodeAttrSelectionData.colors[nodeAttrSelectionData.columnInfo[value[0]][1]];
                            delete nodeAttrSelectionData.columnInfo[value[0]];
                            delete nodeAttrSelectionData.columnInfo[value[1]];
                          }
                        }
                      }
                      if (nodeAttrSelectionData.columnInfo !== null) {
                        for (const column of columnData["edgeAttr"]) {
                          if (!(columnSelected.includes(column))) {
                            nodeAttrSelectionData.columnInfo[column] = null;
                          }
                        }
                      }
                      columnData["edgeAttr"] = columnSelected;

                      columns[3].columnInfo = Object.assign({}, ...(Object.keys(columns[2].columnInfo)).filter(e =>
                        (!columnSelected.includes(e))).map(e =>
                          ({ [e]: e in nodeAttrSelectionData.columnInfo ? nodeAttrSelectionData.columnInfo[e] : null })
                        ));
                      columns[3].colors = nodeAttrSelectionData.colors
                      columns[3].nodeAttr = columnData.nodeAttr;
                      setColumnSelected([null, null]);
                      setMenuCount(menuCount + 1);
                    }}>Next</button>
                  </div>
                </div>
              </div>
            )
          // Selecting the node attributes columns popup screen
          case 4:
            errorMessage = ["You have unselected columns left, click next again to proceed but you won't see those columns in the visualisation"];
            return (
              <div className="columnSortingMenu">
                <h1>Node Attributes</h1>
                {
                  !nodeAttrSelection ?
                    <p>Click <b>create node</b> attribute to create a <b>node attribute</b> or click <b>next</b> if there aren't any</p> :
                    columnSelected[0] === null && columnSelected[1] === null ?
                      <p>Select a <b>column</b> which represents a <b>node attribute</b> of a <b>sending node</b></p> :
                      columnSelected[1] === null ?
                        <p>Select the <b>column</b> which represents the <b>node attribute</b> of the <b>receiving node</b></p> :
                        <p></p>
                }
                <div className="createAttrButtonContainer">
                  {nodeAttrSelection ?
                    <button
                      className="createAttrButtonEnabled"
                      onClick={() => {
                        setError(0);
                        setNodeAttrSelection(false);
                        setColumnSelected([null, null]);
                      }}
                    >
                      Exit Node Attribute Creation
                    </button> :
                    <button
                      className="createAttrButtonEnabled"
                      onClick={() => {
                        setError(0);
                        setNodeAttrSelection(true);
                      }}
                    >
                      Create Node Attribute
                    </button>
                  }
                </div>
                <div className="columnSelection">
                  {
                    ([...Array(Math.ceil((Object.keys(columns[3].columnInfo)).length / elementsInLine)).keys()].map((i) => {
                      return (
                        <div key={i} className="columnSelectionRow">
                          {(Object.keys(columns[3].columnInfo)).slice(i * 5, i * 5 + 5).map((column) => {
                            return (nodeAttrSelection ?
                              (columns[3].columnInfo[column] ?
                                <span
                                  key={column}
                                  className="columnSelectionSelected"
                                  style={{ color: textColor(colorScheme[columns[3].columnInfo[column][1]]), backgroundColor: colorScheme[columns[3].columnInfo[column][1]], borderColor: colorScheme[columns[3].columnInfo[column][1]] }}
                                >
                                  {column}
                                </span>
                                :
                                (columnSelected.includes(column) ?
                                  <span
                                    key={column}
                                    className="columnSelectionSelected"
                                    style={{ color: textColor(colorScheme[nodeAttrSelectionColor]), backgroundColor: colorScheme[nodeAttrSelectionColor], borderColor: colorScheme[nodeAttrSelectionColor] }}
                                    onClick={() => {
                                      setError(0);
                                      if (columnSelected[0] === column) {
                                        setColumnSelected([null, null]);
                                      }
                                    }}
                                  >
                                    {column}
                                  </span>
                                  :
                                  <span
                                    key={column}
                                    className="columnSelectionUnselected"
                                    onClick={() => {
                                      setError(0);
                                      if (columnSelected[0] === null) {
                                        setColumnSelected([column, null]);
                                      } else {
                                        setColumnSelected([columnSelected[0], column]);
                                        nodeAttrNamePopupShow();
                                      }
                                    }}
                                  >
                                    {column}
                                  </span>
                                )
                              )
                              :
                              (columns[3].columnInfo[column] ?
                                <span
                                  key={column}
                                  className="columnSelectionSelected"
                                  style={{ color: textColor(colorScheme[columns[3].columnInfo[column][1]]), backgroundColor: colorScheme[columns[3].columnInfo[column][1]], borderColor: colorScheme[columns[3].columnInfo[column][1]] }}
                                  onClick={() => {
                                    let nodeInfo = columns[3].columnInfo[column];
                                    if (nodeInfo[1] < nodeAttrSelectionColor) {
                                      nodeAttrSelectionColor = nodeInfo[1];
                                    }
                                    columns[3].columnInfo[columns[3].nodeAttr[nodeInfo[0]][0]] = null;
                                    columns[3].columnInfo[columns[3].nodeAttr[nodeInfo[0]][1]] = null;
                                    delete columns[3].nodeAttr[nodeInfo[0]];
                                    delete columns[3].colors[nodeInfo[1]];
                                    setError(0);
                                    setColumnSelected([null, null]);
                                  }}
                                >
                                  {column}
                                </span>
                                :
                                <span key={column} className="columnSelectionUnselectedDisabled">
                                  {column}
                                </span>
                              )
                            )
                          }
                          )}
                        </div>
                      )
                    }))
                  }
                </div>
                {error === 1 ? <div className="errorMessage"><b>{errorMessage[0]}</b></div> : ""}
                <div className="buttonContainer">
                  <div>

                    {nodeAttrSelection ?
                      <>
                        <button className="columnSortingButtonDisabled">Back</button>
                        <button className="columnSortingButtonDisabled">Next</button>
                      </>
                      :
                      <>
                        <button className="columnSortingButtonEnabled" onClick={() => {
                          nodeAttrSelectionData.colors = columns[3].colors;
                          nodeAttrSelectionData.columnInfo = columns[3].columnInfo;
                          columnData.nodeAttr = columns[3].nodeAttr;
                          setColumnSelected(columnData.edgeAttr);
                          setError(0);
                          setMenuCount(menuCount - 1);
                        }}>Back</button>
                        <button className="columnSortingButtonEnabled" onClick={() => {
                          if (error === 1) {
                            columnData.nodeAttr = columns[3].nodeAttr;
                            setError(0);
                            setMenuCount(menuCount + 1);
                          } else if (Object.values(columns[3].columnInfo).includes(null)) {
                            setError(1);
                          } else {
                            columnData.nodeAttr = columns[3].nodeAttr;
                            setError(0);
                            setMenuCount(menuCount + 1);
                          }


                        }}>Next</button>
                      </>
                    }

                  </div>
                </div>
              </div>
            )
          // Column selection confirmation popup screen
          case 5:
            return (
              <div className="columnSortingMenu">
                <h1>Well Done :D</h1>
                <p>You're done specifying the columns, here you can see a overview of your choices and after clicking confirm you can start analyzing data</p>
                <div className="columnOverview">
                  <div className="columnOverviewColumn">
                    <h2>Date</h2>
                    <div className="columnOverviewRow">
                      <span
                        style={{ color: textColor(colorScheme[0]), backgroundColor: colorScheme[0], borderColor: colorScheme[0] }}
                      >
                        {columnData.date}
                      </span>
                    </div>
                  </div>
                  {columnData.fromId !== null ?
                    <div className="columnOverviewColumn">
                      <h2>Node ID</h2>
                      <div className="columnOverviewRow">
                        <span
                          style={{ color: textColor(colorScheme[0]), backgroundColor: colorScheme[0], borderColor: colorScheme[0] }}
                        >
                          {columnData.fromId}
                        </span>
                        <span
                          style={{ color: textColor(colorScheme[0]), backgroundColor: colorScheme[0], borderColor: colorScheme[0] }}
                        >
                          {columnData.toId}
                        </span>
                      </div>
                    </div> : ""
                  }
                  {columnData.edgeAttr !== [] ?
                    <div className="columnOverviewColumn">
                      <h2>Edge Attr</h2>
                      {columnData.edgeAttr.map((column) => {
                        let color = columns[2].columnInfo[column];
                        return (<div className="columnOverviewRow">
                          <span
                            style={{ color: textColor(colorScheme[color]), backgroundColor: colorScheme[color], borderColor: colorScheme[color] }}
                          >
                            {column}
                          </span>
                        </div>)
                      })}
                    </div> : ""
                  }
                  {columnData.nodeAttr !== {} ?
                    <div className="columnOverviewColumn">
                      <h2>Node Attr</h2>
                      {Object.keys(columnData.nodeAttr).map((nodeAttr) => {
                        let color = columns[3].columnInfo[columns[3].nodeAttr[nodeAttr][0]][1];
                        return (<div className="columnOverviewRow">
                          <span
                            style={{ color: textColor(colorScheme[color]), backgroundColor: colorScheme[color], borderColor: colorScheme[color] }}
                          >
                            {columnData.nodeAttr[nodeAttr][0]}
                          </span>
                          <span
                            style={{ color: textColor(colorScheme[color]), backgroundColor: colorScheme[color], borderColor: colorScheme[color] }}
                          >
                            {columnData.nodeAttr[nodeAttr][1]}
                          </span>
                        </div>)
                      })}
                    </div> : ""
                  }
                </div>
                <div className="buttonContainer">
                  <div>
                    {!confirmButtonLoading ? <><button className="columnSortingButtonEnabled" onClick={() => {
                      setMenuCount(menuCount - 1);
                    }}>Back</button>
                    <button className="columnSortingButtonEnabled" onClick={async () => {
                      //TODO: Loading icon
                      setConfirmButtonLoading(true);
                      // convert columnData column from values to indexes
                      let newColumnData = {};
                      const columnNames = Object.keys(rowExample);
                      newColumnData.date = columnNames.indexOf(columnData.date);
                      newColumnData.fromId = columnNames.indexOf(columnData.fromId) >= 0 ? columnNames.indexOf(columnData.fromId)  : null;
                      newColumnData.toId = columnNames.indexOf(columnData.toId) >= 0 ? columnNames.indexOf(columnData.toId) : null;
                      newColumnData.edgeAttr = columnData.edgeAttr.map((Attr) => columnNames.indexOf(Attr));
                      let nodeAttr = {}
                      Object.keys(columnData.nodeAttr).map((Attr) => nodeAttr[Attr] = [columnNames.indexOf(columnData["nodeAttr"][Attr][0]), columnNames.indexOf(columnData["nodeAttr"][Attr][1])]);
                      newColumnData.nodeAttr = nodeAttr;

                      // Send columndata and get parsed dataset
                      let time0 = new Date();
                      await sendOrderedColumns(newColumnData, file.name);

                      setDataSet(await getDataset(file.name));
                      let time1 = new Date();
                      console.log("BACKEND TIME PROCESSING STUFF:", time1-time0);
                      closePopup();
                    }}>Confirm</button></>:
                    <><button className="columnSortingButtonDisabled">Back</button>
                    <button className="columnSortingButtonDisabled">Confirm</button></>}
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
        <div id="nodeAttrNamePopup" className="nodeAttrNamePopup">
          <div className="nodeAttrNamePopup-Content">
            <h2>Attribute Name</h2>
            <p id="AttrNameErrorMessage">This name is taken</p>
            <input type="text" name="nodeAttrName" value={nodeAttrName} onChange={(e) => { setNodeAttrName(e.target.value) }} />
            <div className="comfirmButton">
              <button
                onClick={() => {
                  if (Object.keys(columns[3].nodeAttr).includes(nodeAttrName)) {
                    document.getElementById('AttrNameErrorMessage').innerHTML = "This name is taken";
                    document.getElementById('AttrNameErrorMessage').style.visibility = 'visible';
                    setNodeAttrName(initialNodeAttrName);
                  } else if (nodeAttrName === "") {
                    document.getElementById('AttrNameErrorMessage').innerHTML = "Fill in a name";
                    document.getElementById('AttrNameErrorMessage').style.visibility = 'visible';
                    setNodeAttrName(initialNodeAttrName);
                  } else if (nodeAttrName === "id") {
                    document.getElementById('AttrNameErrorMessage').innerHTML = "This name cannot be chosen";
                    document.getElementById('AttrNameErrorMessage').style.visibility = 'visible';
                    setNodeAttrName(initialNodeAttrName);
                  } else {
                    document.getElementById('AttrNameErrorMessage').style.visibility = 'hidden';
                    columns[3].nodeAttr[nodeAttrName] = columnSelected;
                    columns[3].columnInfo[columnSelected[0]] = [nodeAttrName, nodeAttrSelectionColor];
                    columns[3].columnInfo[columnSelected[1]] = [nodeAttrName, nodeAttrSelectionColor];
                    columns[3].colors[nodeAttrSelectionColor] = nodeAttrName;
                    for (let i = nodeAttrSelectionColor + 1; i < colorScheme.length; i++) {
                      if (!columns[3].colors[i]) {
                        nodeAttrSelectionColor = i;
                        break;
                      }
                    }
                    setColumnSelected([null, null]);
                    setNodeAttrName(initialNodeAttrName);
                    setNodeAttrSelection(false);
                    nodeAttrNamePopupClose();
                  }
                }}
              >Confirm</button>
            </div>
          </div>
        </div>
        <span onClick={() => { closePopup() }} className="close">&times;</span>
        {popupPage(popupState, menuCount)}
      </div>
    </div>
  );
}

// Show the popup
export function popupShow() {
  let box = document.getElementById('popup');
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


