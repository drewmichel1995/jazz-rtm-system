import React, { Component } from "react";
import { Form, Row, Col } from "react-bootstrap";

class SearchFilterOptions extends Component {
  render() {
    const { onRowChange, onColumnChange, triggerShowID, showID } = this.props;
    return (
      <div style={{ margin: "20px" }}>
        <Form>
          <Form.Group>
            <Row>
              <Col className="search-col">
                <Form.Control
                  onChange={onColumnChange}
                  placeholder="Search Column Requirements"
                  className="search-box"
                />

                <Form.Control
                  onChange={onRowChange}
                  placeholder="Search Row Requirements"
                  className="search-box"
                />
                <Form.Check
                  type="switch"
                  id="show-id-switch"
                  label="Show Id"
                  onChange={triggerShowID}
                  checked={showID}
                  className="form-text"
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
