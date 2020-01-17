import React, { Component } from "react";
import Select from "react-select";
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css";
import { Form, Row, Col, Button, ButtonGroup, Spinner } from "react-bootstrap";

class FormContainerz extends Component {
  constructor(props) {
    super(props);

    this.state = {
      payload: {
        columns: [],
        rows: [],
        columnTypes: [],
        rowTypes: [],
        dependencies: [],
        showHeader: "",
        linksOnly: false
      },

      parentFolderOptions: [],
      dependencyOptions: [],
      artifactTypes: [],
      columnSelected: [],
      rowSelected: [],
      dependencySelected: "",
      rowArtifactTypeSelected: "",
      columnArtifactTypeSelected: "",
      linksOnlySelected: false,
      projectURI: "",
      validCookie: true,
      isLoading: true
    };
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleColumnFolders = this.handleColumnFolders.bind(this);
    this.handleRowFolders = this.handleRowFolders.bind(this);
    this.handleDependencies = this.handleDependencies.bind(this);
    this.handleColumnTypes = this.handleColumnTypes.bind(this);
    this.handleRowTypes = this.handleRowTypes.bind(this);
    this.toggleLinksOnly = this.toggleLinksOnly.bind(this);
  }

  render() {
    const {
      parentFolderOptions,
      dependencies,
      artifactTypes,
      columnSelected,
      rowSelected,
      dependencySelected,
      columnArtifactTypeSelected,
      rowArtifactTypeSelected,
      linksOnlySelected,
      validCookie,
      isLoading
    } = this.state;
    return (
      <div style={{ margin: "20px" }}>
        <Form>
          <Row>
            <Col>
              <Form.Label>Column Folders</Form.Label>
              <MultiSelect
                items={parentFolderOptions}
                onChange={this.handleColumnFolders}
                selectedItems={columnSelected}
              />
            </Col>
            <Col>
              <Form.Label>Row Folders</Form.Label>
              <MultiSelect
                items={parentFolderOptions}
                onChange={this.handleRowFolders}
                selectedItems={rowSelected}
              />
            </Col>
            <Col>
              <Form.Label> </Form.Label>
              <Form.Group>
                <Select
                  options={dependencies}
                  value={dependencySelected}
                  onChange={this.handleDependencies}
                  placeholder="Link Types"
                  isMulti
                />
              </Form.Group>
              <Form.Group>
                <Select
                  options={artifactTypes}
                  value={columnArtifactTypeSelected}
                  onChange={this.handleColumnTypes}
                  placeholder="Column Requirement Type"
                  isMulti
                />
              </Form.Group>
              <Form.Group>
                <Select
                  options={artifactTypes}
                  value={rowArtifactTypeSelected}
                  onChange={this.handleRowTypes}
                  placeholder="Row Requirement Type"
                  isMulti
                />
              </Form.Group>
              <Form.Group>
                <Form.Check
                  type="switch"
                  id="links-only-switch"
                  label="Display Links Only"
                  onChange={this.toggleLinksOnly}
                  checked={linksOnlySelected}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={{ span: 6 }}>
              <Button variant="success" onClick={this.handleFormSubmit} block>
                Submit
              </Button>
            </Col>

            <Col md={{ span: 6 }}>
              <Button variant="danger" onClick={this.handleClearForm} block>
                Clear Selected
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

export default FormContainerz;
