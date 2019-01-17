import React from 'react';
import {consentButtonDict} from "../config/widgetDict";
import {consentButtonTypes} from "./propTypes";
import _ from 'lodash';
import {FormControlLabel, Switch, withStyles, Button} from '@material-ui/core'
import { pcConfig, isPreview } from '../config/enterprise-config';
import classnames from 'classnames';

const styles = theme => ({
    centered: {
        margin: '0 auto'
    },
    btnContainer: {
        display: 'flex',
        justifyContent: 'flex-start',
        float: 'left',
    },
    btn: {
        padding: '10px',
        color: 'var(--trunomi-blue)',
    },
    btnFont: {
        fontSize: '12px',
        textTransform: 'none'
    }
})

class ConsentButton extends React.Component{

    state = {
        open: false
    }

    sendConsentQuery = async(type, body, contextId) => {
        let {onProcessed, newConsent, state} = this.props;

        try {
            let page = `/ledger/context/${contextId}/${state.includes("consent") ? "consent": "permission"}-${type}`;
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
        const {value} = e.target
        const {dataTypeId, consentId, contextId, moc} = this.props;

        this.props.onClick()

        const DPO = window.sessionStorage.getItem("TRUNOMI_DPO")
        const MOC = window.sessionStorage.getItem("TRUNOMI_MOC")

        let body = {
            payload: {
                consentDefinitionId: parseInt(consentId, 10)
            }
        };
        if (value === 'grant' || value === 'extend')
            body.payload['dataTypeId'] = dataTypeId;


        if (MOC && DPO)
            body.payload['moc'] = `Entered through the Trunomi portal by DPO (${DPO}). Collected via ${MOC}`
        else
            body.payload['moc'] = moc ? this.arrayOfObjectsToString(moc) : 'Preference Centre'

        this.sendConsentQuery(value, body, contextId);
    }

    toggleOptions = () => {
        this.setState({open: !this.state.open})
    }

    render() {
        let {open} = this.state
        let {state, dict, disableRevoke, onClick, isSwitch, classes, grant, deny, revoke, expired, extend} = this.props
        // let buttonText = dict.getName(consentButtonDict);
        let granted = ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(state);
        let denied = ['consent-deny', 'permission-deny'].includes(state);
        let content, options
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
                {/* <div style={{marginLeft: '11px'}} onClick={this.toggleOptions}>
                    <span className="action-button">
                        {expired ? 'Expired' : 'Actions'}
                        {!expired && <ExpandMoreIcon />}
                    </span>
                </div> */}
                <div className={classes.btnContainer}>
                    {expired && <span className={classes.centered}>{buttonOptions[3]}</span>}
                    {!expired &&
                    <Button className={classnames(classes.btn, classes.centered)}
                        disabled={isPreview || granted || !grant} variant="outlined"
                        onClick={() => this.handleConsent({target: {value: 'grant'}})}>
                        <span className={classes.btnFont}>{buttonOptions[0]}</span>
                    </Button>}
                    {!expired && <Button className={classnames(classes.btn, classes.centered)} variant="outlined"
                        onClick={() => this.handleConsent({target: {value: state === 'NotActed' ? 'deny' : 'revoke'}})}
                        disabled={isPreview || disableRevoke || (state !== 'NotActed' && !granted) || !deny}>
                        <span className={classes.btnFont}>{_.upperFirst(secondOption)}</span>
                    </Button>}
                </div>
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
    extend: false
};

ConsentButton.propTypes = consentButtonTypes;

export default withStyles(styles)(ConsentButton)