import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

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

    const classes = makeStyles({
      root: {
        width: '100%',
        overflowX: 'auto',
      },
      table: {
        minWidth: 650,
      },
    });
  
    return (
      <Paper className={classes.root}>
      <Table stickyHeader className={classes.table} aria-label="sticky table">
        <TableHead>       
          <TableRow>
            <TableCell></TableCell>
            {this.state.columns.map(col => (
              <TableCell>{col.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {this.state.rows.map(row => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              {row.cells.map(cell => (
              <TableCell>{cell.cell}</TableCell>
              ))}
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
    );
  }
}


export default QuarterlyReport;