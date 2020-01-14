import React, { Component } from "react";
import { Route, NavLink, HashRouter } from "react-router-dom";
import RequirementsView from "./RequirementsView";
import AnalyticsView from "./components/AnalyticsView";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Jazz Requirements Matrix",
      uri: "xxxxxx"
    };

    this.onTitleChange = this.onTitleChange.bind(this);
  }

  onTitleChange = (title, uri) => {
    this.setState({ title: title, uri: uri });
  };

  render() {
    return (
      <HashRouter>
        <div>
          <h1>{this.state.title}</h1>
          <ul className="header">
            <li>
              <NavLink exact to="/">
                Traceability Matrix
              </NavLink>
              <NavLink exact to="/AnalyticsView">
                Project Analytics
              </NavLink>
            </li>
          </ul>
          <div className="content">
            <Route
              exact
              path="/"
              render={props => (
                <RequirementsView
                  {...props}
                  onTitleChange={this.onTitleChange}
                />
              )}
            />
            <Route
              exact
              path="/RequirementsView"
              render={props => (
                <RequirementsView
                  {...props}
                  onTitleChange={this.onTitleChange}
                />
              )}
            />
            <Route
              exact
              path="/RequirementsView/:uniqueID"
              render={props => (
                <RequirementsView
                  {...props}
                  onTitleChange={this.onTitleChange}
                />
              )}
            />
            <Route
              exact
              path="/AnalyticsView"
              render={props => (
                <AnalyticsView {...props} projectURI={this.state.uri} />
              )}
            />
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;
