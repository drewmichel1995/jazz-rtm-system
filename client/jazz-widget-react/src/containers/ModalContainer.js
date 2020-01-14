import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";

class ModalContainer extends Component {
  render() {
    return (
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Unable to Verify Project Access</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            Sorry, but we can't verify that you have access to this project.
          </p>
          <p>
            Please return to an IBM Jazz dashboard and launch the widget from
            there.
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            href="https://mbse-rmdev.saic.com:9443/rm/web"
            variant="primary"
          >
            Go to Jazz Dashboard
          </Button>
          <CopyToClipboard text="https://mbse-colldev.saic.com/server/getWidget">
            <Button variant="secondary">Copy Link to Jazz Widget</Button>
          </CopyToClipboard>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
}

export default ModalContainer;
