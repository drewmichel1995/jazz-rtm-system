import React, { Component } from "react";
import { Route, NavLink, HashRouter } from "react-router-dom";
import Matrix from "./matrix/Matrix";
import Overview from "./overview/Overview";

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
    window.history.pushState({}, null, "/#/matrix/" + uniqueID);
  };

  render() {
    return (
      <HashRouter>
        <div>
          <div className="content">
            <Route
              exact
              path="/"
              render={props => (
                <Matrix {...props} onTitleChange={this.onTitleChange} />
              )}
            />

            <Route
              exact
              path="/matrix"
              render={props => (
                <Matrix {...props} onTitleChange={this.onTitleChange} />
              )}
            />
            <Route
              exact
              path="/matrix/:uniqueID"
              render={props => (
                <Matrix {...props} onTitleChange={this.onTitleChange} />
              )}
            />
          </div>
        </div>
      </HashRouter>
    );
  }
}

export default Main;
