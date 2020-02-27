import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class SearchFilterOptions extends Component {
  render() {
    const { onRowChange, onColumnChange, triggerShowID, showID } = this.props;
    return (
      <Form inline>
        <Form.Row>
          <Col>
            <Form.Control
              onChange={onColumnChange}
              placeholder="Search Columns"
              className="search-box"
            />
          </Col>
          <Col>
            <Form.Control
              onChange={onRowChange}
              placeholder="Search Rows"
              className="search-box"
            />
          </Col>
          <Col>
            <Form.Check
              type="switch"
              id="show-id-switch"
              label="Show Id"
              onChange={triggerShowID}
              checked={showID}
              className="form-text"
            />
          </Col>
        </Form.Row>
      </Form>
    );
  }
}

export default SearchFilterOptions;
