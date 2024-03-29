import React from "react";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import { Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import * as legoData from "./legoloading.json";
import * as doneData from "./doneloading.json";

const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: legoData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

const defaultOptions2 = {
  loop: false,
  autoplay: true,
  animationData: doneData.default,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice"
  }
};

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      done: undefined
    };
  }
  render() {
    return (
      <div>
        <FadeIn>
          <Modal.Dialog>
            <Modal.Body>
              <div class="d-flex justify-content-center align-items-center">
                <h1>Fetching Artifacts</h1>
                {this.props.loading ? (
                  <Lottie options={defaultOptions} height={120} width={120} />
                ) : (
                  <Lottie options={defaultOptions2} height={120} width={120} />
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </FadeIn>
      </div>
    );
  }
}
