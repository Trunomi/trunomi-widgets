import React, {Component} from 'react';
import * as BS from 'react-bootstrap';

export default class ConfigModal extends Component{
    constructor(props){
        super(props);

        this.state = {
            show: false,
            staticAuth: this.props.jwtToken === undefined
        }
    }

    componentWillReceiveProps(nextprops){
        this.setState({show: nextprops.show})
    }

    staticForm(){
        let {apiToken, enterpriseId, customerId, host_addr} = this.props;

        return <div>
            <BS.FormGroup controlId="apiToken">
                <BS.ControlLabel>API token</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={apiToken}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="host_addr">
                <BS.ControlLabel>Trunomi address</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={host_addr}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="enterpriseId">
                <BS.ControlLabel>Enterprise ID</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={enterpriseId}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="customerId">
                <BS.ControlLabel>Customer ID</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={customerId}/>
            </BS.FormGroup>
        </div>
    }

    expressForm(){
        let {jwtToken, host_addr} = this.props;

        return <div>
            <BS.FormGroup controlId="jwtToken">
                <BS.ControlLabel>Validated JWT token</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={jwtToken}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="host_addr">
                <BS.ControlLabel>Trunomi address</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={host_addr}/>
            </BS.FormGroup>
        </div>
    }

    render(){
        let {onHide, onSubmit} = this.props,
            {show, staticAuth} = this.state;

        return <BS.Modal show={show} onHide={onHide}>
            <BS.Modal.Header closeButton>
                <BS.Modal.Title>Previewer Configuration</BS.Modal.Title>
            </BS.Modal.Header>
            <BS.Modal.Body>
                <BS.Form onSubmit={(event) => {onSubmit(event, staticAuth)}}>
                    {
                        staticAuth ? this.staticForm() : this.expressForm()
                    }
                    <BS.Modal.Footer>
                        <div className="float-left">
                            <BS.Radio inline onChange={()=>{this.setState({staticAuth: !staticAuth})}} checked={staticAuth}>
                                Static
                            </BS.Radio>
                            <BS.Radio inline onChange={()=>{this.setState({staticAuth: !staticAuth})}} checked={!staticAuth}>
                                Express
                            </BS.Radio>
                        </div>
                        <BS.Button bsStyle="success" type='submit'>
                            Save
                        </BS.Button>
                    </BS.Modal.Footer>
                </BS.Form>
            </BS.Modal.Body>
        </BS.Modal>
    }
}