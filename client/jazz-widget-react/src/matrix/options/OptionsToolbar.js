import React, { Component } from "react";
import MatrixFilterOptions from "./MatrixFilterOptions";
import SearchFormContainer from "./SearchFilterOptions";
import { Container, Nav, Navbar } from "react-bootstrap";
import FadeIn from "react-fade-in";

class OptionsToolbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSearch: false,
      showMatrix: false,
      searchText: "Show Search Options",
      matrixText: "Show Filter Options",
      searchVariant: "secondary",
      matrixVariant: "primary"
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onMatrixChange = this.onMatrixChange.bind(this);
  }

  onSearchChange = () => {
    this.setState({ showSearch: !this.state.showSearch });
    this.state.showSearch
      ? this.setState({
          searchText: "Show Search Options",
          searchVariant: "secondary"
        })
      : this.setState({
          searchText: "Hide Search Options",
          searchVariant: "link"
        });
  };

  onMatrixChange = () => {
    this.setState({ showMatrix: !this.state.showMatrix });
    this.state.showMatrix
      ? this.setState({
          matrixText: "Show Filter Options",
          matrixVariant: "primary"
        })
      : this.setState({
          matrixText: "Hide Filter Options",
          matrixVariant: "link"
        });
  };

  render() {
    const {
      onRowChange,
      onColumnChange,
      triggerShowID,
      showID,
      payload,
      fields,
      reload,
      projectName
    } = this.props;
    return (
      <div>
        <Navbar variant="dark">
          <Navbar.Brand>{projectName}</Navbar.Brand>
          <Nav>
            <Nav.Link onClick={this.onMatrixChange}>
              {this.state.matrixText}
            </Nav.Link>
            <Nav.Link onClick={this.onSearchChange}>
              {this.state.searchText}
            </Nav.Link>
          </Nav>
        </Navbar>
        <div>
          {this.state.showMatrix && (
            <FadeIn>
              <MatrixFilterOptions
                fields={fields}
                payload={payload}
                reload={reload}
              />
            </FadeIn>
          )}
          {this.state.showSearch && (
            <FadeIn>
              <SearchFormContainer
                onRowChange={onRowChange}
                onColumnChange={onColumnChange}
                triggerShowID={triggerShowID}
                showID={showID}
              />
            </FadeIn>
          )}
        </div>
      </div>
    );
  }
}
export default OptionsToolbar;
