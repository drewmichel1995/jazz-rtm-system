import React from "react";
import { slideDown, slideUp } from "./anim";
import "./style.css";

class UserTableRow extends React.Component {
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
    const { folder } = this.props;
    return [
      <tr key="main" onClick={this.toggleExpander}>
        <td className="uk-text-nowrap">{folder.folderName}.</td>
        <td>{folder.numArtifacts}</td>
      </tr>,
      this.state.expanded && (
        <tr className="expandable" key="tr-expander">
          <td className="uk-background-muted" colSpan={6}>
            <div ref="expanderBody" className="inner uk-grid">
              <div className="uk-width-1-4 uk-text-center">
                {folder.artifacts.map(artifact => (
                  <tr>
                    <td>{artifact.artifactName}</td>
                    <td>{artifact.artifactID}</td>
                    <td>{artifact.artifactType}</td>
                    <td>{artifact.numLinks}</td>
                  </tr>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )
    ];
  }
}

export default UserTableRow;
