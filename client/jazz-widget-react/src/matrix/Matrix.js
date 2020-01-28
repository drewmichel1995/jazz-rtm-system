import React from "react";
import Table from "./table/table/Table";
import OptionsToolbar from "./options/OptionsToolbar";
import ModalContainer from "../common/ModalContainer";
import Loading from "../common/loading/Loading";
import FadeIn from "react-fade-in";
import { Alert } from "react-bootstrap";
import dotenv from "dotenv";

dotenv.config();

class Matrix extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      columns: [],
      rows: [],
      rowSearchTerm: "",
      columnSearchTerm: "",
      showID: false,
      loading: true,
      projectURI: "",
      projectName: "",
      uniqueID: this.props.match.params.uniqueID,
      validCookie: true,
      done: false,
      isEmpty: false,
      fields: {},
      payload: {}
    };

    this.onRowSearchChange = this.onRowSearchChange.bind(this);
    this.onColumnSearchChange = this.onColumnSearchChange.bind(this);
    this.triggerShowID = this.triggerShowID.bind(this);
    this.setTable = this.setTable.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }

  componentDidMount() {
    const { uniqueID } = this.props.match.params;
    var url = "/server/getLoadedTable/" + uniqueID;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          let payload = result.payload;
          this.setState({
            columns: payload.columns,
            rows: payload.rows,
            projectURI: payload.projectURI,
            projectName: payload.projectName,
            uniqueID: uniqueID,
            loading: false,
            isEmpty: payload.rows.length < 2 && payload.columns.length < 3,
            fields: result.fields,
            payload: payload
          });
          this.props.onTitleChange(
            payload.projectName,
            payload.projectURI,
            uniqueID
          );
          setTimeout(() => {
            this.setState({ done: true });
          }, 1500);
        } else {
          this.setState({ validCookie: result.success });
        }
      });
  }

  onRowSearchChange(event) {
    this.setState({
      rowSearchTerm: event.target.value
    });
  }

  onColumnSearchChange(event) {
    this.setState({
      columnSearchTerm: event.target.value
    });
  }

  triggerShowID = () => {
    this.setState({ showID: !this.state.showID });
  };

  setTable(data, uniqueID) {
    this.setState({
      rows: data.rows,
      columns: data.columns,
      uniqueID: uniqueID,
      isEmpty: data.rows.length < 2 && data.columns.length < 3
    });

    this.props.onTitleChange(
      this.state.projectName,
      this.state.projectURI,
      this.state.uniqueID
    );
  }

  toggleLoading() {
    this.setState({
      loading: !this.state.loading
    });

    this.state.loading
      ? this.setState({ done: false })
      : setTimeout(() => {
          this.setState({ done: true });
        }, 1500);
  }

  render() {
    const { rowSearchTerm, columnSearchTerm, showID } = this.state;
    const {
      rows,
      columns,
      projectName,
      projectURI,
      uniqueID,
      loading,
      validCookie,
      done,
      isEmpty,
      fields,
      payload
    } = this.state;

    return (
      <div>
        {done && validCookie && (
          <FadeIn>
            <OptionsToolbar
              rowSearchTerm={rowSearchTerm}
              columnSearchTerm={columnSearchTerm}
              onRowChange={this.onRowSearchChange}
              onColumnChange={this.onColumnSearchChange}
              rowPlaceholder="Search Row Requirements"
              columnPlaceholder="Search Column Requirements"
              showID={showID}
              triggerShowID={this.triggerShowID}
              tableRows={rows}
              tableColumns={columns}
              setTable={this.setTable}
              toggleLoading={this.toggleLoading}
              projectURI={projectURI}
              projectName={projectName}
              uniqueID={uniqueID}
              onTitleChange={this.props.onTitleChange}
              fields={fields}
              payload={payload}
            />
            {!isEmpty && done ? (
              <Table
                rows={rows}
                columns={columns}
                showID={showID}
                columnSearchTerm={columnSearchTerm}
                rowSearchTerm={rowSearchTerm}
                projectURI={projectURI}
                loading={loading}
                legend={fields.legend}
              />
            ) : (
              <Alert variant="danger">
                <Alert.Heading>Empty Matrix Warning</Alert.Heading>
                <p>The selected matrix criteria produced an empty matrix.</p>
              </Alert>
            )}
          </FadeIn>
        )}
        {!validCookie && (
          <FadeIn>
            <ModalContainer />
          </FadeIn>
        )}
        {!done && validCookie && <Loading loading={loading} />}
      </div>
    );
  }
}

export default Matrix;
