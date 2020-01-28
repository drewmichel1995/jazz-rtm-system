import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class Legend extends Component {
  constructor(props) {
    super(props);

    this.state = {
      dependencies: []
    };
  }

  componentDidMount() {
    console.log(this.props.uniqueID);

    var url = this.props.serverURL + "/getFields/" + this.props.projectURI;
    fetch(url, {
      method: "get"
    })
      .then(res => res.json())
      .then(result =>
        this.setState({
          dependencies: result.legend
        })
      );
  }

  render() {
    const { dependencies } = this.state;
    return (
      <div>
        <Form.Group as={Col} variant="primary">
          {dependencies.map(item => (
            <Row>
              <Form.Label>
                <font color={item.color}>&#8599; - {item.name}</font>
              </Form.Label>
            </Row>
          ))}
        </Form.Group>
      </div>
    );
  }
}
export default Legend;
