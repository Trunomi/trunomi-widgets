import React, {Component} from 'react'
import * as BS from 'react-bootstrap'
import {Dialog, DialogContent, DialogTitle, Button, withStyles} from '@material-ui/core'

const styles = theme => ({
    button: {
        backgroundColor: '#7D61F4',
        '&:hover': {
            backgroundColor: '#563C82'
        },
        textTransform: 'none',
        fontSize: '13px'
    }
})

class ConfigModal extends Component{
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
        let {apiToken, enterpriseId, customerId, host_addr, locale} = this.props;

        return <div>
            <BS.FormGroup controlId="apiToken">
                <BS.ControlLabel className='blue-text'>API token</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={apiToken}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="host_addr">
                <BS.ControlLabel className='blue-text'>Environment URL</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={host_addr}/>
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
        let {jwtToken, host_addr} = this.props;

        return <div>
            <BS.FormGroup controlId="jwtToken">
                <BS.ControlLabel className='blue-text'>Validated JWT token</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={jwtToken}/>
            </BS.FormGroup>
            <BS.FormGroup controlId="host_addr">
                <BS.ControlLabel className='blue-text'>Environment URL</BS.ControlLabel>
                <BS.FormControl type="text" required defaultValue={host_addr}/>
            </BS.FormGroup>
        </div>
    }

    render(){
        let {onHide, onSubmit, classes} = this.props,
            {show, staticAuth} = this.state;

        return <Dialog open={show} onClose={onHide} scroll='body'>
            <DialogTitle>Customise this preview</DialogTitle>
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
                        <Button type="submit" variant="contained" className={classes.button} color="primary">Save</Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    }
}

export default withStyles(styles)(ConfigModal)