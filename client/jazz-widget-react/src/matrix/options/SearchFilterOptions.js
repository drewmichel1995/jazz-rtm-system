import React, { Component } from "react";
import { Form } from "react-bootstrap";

class SearchFilterOptions extends Component {
  render() {
    const {
      onRowChange,
      onColumnChange,
      triggerShowID,
      showID,
      validCookie
    } = this.props;
    return (
      <Form inline>
        <Form.Group>
          <Form.Control
            onChange={onColumnChange}
            placeholder="Search Columns"
            className="search-box"
            disabled={!validCookie}
          />

          <Form.Control
            onChange={onRowChange}
            placeholder="Search Rows"
            className="search-box"
            disabled={!validCookie}
          />

          <Form.Check
            type="switch"
            id="show-id-switch"
            onChange={triggerShowID}
            checked={showID}
            className="form-text search-box"
            label="ID"
            disabled={!validCookie}
          />
        </Form.Group>
      </Form>
    );
  }
}

export default SearchFilterOptions;
