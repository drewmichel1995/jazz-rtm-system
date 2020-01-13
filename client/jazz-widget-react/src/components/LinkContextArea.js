import React, {Component} from 'react'; 
import { Popover, OverlayTrigger } from 'react-bootstrap';

class LinkContextArea extends Component {  

    render(){
        const { className, rowArtifact, columnArtifact, linkType, rowId, columnId, color } = this.props;

        return(
            <OverlayTrigger
                trigger="hover"
                key={rowArtifact + columnArtifact}
                placement="top"
                overlay={
                    <Popover id={`popover-positioned-` + rowArtifact + columnArtifact}>
                        <Popover.Title as="h3"><div><strong>{rowId}</strong>: {rowArtifact}</div> <div><strong>{linkType}</strong></div> <div><strong>{columnId}</strong>: {columnArtifact}</div></Popover.Title>
                    </Popover>
                }
            >
                <div className={className} style={{"color": {color}}}></div>
            </OverlayTrigger>
        )
    }
}

export default LinkContextArea;