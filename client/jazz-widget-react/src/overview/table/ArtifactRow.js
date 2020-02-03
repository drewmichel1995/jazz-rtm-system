import React from "react";
import { slideDown, slideUp } from "./anim";
import "./style.css";
import LinkRow from "./LinkRow";
import { Accordion, Table } from "react-bootstrap";

const isSearched = searchTerm => item =>
  item.artifactName.toLowerCase().includes(searchTerm.toLowerCase());

class ArtifactRow extends React.Component {
  render() {
    const { folder, searchTerm } = this.props;
    return (
      <tr>
        <td>
          <Accordion>
            <Accordion.Toggle eventKey="0">
              {folder.folderName}
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
        </td>
        <td>{folder.numArtifacts}</td>
      </tr>
    );
  }
}

export default ArtifactRow;
