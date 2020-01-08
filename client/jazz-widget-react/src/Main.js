import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter
  } from "react-router-dom";
import RequirementsView from "./RequirementsView";
  
class Main extends Component {
  render() {
    return (
        
        <HashRouter>
        <div>
          <h1>Jazz Requirements Matrix</h1>
          <ul className="header">
            <li><NavLink exact to="/">Traceability Matrix</NavLink></li>
          </ul>
          <div className="content">
            <Route exact path="/" component={RequirementsView}/>
            <Route exact path="/RequirementsView" component={RequirementsView}/>
            <Route exact path="/RequirementsView/:uniqueID" component={RequirementsView}/>
          </div>
        </div>
        </HashRouter>
    );
  }
}
 
export default Main;