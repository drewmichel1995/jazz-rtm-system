import React from 'react';
import ReactDataGrid from 'react-data-grid';
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
      <ReactDataGrid
        columns={this.state.columns}
        rowGetter={i => this.state.rows[i]}
        rowsCount={this.state.columns.length}
        minHeight={10000} />
    );
  }
}


export default QuarterlyReport;