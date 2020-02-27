import React from "react";
import { Table, Card, Form } from "react-bootstrap";
import ArtifactRow from "./table/ArtifactRow";
import Loading from "../common/loading/Loading";
import FadeIn from "react-fade-in";
import ModalContainer from "../common/ModalContainer";

const isSearched = searchTerm => item =>
  item.folderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.artifacts.some(a =>
    a.artifactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

class Overview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      loading: true,
      done: false,
      searchTerm: "",
      validCookie: false
    };

    this.toggleLoading = this.toggleLoading.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
  }

  componentDidMount() {
    var url = "/server/getAnalytics/" + this.props.match.params.projectURI;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result => {
        this.setState({
          data: result.analytics,
          validCookie: result.success,
          loading: false
        });

        setTimeout(() => {
          this.setState({ done: true });
        }, 1500);
      });
  }

  onSearchChange(event) {
    this.setState({
      searchTerm: event.target.value
    });
  }

  toggleLoading() {
    this.setState({
      loading: !this.state.loading
    });
  }

  render() {
    const { data, loading, done, searchTerm, validCookie } = this.state;

    return (
      <div>
        {done && !validCookie && <ModalContainer />}
        {done && validCookie && (
          <FadeIn>
            <Card>
              <Card.Header as="h5">{data.projectName}</Card.Header>
              <Card.Body>
                <Card.Title>
                  Number of Artifacts: {data.numArtifacts}
                </Card.Title>
                <Card.Title>Number of Folders: {data.numFolders}</Card.Title>
                <Form>
                  <Form.Control
                    value={searchTerm}
                    onChange={this.onSearchChange}
                    placeholder="Search"
                  />
                </Form>
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
                {data.folders.filter(isSearched(searchTerm)).map(item => (
                  <ArtifactRow folder={item} searchTerm={searchTerm} />
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

export default Overview;
