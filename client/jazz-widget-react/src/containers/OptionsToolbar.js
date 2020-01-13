import React, { Component } from "react";
import FormContainer from "./FormContainer";
import SearchFormContainer from "./SearchFormContainer";
import { Button, ButtonGroup } from "react-bootstrap";

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
      rowSearchTerm,
      columnSearchTerm,
      onRowChange,
      onColumnChange,
      showID,
      triggerShowID,
      tableRows,
      tableColumns,
      setTable,
      toggleLoading,
      serverURL,
      projectURI,
      uniqueID
    } = this.props;
    return (
      <div style={{ margin: "20px" }}>
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
            <FormContainer
              tableRows={tableRows}
              tableColumns={tableColumns}
              setTable={setTable}
              toggleLoading={toggleLoading}
              serverURL={serverURL}
              projectURI={projectURI}
              uniqueID={uniqueID}
            />
          )}
          {this.state.showSearch && (
            <SearchFormContainer
              rowSearchTerm={rowSearchTerm}
              columnSearchTerm={columnSearchTerm}
              onRowChange={onRowChange}
              onColumnChange={onColumnChange}
              rowPlaceholder="Search Row Requirements"
              columnPlaceholder="Search Column Requirements"
              showID={showID}
              triggerShowID={triggerShowID}
            />
          )}
        </div>
      </div>
    );
  }
}
export default OptionsToolbar;
