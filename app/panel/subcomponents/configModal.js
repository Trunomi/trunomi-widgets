import React, {Component} from 'react'
import * as BS from 'react-bootstrap'
import {Dialog, DialogContent, DialogTitle, Button} from '@material-ui/core'

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

    getHost = () => {
        let res = this.props.host_addr

        if (res === undefined) {
            let {hostname, protocol} = window.location
            res = hostname === 'localhost' ? 'http://trunomi.local' : protocol + '//' + hostname
        }

        return res
    }

    staticForm(){
        let {apiToken, enterpriseId, customerId, locale} = this.props;

        return <div>
            <BS.FormGroup controlId="apiToken">
                <BS.ControlLabel className='blue-text'>API token</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={apiToken}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="host_addr">
                <BS.ControlLabel className='blue-text'>Environment URL</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={this.getHost()}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="enterpriseId">
                <BS.ControlLabel className='blue-text'>Enterprise ID</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={enterpriseId}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="customerId">
                <BS.ControlLabel className='blue-text'>Customer ID</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={customerId}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="locale">
                <BS.ControlLabel className='blue-text'>Locale</BS.ControlLabel>
                <BS.FormControl type="text" defaultValue={locale}/>
            </BS.FormGroup>
        </div>
    }

    expressForm(){
        let {jwtToken} = this.props;

        return <div>
            <BS.FormGroup controlId="jwtToken">
                <BS.ControlLabel className='blue-text'>Validated JWT token</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={jwtToken}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="host_addr">
                <BS.ControlLabel className='blue-text'>Environment URL</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={this.getHost()}/>
            </BS.FormGroup>
        </div>
    }

    render(){
        let {onHide, onSubmit} = this.props,
            {show, staticAuth} = this.state;

        return <Dialog open={show} onClose={onHide} scroll='body'>
            <DialogTitle>CUSTOMISE THIS PREVIEW</DialogTitle>
            <DialogContent>
                <form onSubmit={(event) => {onSubmit(event, staticAuth)}}>
                    {staticAuth ? this.staticForm() : this.expressForm()}
                    <label className='blue-text'>Authentication type</label>
                    <br/>
                    <div>
                        <BS.Radio inline onChange={()=>{this.setState({staticAuth: !staticAuth})}} checked={staticAuth}>
                            Trunomi Static Token
                        </BS.Radio>
                        <br/>
                        <BS.Radio inline onChange={()=>{this.setState({staticAuth: !staticAuth})}} checked={!staticAuth}>
                            Trunomi Express Auth API (JWT)
                        </BS.Radio>
                    </div>
                    <div className="form-action">
                        <div>
                        <Button onClick={onHide} variant="outlined" color="primary">
                            Cancel
                        </Button>
                        &nbsp;
                        <Button type="submit" variant="contained" color="primary">Save</Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    }
}