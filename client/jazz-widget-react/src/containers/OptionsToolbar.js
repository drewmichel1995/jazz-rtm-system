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
      matrixText: "Show Filter Options"
    };

    this.onSearchChange = this.onSearchChange.bind(this);
    this.onMatrixChange = this.onMatrixChange.bind(this);
  }

  onSearchChange = () => {
    this.setState({ showSearch: !this.state.showSearch });
    this.state.showSearch
      ? this.setState({ searchText: "Hide Search Options" })
      : this.setState({ searchText: "Show Search Options" });
  };

  onMatrixChange = () => {
    this.setState({ showMatrix: !this.state.showMatrix });
    this.state.showMatrix
      ? this.setState({ matrixText: "Hide Filter Options" })
      : this.setState({ matrixText: "Show Filter Options" });
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
      <div>
        <ButtonGroup aria-label="Basic example">
          <Button variant="secondary" onClick={this.onMatrixChange}>
            {this.state.matrixText}
          </Button>
          <Button variant="secondary" onClick={this.onSearchChange}>
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
