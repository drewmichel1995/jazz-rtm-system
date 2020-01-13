import React, { Component } from "react";
import {
    Route,
    NavLink,
    HashRouter
  } from "react-router-dom";
import RequirementsView from "./RequirementsView";
  
class Main extends Component {

  state: { language: '' }

  constructor(props){
    super(props);
    this.state = {
      title: "Jazz Requirements Matrix"

    };

    this.onTitleChange = this.onTitleChange.bind(this);
  }

  onTitleChange = (title) => {
    this.setState({title: title});
  }

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
            <Route exact path="/RequirementsView/:uniqueID" render={(props) => <RequirementsView {...props} onTitleChange={this.onTitleChange}/>}/>
          </div>
        </div>
        </HashRouter>
    );
  }
}
 
export default Main;