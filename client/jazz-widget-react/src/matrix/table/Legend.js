import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class Legend extends Component {
  render() {
    const { legend } = this.props;
    return (
      <div>
        <Form.Group as={Col} variant="primary">
          {legend.map(item => (
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
