import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class SearchFilterOptions extends Component {
  render() {
    const {
      rowSearchTerm,
      columnSearchTerm,
      onRowChange,
      onColumnChange,
      rowPlaceholder,
      columnPlaceholder,
      showID,
      triggerShowID
    } = this.props;
    return (
      <div style={{ margin: "20px" }}>
        <Form>
          <Form.Group>
            <Row>
              <Col xs={6} md={4}>
                <Form.Control
                  value={columnSearchTerm}
                  onChange={onColumnChange}
                  placeholder={columnPlaceholder}
                />
              </Col>
              <Col xs={6} md={4}>
                <Form.Control
                  value={rowSearchTerm}
                  onChange={onRowChange}
                  placeholder={rowPlaceholder}
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
                  checked={showID}
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
