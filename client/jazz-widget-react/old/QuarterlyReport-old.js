import React from 'react';
import { StickyTable, Row, Cell } from 'react-sticky-table';
import './table.css'
class QuarterlyReport extends React.Component{
  
  constructor(props){
    super(props);
    this.state = {
      columns: [],
      rows: []
    };
  }

  

  componentDidMount() {
    var url = 'http://localhost:4567/tableJSON/_uAQboDPNEemiQN4B0zfQag'
    var data = {"columns":[{"name":"MIR: Eagle"}],"rows":[{"name":"MIR: Eagle"}],"columnTypes":[],"rowTypes":[],"dependencies":[],"showHeader":"ID"};
    fetch(url, {
      method: 'post',
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => this.setState({ columns: result.columns, rows: result.rows}))

  }
  
  render() {
    
    return (
      <div>
        <div style={{width: '100%', height: '400px'}}>
          <StickyTable>
            <Row>
              <Cell className="col-header"></Cell>
              {this.state.columns.map(col =>(
                <Cell className="col-header">{col.name}</Cell>
              ))}
            </Row>
            {this.state.rows.map(row => (
              <Row>
                <Cell className="row-header">{row.name}</Cell>
                {row.cells.map(cell => (
                  <Cell className="cell">{cell.cell}</Cell>
                ))}
              </Row>
              ))}
            
          </StickyTable>
        </div>
      </div>
    );
  }
}


export default QuarterlyReport;