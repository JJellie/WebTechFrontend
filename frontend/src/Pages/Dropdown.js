import React from "react";
import '../Css/DropdownStyles.css'

export function Dropdown(props){
    return(
        <form class = "DropdownWrapper" action = {props.action} onChange = {props.onChange}>
            <label class = "StyledLabel" htmlFor = "decide label">
                {props.formLabel}
            </label>
            <select class = "StyledSelect" id = "services" name = "services">
                {props.children}
            </select>
        </form>
        

    );
}

export function DropdownOption(props){
    return(
        <option class = "StyledOption" selected = {props.selected}>
            {props.value}
        </option>
    );
}