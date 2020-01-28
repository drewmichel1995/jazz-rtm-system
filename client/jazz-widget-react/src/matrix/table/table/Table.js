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
      rows,
      columns,
      showID,
      columnSearchTerm,
      rowSearchTerm,
      loading,
      legend
    } = this.props;

    return loading ? (
      <Loading loading={loading} />
    ) : (
      <div style={{ width: "100%", height: "800px" }}>
        <StickyTable stickyHeaderCount={1} stickyColumnCount={1}>
          <Row key="columnHeaders">
            <Cell key="holder">
              <Legend legend={legend} />
            </Cell>
            {!showID &&
              columns.filter(isSearched(columnSearchTerm)).map(col => (
                <Cell key={col.id} className="col-header">
                  <HeaderContextArea
                    artifact={col.name}
                    artifactType={col.type}
                    id={col.id}
                    numLinks={col.numLinks}
                    parentFolder={col.parentFolder}
                    placement="right"
                    cell={
                      <div>
                        <a href={col.url}>{col.name}</a>
                      </div>
                    }
                  />
                </Cell>
              ))}

            {showID &&
              columns.filter(isSearched(columnSearchTerm)).map(col => (
                <Cell key={col.id} className="col-header">
                  <HeaderContextArea
                    artifact={col.name}
                    artifactType={col.type}
                    id={col.id}
                    numLinks={col.numLinks}
                    parentFolder={col.parentFolder}
                    placement="right"
                    cell={
                      <div>
                        <a href={col.url}>{col.id}</a>
                      </div>
                    }
                  />
                </Cell>
              ))}
          </Row>

          {!showID &&
            rows.filter(isSearched(rowSearchTerm)).map(row => (
              <Row key={row.id}>
                <Cell key={row.id + "name"} className="row-header">
                  <HeaderContextArea
                    artifact={row.name}
                    artifactType={row.type}
                    id={row.id}
                    numLinks={row.numLinks}
                    parentFolder={row.parentFolder}
                    placement="top"
                    cell={<a href={row.url}>{row.name}</a>}
                  />
                </Cell>
                {row.cells.filter(isSearched(columnSearchTerm)).map(cell =>
                  cell.isLink ? (
                    <Cell key={row.id + cell.id} className="normalCell">
                      <LinkContextArea
                        rowId={cell.linkId}
                        columnId={cell.id}
                        className={cell.className}
                        rowArtifact={cell.linkName}
                        columnArtifact={cell.name}
                        linkType={cell.rowLinkType}
                        content={cell.cell}
                        color={cell.color}
                      />
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

          {showID &&
            rows.filter(isSearched(rowSearchTerm)).map(row => (
              <Row key={row.id}>
                <Cell key={row.id + "name"} className="row-header">
                  <HeaderContextArea
                    artifact={row.name}
                    artifactType={row.type}
                    id={row.id}
                    numLinks={row.numLinks}
                    parentFolder={row.parentFolder}
                    placement="top"
                    cell={<a href={row.url}>{row.id}</a>}
                  />
                </Cell>
                {row.cells.filter(isSearched(columnSearchTerm)).map(cell =>
                  cell.isLink ? (
                    <Cell key={row.id + cell.id} className="normalCell">
                      <LinkContextArea
                        rowId={cell.linkId}
                        columnId={cell.id}
                        className={cell.className}
                        rowArtifact={cell.linkName}
                        columnArtifact={cell.name}
                        linkType={cell.rowLinkType}
                        content={cell.cell}
                        color={cell.color}
                      />
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
