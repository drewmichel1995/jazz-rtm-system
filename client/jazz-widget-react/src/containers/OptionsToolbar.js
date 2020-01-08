import React, {Component} from 'react';
import FormContainer from './FormContainer';
import SearchFormContainer from './SearchFormContainer';

class OptionsToolbar extends Component {
    
    render(){
        const { rowSearchTerm, columnSearchTerm, onRowChange, onColumnChange, showID, triggerShowID, tableRows, tableColumns, setTable, toggleLoading, serverURL, projectURI, uniqueID } = this.props;
        return (
            
                        <div>
                            <FormContainer
                                tableRows={tableRows}
                                tableColumns={tableColumns}
                                setTable={setTable}
                                toggleLoading={toggleLoading}
                                serverURL={serverURL}
                                projectURI={projectURI}
                                uniqueID={uniqueID}
                            />
                            <SearchFormContainer
                                rowSearchTerm={rowSearchTerm}
                                columnSearchTerm={columnSearchTerm}
                                onRowChange={onRowChange}
                                onColumnChange={onColumnChange}
                                rowPlaceholder="Search Row Requirements"
                                columnPlaceholder="Search Column Requirements"
                                showID={showID}
                                triggerShowID={triggerShowID}
                            />
                        </div>
                   
        )
    }
}
export default OptionsToolbar;