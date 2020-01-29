import React, { Component } from "react";
import { Popover, OverlayTrigger } from "react-bootstrap";

class HeaderContextArea extends Component {
  render() {
    const { artifact, placement } = this.props;

    const name = artifact.name;
    const type = artifact.type;
    const id = artifact.id;
    const numLinks = artifact.numLinks;
    const parentFolder = artifact.parentFolder;
    const url = artifact.url;

    return (
      <OverlayTrigger
        trigger="hover"
        key={name + id}
        placement={placement}
        overlay={
          <Popover id={`popover-positioned-` + name + id}>
            <Popover.Title as="h3">
              <strong>{id}</strong>: {name}
            </Popover.Title>
            <Popover.Content>
              <div>
                <strong>Parent Folder: </strong>
                {parentFolder}
              </div>
              <div>
                <strong>Artifact Type: </strong>
                {type}
              </div>
              <div>
                <strong>Number of Links: </strong>
                {numLinks}
              </div>
            </Popover.Content>
          </Popover>
        }
      >
        <div>
          <a href={url}>{id}</a>
        </div>
      </OverlayTrigger>
    );
  }
}

export default HeaderContextArea;
