import React, {Component} from 'react';
import FormContainer from './FormContainer';
import SearchFormContainer from './SearchFormContainer';
import { Button, ButtonGroup } from 'react-bootstrap';

class OptionsToolbar extends Component {

    constructor(props){
        super(props);
        this.state = {
          showSearch: false,
          showMatrix: false
    
        };
    
        this.onSearchChange = this.onSearchChange.bind(this);
        this.onMatrixChange = this.onMatrixChange.bind(this);
      }

      onSearchChange = () => {
        this.setState({showSearch: !this.state.showSearch});
      }

      onMatrixChange = () => {
        this.setState({showMatrix: !this.state.showMatrix});
      }
    
    render(){
        const { rowSearchTerm, columnSearchTerm, onRowChange, onColumnChange, showID, triggerShowID, tableRows, tableColumns, setTable, toggleLoading, serverURL, projectURI, uniqueID } = this.props;
        return (

            <div>
            <ButtonGroup aria-label="Basic example">
                <Button variant="secondary" onChange={this.onMatrixChange}>Matrix Options</Button>
                <Button variant="secondary" onChange={this.onSearchChange}>Search Options</Button>
          </ButtonGroup>

                        {this.state.showMatrix &&
                            <FormContainer
                                tableRows={tableRows}
                                tableColumns={tableColumns}
                                setTable={setTable}
                                toggleLoading={toggleLoading}
                                serverURL={serverURL}
                                projectURI={projectURI}
                                uniqueID={uniqueID}
                            />}
                            {this.state.showMatrix &&
                            <SearchFormContainer
                                rowSearchTerm={rowSearchTerm}
                                columnSearchTerm={columnSearchTerm}
                                onRowChange={onRowChange}
                                onColumnChange={onColumnChange}
                                rowPlaceholder="Search Row Requirements"
                                columnPlaceholder="Search Column Requirements"
                                showID={showID}
                                triggerShowID={triggerShowID}
                            />}
                        </div>
                   
        )
    }
}
export default OptionsToolbar;