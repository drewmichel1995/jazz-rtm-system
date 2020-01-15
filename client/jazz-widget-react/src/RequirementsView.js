import React from "react";
import Table from "./components/Table";
import OptionsToolbar from "./containers/OptionsToolbar";
import ModalContainer from "./containers/ModalContainer";
import Loading from "./components/Loading";
import FadeIn from "react-fade-in";

const serverURL = "https://mbse-colldev.saic.com/server";

class RequirementsView extends React.Component {
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
      isEmpty: false
    };

    this.onRowSearchChange = this.onRowSearchChange.bind(this);
    this.onColumnSearchChange = this.onColumnSearchChange.bind(this);
    this.triggerShowID = this.triggerShowID.bind(this);
    this.setTable = this.setTable.bind(this);
    this.toggleLoading = this.toggleLoading.bind(this);
  }

  componentDidMount() {
    const { uniqueID } = this.props.match.params;
    var url = serverURL + "/getLoadedTable/" + uniqueID;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          result = result.payload;
          console.log();
          this.setState({
            columns: result.columns,
            rows: result.rows,
            projectURI: result.projectURI,
            projectName: result.projectName,
            uniqueID: uniqueID,
            loading: false,
            isEmpty: result.rows.length < 2 && result.columns.length < 3
          });
          this.props.onTitleChange(
            result.projectName,
            result.projectURI,
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
    if (event.target.value !== "") {
      this.setState({
        rowSearchTerm: event.target.value,
        currentlySearching: true
      });
    } else {
      this.setState({
        rowSearchTerm: event.target.value,
        currentlySearching: false
      });
    }
  }

  onColumnSearchChange(event) {
    if (event.target.value !== "") {
      this.setState({
        columnSearchTerm: event.target.value,
        currentlySearching: true
      });
    } else {
      this.setState({
        columnSearchTerm: event.target.value,
        currentlySearching: false
      });
    }
  }

  triggerShowID = () => {
    this.setState({ showID: !this.state.showID });
    console.log(this.state.showID);
  };

  setTable(data) {
    this.setState({
      rows: data.rows,
      columns: data.columns
    });
  }

  toggleLoading() {
    this.setState({
      loading: !this.state.loading
    });
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
      isEmpty
    } = this.state;

    return (
      <div>
        {done && isEmpty && (
          <div
            style={{ justifyContent: "center", backgroundColor: "gainsboro" }}
          >
            These Filter Criteria Produced an Empty Matrix
          </div>
        )}
        {done && (
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
              serverURL={serverURL}
              projectURI={projectURI}
              projectName={projectName}
              uniqueID={uniqueID}
            />
            <Table
              rows={rows}
              columns={columns}
              showID={showID}
              columnSearchTerm={columnSearchTerm}
              rowSearchTerm={rowSearchTerm}
              projectURI={projectURI}
              serverURL={serverURL}
            />
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

export default RequirementsView;
