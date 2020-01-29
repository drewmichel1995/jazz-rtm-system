import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class SearchFilterOptions extends Component {
  render() {
    const { onRowChange, onColumnChange, triggerShowID } = this.props;
    return (
      <div style={{ margin: "20px" }}>
        <Form>
          <Form.Group>
            <Row>
              <Col xs={6} md={4}>
                <Form.Control
                  onChange={onColumnChange}
                  placeholder="Search Column Requirements"
                />
              </Col>
              <Col xs={6} md={4}>
                <Form.Control
                  onChange={onRowChange}
                  placeholder="Search Row Requirements"
                />
              </Col>
            </Row>
            <Row>
              <Col xs={6} md={4}>
                <Form.Check
                  type="switch"
                  id="show-id-switch"
                  label="Show Id"
                  onChange={triggerShowID}
                  checked="false"
                />
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </div>
    );
  }
}

export default SearchFilterOptions;
