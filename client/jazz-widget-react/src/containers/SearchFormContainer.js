import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";
import ToggleBox from "../components/ToggleBox";

class SearchFormContainer extends Component {
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
      <div>
        <Form>
          <Form.Group>
            <Row>
              <Col xs={6} md={4}>
                <Form.Control
                  value={rowSearchTerm}
                  onChange={onRowChange}
                  placeholder={rowPlaceholder}
                />
              </Col>
              <Col xs={6} md={4}>
                <Form.Control
                  value={columnSearchTerm}
                  onChange={onColumnChange}
                  placeholder={columnPlaceholder}
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

export default SearchFormContainer;
