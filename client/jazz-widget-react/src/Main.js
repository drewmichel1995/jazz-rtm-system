import React, { Component } from "react";
import { Route, HashRouter } from "react-router-dom";
import Matrix from "./matrix/Matrix";
import Thpace from "../node_modules/thpace/thpace.min.js";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Jazz Requirements Matrix",
      uri: "xxxxxx",
      uniqueID: "xxxxxx"
    };

    this.onTitleChange = this.onTitleChange.bind(this);
    this.setBackground = this.setBackground.bind(this);
  }

  componentDidMount() {
    this.setBackground();
  }

  onTitleChange = (title, uri, uniqueID) => {
    this.setState({ title: title, uri: uri, uniqueID: uniqueID });
    window.history.pushState({}, null, "/#/matrix/" + uniqueID);
  };

  setBackground = () => {
    const canvas = document.getElementById("background");

    const settings = {
      color1: "#43C6AC",
      color2: "#191654"
    };

    Thpace.create(canvas, settings);
  };

  render() {
    return (
      <HashRouter>
        <div>
          <div id="bg">
            <canvas id="background"></canvas>
          </div>

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
