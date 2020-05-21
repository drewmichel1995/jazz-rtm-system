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
        modules: [],
        showHeader: "",
        linksOnly: false,
      },
      fields: {},
      showModules: true,
      containerText: "Parent Folders",
      parentFolderOptions: [],
      dependencyOptions: [],
      artifactTypes: [],
      columnSelected: [],
      rowSelected: [],
      dependencySelected: "",
      rowArtifactTypeSelected: "",
      columnArtifactTypeSelected: "",
      linksOnlySelected: false,
      validCookie: true,
    };
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleClearForm = this.handleClearForm.bind(this);
    this.handleColumnFolders = this.handleColumnFolders.bind(this);
    this.handleRowFolders = this.handleRowFolders.bind(this);
    this.handleDependencies = this.handleDependencies.bind(this);
    this.handleColumnTypes = this.handleColumnTypes.bind(this);
    this.handleRowTypes = this.handleRowTypes.bind(this);
    this.toggleLinksOnly = this.toggleLinksOnly.bind(this);
    this.toggleShowModule = this.toggleShowModule.bind(this);
  }

  componentDidMount() {
    var result = this.props.payload;
    var propFields = this.props.fields;
    if (result.payload.showModules) {
      this.setState({
        fields: propFields,
        payload: result.payload,
        columnSelected: result.formattedPayload.columns,
        rowSelected: result.formattedPayload.rows,
        dependencySelected: result.formattedPayload.dependencies,
        rowArtifactTypeSelected: result.formattedPayload.rowTypes,
        columnArtifactTypeSelected: result.formattedPayload.columnTypes,
        linksOnlySelected: result.formattedPayload.linksOnly,
        parentFolderOptions: propFields.modules.names,
        dependencies: propFields.modules.linkTypes,
        artifactTypes: propFields.modules.artifactTypes,
        showModules: result.payload.showModules,
      });
    } else {
      this.setState({
        fields: propFields,
        payload: result.payload,
        columnSelected: result.formattedPayload.columns,
        rowSelected: result.formattedPayload.rows,
        dependencySelected: result.formattedPayload.dependencies,
        rowArtifactTypeSelected: result.formattedPayload.rowTypes,
        columnArtifactTypeSelected: result.formattedPayload.columnTypes,
        linksOnlySelected: result.formattedPayload.linksOnly,
        parentFolderOptions: propFields.parentFolders,
        dependencies: propFields.linkTypes,
        artifactTypes: propFields.artifactTypes,
        showModules: result.payload.showModules,
      });
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    let data = {
      projectAreaURI: this.props.payload.projectURI,
      payload: this.state.payload,
    };

    console.log(JSON.stringify(data));
    var url = "/server/storePayload/";
    fetch(url, {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((result) => {
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
        linksOnly: false,
        module: {
          columns: [],
          row: [],
          columnTypes: [],
          rowTypes: [],
          dependencies: [],
        },
      },

      columnSelected: [],
      rowSelected: [],
      dependencySelected: "",
      rowArtifactTypeSelected: "",
      columnArtifactTypeSelected: "",
      linksOnlySelected: false,
    });
  }

  handleColumnFolders(data) {
    const name = "columns";
    var temp;
    var tempId;
    if (data) {
      var temp = data.map((item) => ({ name: item.label }));
      var tempId = data.map((item) => item);
    } else {
      temp = [];
      tempId = [];
    }
    if (this.state.showModules) {
      this.setState((prevState) => ({
        columnSelected: tempId,
        payload: {
          ...prevState.payload,
          showModule: true,
          module: {
            ...prevState.payload.module,
            [name]: temp,
          },
        },
      }));
    } else {
      this.setState((prevState) => ({
        columnSelected: tempId,
        payload: {
          ...prevState.payload,
          [name]: temp,
        },
      }));
    }
  }

  handleRowFolders(data) {
    const name = "rows";
    var temp;
    var tempId;
    if (data) {
      var temp = data.map((item) => ({ name: item.label }));
      var tempId = data.map((item) => item);
    } else {
      temp = [];
      tempId = [];
    }

    if (this.state.showModules) {
      this.setState((prevState) => ({
        rowSelected: tempId,
        payload: {
          ...prevState.payload,
          module: {
            ...prevState.payload.module,
            [name]: temp,
          },
        },
      }));
    } else {
      this.setState((prevState) => ({
        rowSelected: tempId,
        payload: {
          ...prevState.payload,
          [name]: temp,
        },
      }));
    }
  }

  handleDependencies(data) {
    const name = "dependencies";
    var temp;
    if (data) {
      temp = data.map((item) => ({ name: item.label }));
    } else {
      temp = [];
    }

    if (this.state.showModules) {
      this.setState((prevState) => ({
        dependencySelected: data,
        payload: {
          ...prevState.payload,
          module: {
            ...prevState.payload.module,
            ["linkTypes"]: temp,
          },
        },
      }));
    } else {
      this.setState((prevState) => ({
        dependencySelected: data,
        payload: {
          ...prevState.payload,
          [name]: temp,
        },
      }));
    }
  }

  handleColumnTypes(data) {
    const name = "columnTypes";
    var temp;
    if (data) {
      temp = data.map((item) => ({ name: item.label }));
    } else {
      temp = [];
    }

    if (this.state.showModules) {
      this.setState((prevState) => ({
        columnArtifactTypeSelected: data,
        payload: {
          ...prevState.payload,
          module: {
            ...prevState.payload.module,
            [name]: temp,
          },
        },
      }));
    } else {
      this.setState((prevState) => ({
        columnArtifactTypeSelected: data,
        payload: {
          ...prevState.payload,
          [name]: temp,
        },
      }));
    }
  }

  handleRowTypes(data) {
    const name = "rowTypes";
    var temp;
    if (data) {
      temp = data.map((item) => ({ name: item.label }));
    } else {
      temp = [];
    }

    if (this.state.showModules) {
      this.setState((prevState) => ({
        rowArtifactTypeSelected: data,
        payload: {
          ...prevState.payload,
          module: {
            ...prevState.payload.module,
            [name]: temp,
          },
        },
      }));
    } else {
      this.setState((prevState) => ({
        rowArtifactTypeSelected: data,
        payload: {
          ...prevState.payload,
          [name]: temp,
        },
      }));
    }
  }

  toggleLinksOnly() {
    const name = "linksOnly";
    this.setState((prevState) => ({
      linksOnlySelected: !this.state.linksOnlySelected,
      payload: {
        ...prevState.payload,
        [name]: !this.state.payload.linksOnly,
      },
    }));
  }

  toggleShowModule() {
    const name = "showModules";
    console.log(!this.state.showModules);
    if (!this.state.showModules) {
      this.setState((prevState) => ({
        showModules: !this.state.showModules,
        rowSelected: [],
        columnSelected: [],
        rowArtifactTypeSelected: [],
        columnArtifactTypeSelected: [],
        dependencySelected: [],
        parentFolderOptions: this.state.fields.modules.names,
        artifactTypes: this.state.fields.modules.artifactTypes,
        dependencyOptions: this.state.fields.modules.linkTypes,
        payload: {
          ...prevState.payload,
          [name]: !this.state.payload.showModules,
        },
      }));
    } else {
      this.setState((prevState) => ({
        showModules: !this.state.showModules,
        rowSelected: [],
        columnSelected: [],
        rowArtifactTypeSelected: [],
        columnArtifactTypeSelected: [],
        dependencySelected: [],
        parentFolderOptions: this.state.fields.parentFolders,
        artifactTypes: this.state.fields.artifactTypes,
        dependencyOptions: this.state.fields.linkTypes,
        payload: {
          ...prevState.payload,
          [name]: !this.state.payload.showModules,
        },
      }));
    }
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
      showModules,
    } = this.state;
    return (
      <div style={{ margin: "20px" }}>
        {validCookie && (
          <Form>
            <Row className="matrix-options-row">
              <Col sm={4}>
                <Form.Label className="form-text">
                  {showModules ? "Column Modules" : "Column Folders"}
                </Form.Label>
                <MultiSelect
                  items={parentFolderOptions.map((item) => ({
                    label: item.label,
                    id: "col" + item.id,
                  }))}
                  onChange={this.handleColumnFolders}
                  selectedItems={columnSelected}
                  generateRandom={this.generateRandom}
                  showSelectedItems={false}
                />
              </Col>
              <Col sm={4}>
                <Form.Label className="form-text">
                  {showModules ? "Row Modules" : "Row Folders"}
                </Form.Label>
                <MultiSelect
                  items={parentFolderOptions.map((item) => ({
                    label: item.label,
                    id: "row" + item.id,
                  }))}
                  onChange={this.handleRowFolders}
                  selectedItems={rowSelected}
                  generateRandom={this.generateRandom}
                  showSelectedItems={false}
                />
              </Col>
              <Col>
                <Form.Group>
                  <Col className="point">
                    <Form.Check
                      type="switch"
                      id="show-module-switch"
                      label="Module Artifacts"
                      onChange={this.toggleShowModule}
                      checked={showModules}
                      className="form-text"
                    />
                  </Col>
                  <Col className="point">
                    <Form.Check
                      type="switch"
                      id="links-only-switch"
                      label="Links Only"
                      onChange={this.toggleLinksOnly}
                      checked={linksOnlySelected}
                      className="form-text"
                    />
                  </Col>
                </Form.Group>
                <Form.Group>
                  <Select
                    options={dependencies}
                    value={dependencySelected}
                    onChange={this.handleDependencies}
                    placeholder="Link Types"
                    isMulti
                    isClearable={true}
                    className="point"
                  />
                </Form.Group>
                <Form.Group>
                  <Select
                    options={artifactTypes}
                    value={columnArtifactTypeSelected}
                    onChange={this.handleColumnTypes}
                    placeholder="Column Type"
                    isMulti
                    isClearable={true}
                    className="point"
                  />
                </Form.Group>
                <Form.Group>
                  <Select
                    options={artifactTypes}
                    value={rowArtifactTypeSelected}
                    onChange={this.handleRowTypes}
                    placeholder="Row Type"
                    isMulti
                    isClearable={true}
                    className="point"
                  />
                </Form.Group>

                <Row className="button-row">
                  <Col>
                    <Button
                      variant="success"
                      onClick={this.handleFormSubmit}
                      block
                    >
                      Submit
                    </Button>
                  </Col>
                  <Col>
                    <Button
                      variant="danger"
                      onClick={this.handleClearForm}
                      block
                    >
                      Clear
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}

export default MatrixFilterOptions;
