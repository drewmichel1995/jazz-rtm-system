import React, {Component} from 'react'; 
import { Popover, OverlayTrigger } from 'react-bootstrap';

class HeaderContextArea extends Component {  

    render(){
        const { artifact, artifactType, id, numLinks, parentFolder, cell, placement } = this.props;

        return(
            <OverlayTrigger
                trigger="hover"
                key={artifact + id}
                placement={placement}
                overlay={
                    <Popover id={`popover-positioned-` + artifact + id}>
                        <Popover.Title as="h3"><strong>{id}</strong>: {artifact}</Popover.Title>
                        <Popover.Content>
                        <div><strong>Parent Folder: </strong>{parentFolder}</div>
                        <div><strong>Artifact Type: </strong>{artifactType}</div>
                        <div><strong>Number of Links: </strong>{numLinks}</div>
                        </Popover.Content>
                    </Popover>
                }
            >
                {cell}
            </OverlayTrigger>
        )
    }
}

export default HeaderContextArea;