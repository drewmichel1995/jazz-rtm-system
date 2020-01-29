import React, { Component } from "react";
import { StickyTable, Row, Cell } from "react-sticky-table";
import Legend from "../Legend";
import HeaderContextArea from "../HeaderContextArea";
import LinkContextArea from "../LinkContextArea";
import Loading from "../../../common/loading/Loading";
import "./table.css";

const isSearched = searchTerm => item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.tableElemID.toLowerCase().includes("rowCounter".toLowerCase());

class Table extends Component {
  render() {
    const {
      payload,
      showID,
      columnSearchTerm,
      rowSearchTerm,
      loading,
      legend
    } = this.props;

    const rows = payload.rows;
    const columns = payload.columns;
    return loading ? (
      <Loading loading={loading} />
    ) : (
      <div style={{ width: "100%", height: "800px" }}>
        <StickyTable stickyHeaderCount={1} stickyColumnCount={1}>
          <Row key="columnHeaders">
            <Cell key="holder">
              <Legend legend={legend} />
            </Cell>
            {columns.filter(isSearched(columnSearchTerm)).map(col => (
              <Cell key={col.id} className="col-header">
                <HeaderContextArea
                  artifact={col}
                  placement="right"
                  showID={showID}
                />
              </Cell>
            ))}
          </Row>
          {rows.filter(isSearched(rowSearchTerm)).map(row => (
            <Row key={row.id}>
              <Cell key={row.id + "name"} className="row-header">
                <HeaderContextArea
                  artifact={row}
                  placement="top"
                  showID={showID}
                />
              </Cell>
              {row.cells.filter(isSearched(columnSearchTerm)).map(cell =>
                cell.isLink ? (
                  <Cell key={row.id + cell.id} className="normalCell">
                    <LinkContextArea cell={cell} />
                  </Cell>
                ) : (
                  <Cell
                    key={row.id + cell.id}
                    className={cell.className}
                    color={cell.color}
                  >
                    {cell.cell}
                  </Cell>
                )
              )}
            </Row>
          ))}
        </StickyTable>
      </div>
    );
  }
}

export default Table;
