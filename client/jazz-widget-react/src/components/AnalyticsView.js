import React from "react";
import { Spinner, Table } from "react-bootstrap";

const serverURL = "https://mbse-colldev.saic.com/server";

class AnalyticsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: true
    };

    this.toggleLoading = this.toggleLoading.bind(this);
  }

  componentDidMount() {
    var url = serverURL + "/getAnalytics/" + this.props.projectURI;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        if (result.success) {
          this.setState({
            data: result,
            loading: false
          });
          this.props.onTitleChange(result.projectName);
        }
      });
  }

  toggleLoading() {
    this.setState({
      loading: !this.state.loading
    });
  }

  render() {
    const { data, loading } = this.state;

    return (
      <div>
        {!loading && (
          <div>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Folder Name</th>
                  <th>Number of Artifacts</th>
                </tr>
              </thead>
              <tbody>
                {data.folders.map(item => (
                  <tr>
                    <td>{item.folderName}</td>
                    <td>{item.numArtifacts}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
        {loading && (
          <div>
            <Spinner animation="border" variant="primary" />
          </div>
        )}
      </div>
    );
  }
}

export default AnalyticsView;
