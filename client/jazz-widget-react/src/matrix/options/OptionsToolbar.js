import React, { useState } from "react";
import MatrixFilterOptions from "./MatrixFilterOptions";
import SearchFormContainer from "./SearchFilterOptions";
import { Nav, Navbar, Row, Collapse } from "react-bootstrap";

export default function OptionsToolbar(props) {
  const [showSearch, setSearch] = useState(false);
  const [showMatrix, setMatrix] = useState(false);
  const [searchText, setSearchText] = useState("Search Options");
  const [matrixText, setMatrixText] = useState("Filter Options");

  function onSearchChange() {
    setSearch(!showSearch);
    showSearch
      ? setSearchText("Search Options")
      : setSearchText("Hide Search Options");
  }

  function onMatrixChange() {
    setMatrix(!showMatrix);
    showMatrix
      ? setMatrixText("Filter Options")
      : setMatrixText("Hide Filter Options");
  }

  function toggleShow() {
    setMatrix(false);
    setSearch(false);
    setSearchText("Search Options");
    setMatrixText("Filter Options");
  }

  const {
    onRowChange,
    onColumnChange,
    triggerShowID,
    showID,
    payload,
    fields,
    reload,
    projectName
  } = props;

  return (
    <div className="nav-bar">
      <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
        <Navbar.Brand className="brand">{projectName}</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />

        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link
              onClick={onMatrixChange}
              aria-controls="options"
              aria-expanded={showMatrix}
            >
              {matrixText}
            </Nav.Link>
            <Nav.Link
              onClick={onSearchChange}
              aria-controls="options"
              aria-expanded={showSearch}
            >
              {searchText}
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Collapse in={showMatrix || showSearch}>
        <div id="options" className="options">
          {showMatrix && (
            <MatrixFilterOptions
              fields={fields}
              payload={payload}
              reload={reload}
            />
          )}
          {showSearch && (
            <SearchFormContainer
              onRowChange={onRowChange}
              onColumnChange={onColumnChange}
              triggerShowID={triggerShowID}
              showID={showID}
            />
          )}
          {(showSearch || showMatrix) && (
            <Row className="justify-content-center">
              <i className="arrow up point" onClick={toggleShow}></i>
            </Row>
          )}
        </div>
      </Collapse>
    </div>
  );
}
