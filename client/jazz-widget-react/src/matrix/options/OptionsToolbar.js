import React, { Component } from "react";
import MatrixFilterOptions from "./MatrixFilterOptions";
import SearchFormContainer from "./SearchFilterOptions";
import { Button, ButtonGroup } from "react-bootstrap";
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
      showID,
      triggerShowID,
      onTitleChange,
      payload,
      fields,
      reload
    } = this.props;
    return (
      <div style={{ marginBottom: "20px", marginTop: "0px" }}>
        <ButtonGroup aria-label="Basic example">
          <Button
            variant={this.state.matrixVariant}
            onClick={this.onMatrixChange}
          >
            {this.state.matrixText}
          </Button>
          <Button
            variant={this.state.searchVariant}
            onClick={this.onSearchChange}
          >
            {this.state.searchText}
          </Button>
        </ButtonGroup>
        <div>
          {this.state.showMatrix && (
            <FadeIn>
              <MatrixFilterOptions
                tableRows={payload.rows}
                tableColumns={payload.columns}
                projectURI={payload.projectURI}
                onTitleChange={onTitleChange}
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
                showID={showID}
                triggerShowID={triggerShowID}
              />
            </FadeIn>
          )}
        </div>
      </div>
    );
  }
}
export default OptionsToolbar;
