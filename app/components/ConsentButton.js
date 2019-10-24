import React from 'react';
import {consentButtonDict} from "../config/widgetDict";
import {consentButtonTypes} from "./propTypes";
import _ from 'lodash';
import {FormControlLabel, Switch, withStyles, Button} from '@material-ui/core'
import { isPreview } from '../config/enterprise-config';
import classnames from 'classnames';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

const styles = theme => ({
    centered: {
        margin: '0 auto'
    },
    btnContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        float: 'left',
        width: '100%'
    },
    btn: {
        padding: '10px',
        color: 'var(--trunomi-blue)',
        marginRight: '10'
    },
    btnFont: {
        fontSize: '12px',
        textTransform: 'none'
    },
    alert: {
        color: 'red',
        fontSize: 'x-small',
        fontWeight: 'bold'
    }
})

class ConsentButton extends React.Component{

    state = {
        open: false,
        showMessageModal: false,
        messageEventName: '',
        messageEventCustomData: '',
        messageEventNameError: false
    }

    sendConsentQuery = async(type, body, contextId) => {
        let {onProcessed, newConsent, state} = this.props;

        try {
            let page = `/ledger/context/${contextId}/${state.includes("consent") ? (type === 'executed') ? "permission" : "consent": "permission"}-${type}`;
            await this.props.api.sendRequest(page, 'post', body);

            onProcessed(null, newConsent);
        }
        catch(error){
            console.log(error);
            onProcessed(error.response.data, newConsent);
            this.setState({loading: false});
        }
    };

    arrayOfObjectsToString(obj = null) {
        let str = ''
        if (obj) {
            obj.forEach((o) => {
                str += o[Object.keys(o)] + ", "
            })
            return str.substring(0, str.length - 2);
        }

        return str
    }

    handleConsent = (e) => {
        let {value} = e.target
        const {dataTypeId, consentId, contextId, moc} = this.props;

        this.props.onClick()

        const DPO = window.sessionStorage.getItem("TRUNOMI_DPO")
        const MOC = window.sessionStorage.getItem("TRUNOMI_MOC")

        let body = {
            payload: {
                consentDefinitionId: parseInt(consentId, 10)
            }
        };

        if (value === 'extend'){
            value = 'grant';
            body.payload.moc = 'Customer extended consent';
        }

        if ((value === 'grant') || (value === 'executed'))
            body.payload['dataTypeId'] = dataTypeId;


        if (MOC && DPO)
            body.payload['moc'] = `Entered through the Trunomi portal by DPO (${DPO}). Collected via ${MOC}`
        else
            body.payload['moc'] = moc ? this.arrayOfObjectsToString(moc) : 'Preference Centre'

        this.sendConsentQuery(value, body, contextId);
    }

    handleMessageAction = (e) => {
        this.setState({showMessageModal: !this.state.showMessageModal})
    }

    handleMessageActionOpen = () => {
        this.setState({ showMessageModal: true })
    }

    handleMessageActionClose = () => {
        this.setState({ messageEventName: '', messageEventCustomData: '', showMessageModal: false, messageEventNameError: false })
    }

    handleMessageActionSubmit = async () => {
        if (_.isEmpty(this.state.messageEventName)) {
            this.setState({messageEventNameError: true})
        } else {
            // Submit message & Close
            const {dataTypeId, consentId, contextId, moc} = this.props
            const DPO = window.sessionStorage.getItem("TRUNOMI_DPO")
            const MOC = window.sessionStorage.getItem("TRUNOMI_MOC")
            let body = {
                payload: {
                    consentDefinitionId: parseInt(consentId, 10)
                }
            }
    
            body.payload['dataTypeId'] = dataTypeId
    
            if (MOC && DPO)
                body.payload['moc'] = `Entered through the Trunomi portal by DPO (${DPO}). Collected via ${MOC}`
            else
                body.payload['moc'] = 'Preference Centre'

            body.payload['customData'] = this.state.messageEventCustomData
            body.payload['event'] = this.state.messageEventName
            body.payload['message'] = `On DataTypeID: (${dataTypeId})`

            try {
                let page = `/ledger/context/${contextId}/message`
                await this.props.api.sendRequest(page, 'post', body)
    
                this.setState({ messageEventName: '', messageEventCustomData: '', showMessageModal: false, messageEventNameError: false })
            }
            catch(error){
                console.log(error);
                alert('Error communicating with the Trunomi system. Please contact support@trunomi.com')
            }
        }
    }

    handleNameChange = (e) => {
        this.setState({ messageEventName: e.target.value, messageEventNameError: false })
    }

    handleCustomDataChange = (e) => {
        this.setState({ messageEventCustomData: e.target.value })
    }

    toggleOptions = () => {
        this.setState({open: !this.state.open})
    }

