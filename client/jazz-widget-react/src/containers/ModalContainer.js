import React, { Component } from "react";
import { Modal, Button } from "react-bootstrap";

class ModalContainer extends Component {
  copyToClipboard = e => {
    document.querySelector("#span").select();
    document.execCommand("copy");
  };

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
          <Button variant="secondary" onClick={this.copyToClipboard}>
            Copy Link to Jazz Widget
          </Button>
        </Modal.Footer>
        <span
          id="copypasta"
          style={{ display: "hidden" }}
          value="https://mbse-colldev.saic.com/server/getWidget"
        />
      </Modal.Dialog>
    );
  }
}

export default ModalContainer;
