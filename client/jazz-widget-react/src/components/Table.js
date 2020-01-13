import React, {Component} from 'react';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import AnalyticsCard from './AnalyticsCard';
import HeaderContextArea from './HeaderContextArea';
import '../table.css';
import LinkContextArea from './LinkContextArea';

const isSearched = searchTerm => item => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.tableElemID.toLowerCase().includes("rowCounter".toLowerCase());
const IdIsSearched = searchTerm => item => item.id.toLowerCase().includes(searchTerm.toLowerCase()) || item.tableElemID.toLowerCase().includes("rowCounter".toLowerCase());


class Table extends Component {
    render(){
        const { rows, columns, showID, columnSearchTerm, rowSearchTerm, projectURI, serverURL } = this.props;
        return (
            <div style={{width: '100%', height: '100%'}}>
          <StickyTable stickyHeaderCount={1} stickyColumnCount={1}>
            <Row key="columnHeaders">
              <Cell key="holder">
                <AnalyticsCard rows={rows} columns={columns} projectURI={projectURI} serverURL={serverURL}/>
              </Cell>
              {!showID && columns.filter(isSearched(columnSearchTerm)).map(col =>(
                <Cell key={col.id} className="col-header"><HeaderContextArea artifact={col.name} artifactType={col.type} id={col.id} numLinks={col.numLinks} parentFolder={col.parentFolder} placement="right" cell={<div><a href={col.url}>{ col.name }</a></div>}/></Cell>
              ))}
              
              {showID && columns.filter(IdIsSearched(columnSearchTerm)).map(col =>(
                <Cell key={col.id} className="col-header"><HeaderContextArea artifact={col.name} artifactType={col.type} id={col.id} numLinks={col.numLinks} parentFolder={col.parentFolder} placement="right" cell={<div><a href={col.url}>{ col.id }</a></div>}/></Cell>
              ))}
            </Row>
            
            {!showID && rows.filter(isSearched(rowSearchTerm)).map(row => (
              <Row key={row.id}>
                <Cell key={row.id + "name"} className="row-header"><HeaderContextArea artifact={row.name} artifactType={row.type} id={row.id} numLinks={row.numLinks} parentFolder={row.parentFolder} placement="top" cell={<a href={row.url}>{ row.name }</a>}/></Cell>
                {row.cells.filter(isSearched(columnSearchTerm)).map(cell => (
                  cell.isLink ? <Cell key={row.id+cell.id} className="normalCell"><LinkContextArea rowId={cell.linkId} columnId={cell.id} className={cell.className} rowArtifact={cell.linkName} columnArtifact={cell.name} linkType={cell.rowLinkType} content={cell.cell} color={cell.color}/></Cell> : <Cell key={row.id+cell.id} className={cell.className} color={cell.color}>{cell.cell}</Cell>
                ))}
              </Row>
              ))}
            
            {showID && rows.filter(IdIsSearched(rowSearchTerm)).map(row => (
              <Row key={row.id}>
                <Cell key={row.id + "name"} className="row-header"><HeaderContextArea artifact={row.name} artifactType={row.type} id={row.id} numLinks={row.numLinks} parentFolder={row.parentFolder} placement="top" cell={<a href={row.url}>{ row.id }</a>}/></Cell>
                {row.cells.filter(IdIsSearched(columnSearchTerm)).map(cell => (
                  cell.isLink ? <Cell key={row.id+cell.id} className="normalCell"><LinkContextArea rowId={cell.linkId} columnId={cell.id} className={cell.className} rowArtifact={cell.linkName} columnArtifact={cell.name} linkType={cell.rowLinkType} content={cell.cell} color={cell.color}/></Cell> : <Cell key={row.id+cell.id} className={cell.className} color={cell.color}>{cell.cell}</Cell>
                ))}
              </Row>
              ))}
            
          </StickyTable>
        </div>
        );
    }
}

export default Table;