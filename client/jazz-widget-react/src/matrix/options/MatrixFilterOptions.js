import React, { Component } from "react";
import Select from "react-select";
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css";
import { Form, Row, Col, Button } from "react-bootstrap";

class MatrixFilterOptions extends Component {
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
      validCookie: true
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

  componentDidMount() {
    var result = this.props.payload;
    var fields = this.props.fields;
    this.setState({
      payload: result.payload,
      columnSelected: result.formattedPayload.columns,
      rowSelected: result.formattedPayload.rows,
      dependencySelected: result.formattedPayload.dependencies,
      rowArtifactTypeSelected: result.formattedPayload.rowTypes,
      columnArtifactTypeSelected: result.formattedPayload.columnTypes,
      linksOnlySelected: result.formattedPayload.linksOnly,
      parentFolderOptions: fields.parentFolders,
      dependencies: fields.linkTypes,
      artifactTypes: fields.artifactTypes
    });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    let data = {
      projectAreaURI: this.props.payload.projectURI,
      payload: this.state.payload
    };
    var url = process.env.REACT_APP_SERVER_URL + "/server/storePayload/";
    fetch(url, {
      method: "POST",
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(result => {
        this.props.reload(result.uniqueID);
      });
  }

  handleClearForm(e) {
    e.preventDefault();
    this.setState({
      payload: {
        columns: [],
        rows: [],
        columnTypes: [],
        rowTypes: [],
        dependencies: [],
        showHeader: "",
        linksOnly: false
      },

      columnSelected: [],
      rowSelected: [],
      dependencySelected: "",
      rowArtifactTypeSelected: "",
      columnArtifactTypeSelected: "",
      linksOnlySelected: false
    });
  }

  handleColumnFolders(data) {
    const name = "columns";
    var temp = data.map(item => ({ name: item.label }));
    var tempId = data.map(item => item);

    this.setState(prevState => ({
      columnSelected: tempId,
      payload: {
        ...prevState.payload,
        [name]: temp
      }
    }));
  }

  handleRowFolders(data) {
    const name = "rows";
    var temp = data.map(item => ({ name: item.label }));
    var tempId = data.map(item => item);

    this.setState(prevState => ({
      rowSelected: tempId,
      payload: {
        ...prevState.payload,
        [name]: temp
      }
    }));
  }

  handleDependencies(data) {
    const name = "dependencies";
    var temp = data.map(item => ({ name: item.label }));
    this.setState(prevState => ({
      dependencySelected: data,
      payload: {
        ...prevState.payload,
        [name]: temp
      }
    }));
  }

  handleColumnTypes(data) {
    const name = "columnTypes";
    var temp = data.map(item => ({ name: item.label }));
    this.setState(prevState => ({
      columnArtifactTypeSelected: data,
      payload: {
        ...prevState.payload,
        [name]: temp
      }
    }));
  }

  handleRowTypes(data) {
    const name = "rowTypes";
    var temp = data.map(item => ({ name: item.label }));
    this.setState(prevState => ({
      rowArtifactTypeSelected: data,
      payload: {
        ...prevState.payload,
        [name]: temp
      }
    }));
  }

  toggleLinksOnly() {
    const name = "linksOnly";
    this.setState(prevState => ({
      linksOnlySelected: !this.state.linksOnlySelected,
      payload: {
        ...prevState.payload,
        [name]: !this.state.payload.linksOnly
      }
    }));
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
      validCookie
    } = this.state;
    return (
      <div style={{ margin: "20px" }}>
        {validCookie && (
          <Form>
            <Row>
              <Col>
                <Form.Label>Column Folders</Form.Label>
                <MultiSelect
                  items={parentFolderOptions.map(item => ({
                    label: item.label,
                    id: "col" + item.id
                  }))}
                  onChange={this.handleColumnFolders}
                  selectedItems={columnSelected}
                  generateRandom={this.generateRandom}
                />
              </Col>
              <Col>
                <Form.Label>Row Folders</Form.Label>
                <MultiSelect
                  items={parentFolderOptions.map(item => ({
                    label: item.label,
                    id: "row" + item.id
                  }))}
                  onChange={this.handleRowFolders}
                  selectedItems={rowSelected}
                  generateRandom={this.generateRandom}
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
                    isClearable={true}
                  />
                </Form.Group>
                <Form.Group>
                  <Select
                    options={artifactTypes}
                    value={columnArtifactTypeSelected}
                    onChange={this.handleColumnTypes}
                    placeholder="Column Requirement Type"
                    isMulti
                    isClearable={true}
                  />
                </Form.Group>
                <Form.Group>
                  <Select
                    options={artifactTypes}
                    value={rowArtifactTypeSelected}
                    onChange={this.handleRowTypes}
                    placeholder="Row Requirement Type"
                    isMulti
                    isClearable={true}
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
        )}
      </div>
    );
  }
}

export default MatrixFilterOptions;
