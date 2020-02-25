import React from "react";
import FadeIn from "react-fade-in";
import { Alert } from "react-bootstrap";
import dotenv from "dotenv";
import Table from "./table/table/Table";
import OptionsToolbar from "./options/OptionsToolbar";
import ModalContainer from "../common/ModalContainer";
import Loading from "../common/loading/Loading";

dotenv.config();

class Matrix extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    this.reload = this.reload.bind(this);
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

  reload(uniqueID) {
    this.setState({
      loading: true
    });

    var url = "/server/getLoadedTable/" + uniqueID;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          let payload = result.payload;
          this.setState({
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

  render() {
    const {
      loading,
      validCookie,
      done,
      showID,
      columnSearchTerm,
      rowSearchTerm,
      isEmpty,
      fields,
      payload,
      projectName
    } = this.state;

    return (
      <div>
        {done && validCookie && (
          <FadeIn>
            <OptionsToolbar
              onRowChange={this.onRowSearchChange}
              onColumnChange={this.onColumnSearchChange}
              triggerShowID={this.triggerShowID}
              showID={showID}
              onTitleChange={this.props.onTitleChange}
              fields={fields}
              payload={payload}
              reload={this.reload}
              projectName={projectName}
            />
            {!isEmpty && done ? (
              <Table
                payload={payload}
                showID={showID}
                columnSearchTerm={columnSearchTerm}
                rowSearchTerm={rowSearchTerm}
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
