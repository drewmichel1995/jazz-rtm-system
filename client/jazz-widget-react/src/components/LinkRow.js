import React from "react";
import { slideDown, slideUp } from "./anim";
import "./style.css";

class LinkRow extends React.Component {
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
    const { artifact } = this.props;
    return [
      <tr key="main" onClick={this.toggleExpander}>
        <td>{artifact.artifactID}</td>
        <td>{artifact.artifactName}</td>
        <td>{artifact.artifactType}</td>
        <td>{artifact.numLinks}</td>
      </tr>,
      this.state.expanded && !artifact.numLinks < 1 && (
        <tr className="expandable" key="tr-expander">
          <td className="uk-background-muted" colSpan={6}>
            <div ref="expanderBody" className="inner uk-grid">
              <div className="uk-width-1-4 uk-text-center">
                <table style={{ width: "auto" }}>
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
                </table>
              </div>
            </div>
          </td>
        </tr>
      )
    ];
  }
}

export default LinkRow;
