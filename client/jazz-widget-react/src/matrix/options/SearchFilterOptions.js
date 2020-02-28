import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class SearchFilterOptions extends Component {
  render() {
    const { onRowChange, onColumnChange, triggerShowID, showID } = this.props;
    return (
      <Form inline>
        <Form.Group>
          <Form.Check
            type="switch"
            id="show-id-switch"
            onChange={triggerShowID}
            checked={showID}
            className="form-text"
            label="Show ID"
          />

          <Form.Control
            onChange={onColumnChange}
            placeholder="Search Columns"
            className="search-box"
          />

          <Form.Control
            onChange={onRowChange}
            placeholder="Search Rows"
            className="search-box"
          />
        </Form.Group>
      </Form>
    );
  }
}

export default SearchFilterOptions;