    render() {
        const DPO = window.sessionStorage.getItem("TRUNOMI_DPO")
        let {open, showMessageModal} = this.state
        let {pcConfig, state, dict, disableRevoke, onClick, isSwitch, classes, grant, deny, revoke, expired, extend, almostExpired} = this.props
        // let buttonText = dict.getName(consentButtonDict);
        let granted = ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(state);
        let denied = ['consent-deny', 'permission-deny'].includes(state);
        let content, options

        console.log(pcConfig)
        if (isSwitch && !expired) {
            let disabled = isPreview || ((denied || granted) && (disableRevoke || status==='permission-implicit')) || (!granted && !grant && revoke)
            content = <FormControlLabel
                className={classes.centered}
                control={<Switch
                    onChange={this.handleConsent}
                    value={granted ? "revoke" : "grant"}
                    disabled={disabled}
                    color="primary"
                    checked={granted}
                />}
                label={<span style={{...pcConfig.tableBody, color: disabled ? 'grey' : 'var(--trunomi-blue)'}}>
                    {granted ? "Revoke?" : "Grant?"}
                    {/* {granted ? "Revoke" : state.includes("revoke") ? "Revoked" : "Denied"} */}
                </span>}
            />
        }
        else {
            let buttonOptions = dict.getName(consentButtonDict);
            let secondOption = state === 'NotActed' ? buttonOptions[2] : buttonOptions[1]
            content = <div>
                <Dialog
                    open={this.state.showMessageModal}
                    onClose={this.handleMessageActionClose}
                    aria-labelledby="form-dialog-title"
                    >
                    <DialogTitle id="form-dialog-title">Log Message</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                        Log Custom Personal Data Events to the system (like alerting KYC is done). You can also specify custom data to be saved with the TruCert. Recommended to Base64 Encode custom data. The Event Name is required.
                        </DialogContentText>
                        <div className="f5 blue mt2">Event Name</div>
                        <TextField
                        error={this.state.messageEventNameError}
                        margin="dense"
                        id="name"
                        fullWidth
                        value={this.state.messageEventName}
                        onChange={this.handleNameChange}
                        margin="normal"
                        variant="outlined"
                        />
                        <div className="f5 blue mt2">Event Custom Data</div>
                        <TextField
                        margin="dense"
                        id="customdata"
                        fullWidth
                        value={this.state.messageEventCustomData}
                        onChange={this.handleCustomDataChange}
                        margin="normal"
                        variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleMessageActionClose} color="primary">
                        Cancel
                        </Button>
                        <Button onClick={this.handleMessageActionSubmit} color="primary">
                        Submit
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* <div style={{marginLeft: '11px'}} onClick={this.toggleOptions}>
                    <span className="action-button">
                        {expired ? 'Expired' : 'Actions'}
                        {!expired && <ExpandMoreIcon />}
                    </span>
                </div> */}
                <div className={classes.btnContainer}>
                    {expired &&
                        <Button className={classnames(classes.btn, classes.centered)}
                            variant="outlined"
                            disabled={!extend}
                            onClick={() => this.handleConsent({target: {value: 'extend'}})}>
                            <span className={classes.btnFont} style={(!extend) ? {...pcConfig.prefCentreGridItemActionButtonTextFont, color: 'gray'} : {...pcConfig.prefCentreGridItemActionButtonTextFont}}>{buttonOptions[3]}</span>
                        </Button>
                    }
                    {!expired &&
                    <Button className={classnames(classes.btn, classes.centered)}
                        disabled={isPreview || (!granted && !grant) || (granted && !extend) } variant="outlined"
                        onClick={() => this.handleConsent({target: {value: granted ? 'extend' : 'grant'}})}>
                        <span className={classes.btnFont} style={(isPreview || (!granted && !grant) || (granted && !extend)) ? {...pcConfig.prefCentreGridItemActionButtonTextFont, color: 'gray'} : {...pcConfig.prefCentreGridItemActionButtonTextFont}}>{(granted && almostExpired) ? buttonOptions[3] : buttonOptions[0]}</span>
                    </Button>}
                    {!expired && <Button className={classnames(classes.btn, classes.centered)} variant="outlined"
                        onClick={() => this.handleConsent({target: {value: state === 'NotActed' ? 'deny' : 'revoke'}})}
                        disabled={isPreview || disableRevoke || (state !== 'NotActed' && !granted) || !deny}>
                        <span className={classes.btnFont} style={(isPreview || disableRevoke || (state !== 'NotActed' && !granted) || !deny) ? {...pcConfig.prefCentreGridItemActionButtonTextFont, color: 'gray'} : {...pcConfig.prefCentreGridItemActionButtonTextFont}}>{_.upperFirst(secondOption)}</span>
                    </Button>}
                    {DPO && <Button 
                        onClick={() => this.handleMessageActionOpen({target: {value: 'message'}})}
                        className={classnames(classes.btn, classes.centered)} variant="outlined">
                        <span className={classes.btnFont} style={pcConfig.prefCentreGridItemActionButtonTextFont}>{_.upperFirst('message')}</span>
                    </Button>}
                    {DPO && <Button 
                        onClick={() => this.handleConsent({target: {value: 'executed'}})}
                        className={classnames(classes.btn, classes.centered)} variant="outlined">
                        <span className={classes.btnFont} style={pcConfig.prefCentreGridItemActionButtonTextFont}>{_.upperFirst('executed')}</span>
                    </Button>}
                </div>
                {almostExpired && <span className={classes.alert}>{buttonOptions[4]}</span>}
                {/* {!expired && <Select open={open}
                        style={{position: 'absolute',width: 5,visibility: 'hidden'}}
                        onClose={this.toggleOptions}
                        onOpen={this.toggleOptions}
                        onChange={this.handleConsent}
                        MenuProps={{id: 'consent-select'}}
                        margin="normal">
                    {(!expired && grant) && <MenuItem value="grant" disabled={isPreview} style={pcConfig.tableBody} id="">
                        Grant
                    </MenuItem>}
                    {(!expired && deny) && <MenuItem value={secondOption} disabled={isPreview || disableRevoke} style={pcConfig.tableBody}>
                        {_.upperFirst(secondOption)}
                    </MenuItem>}
                </Select>
                } */}
            </div>
        }

        return <div className='text-center'>
            {content}
        </div>
    }
}

ConsentButton.defaultProps = {
    onProcessed: _.noop,
    onClick: _.noop,
    state: 'NotActed',
    disableRevoke: false,
    newConsent: false,
    iSwitch: false,
    grant: true,
    deny: false,
    revoke: false,
    expired: false,
    extend: false,
    almostExpired: false,
};

ConsentButton.propTypes = consentButtonTypes;

export default withStyles(styles)(ConsentButton)