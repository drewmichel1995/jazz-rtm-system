import React from "react";
import { Table, Card } from "react-bootstrap";
import ArtifactRow from "./ArtifactRow";
import Loading from "./Loading";
import FadeIn from "react-fade-in";

const serverURL = "https://mbse-colldev.saic.com/server";

class AnalyticsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: true,
      done: false
    };

    this.toggleLoading = this.toggleLoading.bind(this);
  }

  componentDidMount() {
    var url = serverURL + "/getAnalytics/" + this.props.match.params.projectURI;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        this.setState({
          data: result,
          loading: false
        });

        setTimeout(() => {
          this.setState({ done: true });
        }, 1500);
      });
  }

  toggleLoading() {
    this.setState({
      loading: !this.state.loading
    });
  }

  render() {
    const { data, loading, done } = this.state;

    return (
      <div>
        {done && (
          <FadeIn>
            <Card>
              <Card.Header as="h5">{data.projectName}</Card.Header>
              <Card.Body>
                <Card.Title>
                  Number of Artifacts: {data.numArtifacts}
                </Card.Title>
                <Card.Title>Number of Folders: {data.numFolders}</Card.Title>
              </Card.Body>
            </Card>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Folder Name</th>
                  <th>Number of Artifacts</th>
                </tr>
              </thead>
              <tbody>
                {data.folders.map(item => (
                  <ArtifactRow folder={item} />
                ))}
              </tbody>
            </Table>
          </FadeIn>
        )}
        {!done && (
          <div>
            <Loading loading={loading} />
          </div>
        )}
      </div>
    );
  }
}

export default AnalyticsView;
