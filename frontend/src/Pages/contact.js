import React from 'react';
import "../Css/contact.css";
import grouppicture from "../Images/grouppicture.jpg";



class Contact extends React.Component {
    componentDidMount() {
        this.props.update()
    }
    
    render() {    
        return (
            <div> 
             <div class="contactHeader">
                <h1>Contact</h1>
            </div>
                <div className = 'contactInfo'><p>If you would like to contact us, you are at the right page. Welcome and well done! </p> <p>
                </p></div>
                <div className = 'ourTeam'><h1>Our Team </h1><p>We, <b>The Amazing DBL-Team</b> consist of <b>Ching Chou, Lieke Franken, Jelmer Lap, Tom Lodder, Maria Pan and Charlie Rijvers</b>. Six students from the TU/e of which there are four first-year Computer Science students and two second-year Psychology & Technology students.</p>
                <p><div class="group"> <img src={grouppicture} alt="team"></img> </div></p></div>
                <div className = 'sendMail'><h1>Send Mail</h1><p>Feel free to contact us via: <b>TheAmazingDblTeam@gmail.com</b> (also for our side project involving a bow, cause yeah why not)</p></div>
            </div>
            );
    }    
}

export default Contact;