import React, { Component } from "react";
import { Route, NavLink, HashRouter } from "react-router-dom";
import RequirementsView from "./RequirementsView";
import AnalyticsView from "./components/AnalyticsView";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Jazz Requirements Matrix",
      uri: "xxxxxx",
      uniqueID: "xxxxxx"
    };

    this.onTitleChange = this.onTitleChange.bind(this);
  }

  onTitleChange = (title, uri, uniqueID) => {
    this.setState({ title: title, uri: uri, uniqueID: uniqueID });
  };

  render() {
    return (
      <HashRouter>
        <div>
          <h1>{this.state.title}</h1>
          <ul className="header">
            <li>
              <NavLink exact to={`/RequirementsView/${this.state.uniqueID}`}>
                Traceability Matrix
              </NavLink>
              <NavLink exact to={`/AnalyticsView/${this.state.uri}`}>
                Project Overview
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
              path="/AnalyticsView/:projectURI"
              render={props => <AnalyticsView {...props} />}
            />
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;
