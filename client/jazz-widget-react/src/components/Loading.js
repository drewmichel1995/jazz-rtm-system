import React from "react";
import FadeIn from "react-fade-in";
import Lottie from "react-lottie";
import ReactLoading from "react-loading";
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
          <div class="d-flex justify-content-center align-items-center">
            <h1>fetching pizza</h1>
            {this.props.loading ? (
              <Lottie options={defaultOptions} height={120} width={120} />
            ) : (
              <Lottie options={defaultOptions2} height={120} width={120} />
            )}
          </div>
        </FadeIn>
      </div>
    );
  }
}
