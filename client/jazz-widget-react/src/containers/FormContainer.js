import React, { Component } from "react";
import Select from "react-select";
import MultiSelect from "@kenshooui/react-multi-select";
import "@kenshooui/react-multi-select/dist/style.css";
import { Form, Row, Col, Button, Spinner } from "react-bootstrap";

class FormContainer extends Component {
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

  componentDidMount() {
    console.log(this.props.uniqueID);
    var url =
      this.props.serverURL + "/getFormattedPayload/" + this.props.uniqueID;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.setState({
            payload: result.payload,
            columnSelected: result.formattedPayload.columns,
            rowSelected: result.formattedPayload.rows,
            dependencySelected: result.formattedPayload.dependencies,
            rowArtifactTypeSelected: result.formattedPayload.rowTypes,
            columnArtifactTypeSelected: result.formattedPayload.columnTypes,
            linksOnlySelected: result.formattedPayload.linksOnly,
            projectURI: result.projectURI
          });
        } else {
          this.setState({ validCookie: result.success });
        }

        console.log(this.state.projectURI);

        url = this.props.serverURL + "/getFields/" + this.state.projectURI;
        fetch(url, {
          method: "get"
        })
          .then(res => res.json())
          .then(result =>
            this.setState({
              parentFolderOptions: result.parentFolders,
              dependencies: result.linkTypes,
              artifactTypes: result.artifactTypes,
              isLoading: false
            })
          );
      });
  }

  handleFormSubmit(e) {
    e.preventDefault();
    this.props.toggleLoading();
    let userData = this.state.payload;
    let data = {
      projectAreaURI: this.props.projectURI,
      payload: this.state.payload
    };
    var url = this.props.serverURL + "/storePayload";
    fetch(url, {
      method: "POST",
      body: JSON.stringify(data)
    }).then(response => {
      response.json().then(result => {
        let tableUrl =
          this.props.serverURL + "/getLoadedTable/" + result.uniqueID;
        fetch(tableUrl, {
          method: "get"
        })
          .then(res => res.json())
          .then(result2 => {
            this.props.setTable(result2, result.uniqueID);
            this.props.toggleLoading();
          });
      });
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
    this.setState(prevState => ({
      dependencySelected: data,
      payload: {
        ...prevState.payload,
        [name]: [{ name: data.value }]
      }
    }));
  }

  handleColumnTypes(data) {
    const name = "columnTypes";
    this.setState(prevState => ({
      columnArtifactTypeSelected: data,
      payload: {
        ...prevState.payload,
        [name]: [{ name: data.value }]
      }
    }));
  }

  handleRowTypes(data) {
    const name = "rowTypes";
    this.setState(prevState => ({
      rowArtifactTypeSelected: data,
      payload: {
        ...prevState.payload,
        [name]: [{ name: data.value }]
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
      validCookie,
      isLoading
    } = this.state;
    return (
      <div style={{ margin: "20px" }}>
        {!validCookie || (isLoading && <Spinner animation="grow" />)}
        {!isLoading && validCookie && (
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
                <Form.Group>
                  <Select
                    onChange={this.handleDependencies}
                    options={dependencies}
                    value={dependencySelected}
                    placeholder="Link Type"
                  />
                </Form.Group>
                <Form.Group>
                  <Select
                    onChange={this.handleColumnTypes}
                    options={artifactTypes}
                    value={columnArtifactTypeSelected}
                    placeholder="Column Requirement Type"
                  />
                </Form.Group>
                <Form.Group>
                  <Select
                    onChange={this.handleRowTypes}
                    options={artifactTypes}
                    value={rowArtifactTypeSelected}
                    placeholder="Row Requirement Type"
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
                <Form.Group>
                  <Button variant="success" onClick={this.handleFormSubmit}>
                    Submit
                  </Button>

                  <Button variant="danger" onClick={this.handleClearForm}>
                    Clear Selected
                  </Button>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        )}
      </div>
    );
  }
}

export default FormContainer;
