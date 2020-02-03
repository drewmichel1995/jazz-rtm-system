import React from "react";
import "./style.css";
import { Accordion, Table } from "react-bootstrap";

class LinkRow extends React.Component {
  render() {
    const { artifact } = this.props;
    return (
      <tr key="main">
        <td>
          <Accordion>
            <Accordion.Toggle as="div" eventKey="1">
              {artifact.artifactID}
            </Accordion.Toggle>
            {!artifact.numLinks < 1 && (
              <Accordion.Collapse eventKey="1">
                <Table striped bordered hover>
                  <thead>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Link Type</th>
                    <th>Link Category</th>
                  </thead>
                  <tbody>
                    {artifact.links.map(link => (
                      <tr>
                        <td>{link.id}</td>
                        <td>{link.linkName}</td>
                        <td>{link.linkType}</td>
                        <td>{link.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Collapse>
            )}
          </Accordion>
        </td>
        <td>{artifact.artifactName}</td>
        <td>{artifact.artifactType}</td>
        <td>{artifact.numLinks}</td>
      </tr>
    );
  }
}

export default LinkRow;
