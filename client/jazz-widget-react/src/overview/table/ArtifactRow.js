import React from "react";
import { slideDown, slideUp } from "./anim";
import "./style.css";
import LinkRow from "./LinkRow";

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
    return [
      <tr key="main" onClick={this.toggleExpander}>
        <td className="uk-text-nowrap">{folder.folderName}</td>
        <td>{folder.numArtifacts}</td>
      </tr>,
      this.state.expanded && !folder.numArtifacts < 1 && (
        <tr className="expandable" key="tr-expander">
          <td className="uk-background-muted">
            <div ref="expanderBody" className="inner uk-grid">
              <div className="uk-width-1-4 uk-text-center">
                <table>
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
                </table>
              </div>
            </div>
          </td>
        </tr>
      )
    ];
  }
}

export default ArtifactRow;
