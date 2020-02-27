import React, { useState } from "react";
import MatrixFilterOptions from "./MatrixFilterOptions";
import SearchFormContainer from "./SearchFilterOptions";
import { Nav, Navbar, Row, Collapse } from "react-bootstrap";
import FadeIn from "react-fade-in";

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
            <Nav.Link onClick={onMatrixChange}>{matrixText}</Nav.Link>
            <Nav.Link onClick={onSearchChange}>{searchText}</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Collapse in={showMatrix || showSearch}>
        <div className="options">
          {showMatrix && (
            <FadeIn>
              <MatrixFilterOptions
                fields={fields}
                payload={payload}
                reload={reload}
              />
            </FadeIn>
          )}
          {showSearch && (
            <FadeIn>
              <SearchFormContainer
                onRowChange={onRowChange}
                onColumnChange={onColumnChange}
                triggerShowID={triggerShowID}
                showID={showID}
              />
            </FadeIn>
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
