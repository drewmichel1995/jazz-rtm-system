import React, {Component} from 'react';
import { Form, Row, Col, Badge } from 'react-bootstrap';

class AnalyticsCard extends Component {

    constructor(props) {
        super(props);
    
        this.state = {
            dependencies: []
        }
      }


    componentDidMount() {
        console.log(this.props.uniqueID);

        var url = this.props.serverURL + '/getFields/' + this.props.projectURI;
        fetch(url, {
                method: 'get'
        })
        .then(res => res.json())
        .then(result => this.setState({ 
            dependencies: result.linkTypes
        }))  
    }
    
    render(){

        const { dependencies } = this.state;
        return (
            
                        <div>
                           <Form.Group as={Col} variant="primary">
                               {dependencies.map(item => (
                                   <Row>
                                   <Form.Label>
                                       {item.label}
                                   </Form.Label>
                                   </Row>
                               ))}
                            </Form.Group>
                        </div>
                   
        )
    }
}
export default AnalyticsCard;