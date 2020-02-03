import React from "react";
import { slideDown, slideUp } from "./anim";
import "./style.css";
import LinkRow from "./LinkRow";
import { Accordion, Table, Button } from "react-bootstrap";

const isSearched = searchTerm => item =>
  item.artifactName.toLowerCase().includes(searchTerm.toLowerCase());

class ArtifactRow extends React.Component {
  state = { expanded: false };

  toggleExpander = e => {
    if (e.target.type === "checkbox") return;

    if (!this.state.expanded) {
      this.setState({ expanded: true }, () => {
        if (this.refs.expanderBody) {
          slideDown(this.refs.expanderBody);
        }
      });
    } else {
      slideUp(this.refs.expanderBody, {
        onComplete: () => {
          this.setState({ expanded: false });
        }
      });
    }
  };

  render() {
    const { folder, searchTerm } = this.props;
    return (
      <Accordion>
        <Accordion.Toggle as={Button} eventKey="0">
          <tr key="main">
            <td className="uk-text-nowrap">{folder.folderName}</td>
            <td>{folder.numArtifacts}</td>
          </tr>
        </Accordion.Toggle>
        {!folder.numArtifacts < 1 && (
          <Accordion.Collapse eventKey="0">
            <Table striped bordered hover>
              <thead>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Number of Links</th>
              </thead>
              <tbody>
                {folder.artifacts
                  .filter(isSearched(searchTerm))
                  .map(artifact => (
                    <LinkRow artifact={artifact} />
                  ))}
              </tbody>
            </Table>
          </Accordion.Collapse>
        )}
      </Accordion>
    );
  }
}

export default ArtifactRow;
