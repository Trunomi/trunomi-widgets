import React, {Component} from 'react';
import {consentButtonDict} from "../config/widgetDict";
import {consentButtonTypes} from "./propTypes";
import _ from 'lodash';
import {MenuItem, Select, FormControlLabel, Switch, withStyles} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { pcConfig, isPreview } from '../config/enterprise-config';

const styles = theme => ({
    noMargin: {
        marginRight: '5px'
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

    handleConsent = (e) => {
        let {value} = e.target
        const {dataTypeId, consentId, contextId} = this.props;

        this.props.onClick()

        const DPO = sessionStorage.getItem("TRUNOMI_DPO")
        const MOC = sessionStorage.getItem("TRUNOMI_MOC")

        let body = {
            payload: {
                consentDefinitionId: parseInt(consentId, 10)
            }
        };
        if (value === 'grant')
            body.payload['dataTypeId'] = dataTypeId;

        if (MOC && DPO)
            body.payload['moc'] = `Entered through the Trunomi portal by DPO (${DPO}). Collected via ${MOC}`

        this.sendConsentQuery(value, body, contextId);
    }

    toggleOptions = () => {
        this.setState({open: !this.state.open})
    }

    render() {
        let {open} = this.state
        let {state, dict, disableRevoke, onClick, isSwitch, classes, grant, deny, revoke} = this.props
        // let buttonText = dict.getName(consentButtonDict);
        let granted = ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(state);
        let denied = ['consent-deny', 'permission-deny'].includes(state);
        let content
        if (isSwitch) {
            content = <FormControlLabel
                className={classes.noMargin}
                control={<Switch
                    onChange={this.handleConsent}
                    value={granted ? "revoke" : "grant"}
                    disabled={isPreview || (denied || granted && (disableRevoke || status==='permission-implicit') || (revoke && (!grant || !deny)))}
                    color="primary"
                    checked={granted}
                />}
                label={<span style={pcConfig.tableBody}>
                    {granted ? "Granted" : state.includes("revoke") ? "Revoked" : "Denied"}
                </span>}
            />
        }
        else {
            let secondOption = state === 'NotActed' ? 'deny' : 'revoke'
            content = <div><div style={{marginLeft: '11px'}} onClick={this.toggleOptions}>
                <span className="action-button">Actions <ExpandMoreIcon /></span>
            </div>
            <Select open={open}
                    style={{position: 'absolute',width: 5,visibility: 'hidden'}}
                    onClose={this.toggleOptions}
                    onOpen={this.toggleOptions}
                    onChange={this.handleConsent}
                    MenuProps={{id: 'consent-select'}}
                    margin="normal">
                {grant && <MenuItem value="grant" disabled={isPreview} style={pcConfig.tableBody} id="">
                    Grant
                </MenuItem>}
                {deny && <MenuItem value={secondOption} disabled={isPreview || disableRevoke} style={pcConfig.tableBody}>
                    {_.upperFirst(secondOption)}
                </MenuItem>}
            </Select>
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
    revoke: false
};

ConsentButton.propTypes = consentButtonTypes;

export default withStyles(styles)(ConsentButton)