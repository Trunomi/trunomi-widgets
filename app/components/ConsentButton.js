import React, {Component} from 'react';
import {consentButtonDict} from "../config/widgetDict";
import {consentButtonTypes} from "./propTypes";
import _ from 'lodash';
import {Switch, FormControlLabel} from '@material-ui/core'
import {MenuItem, Select, Dialog, DialogContent, DialogTitle} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

export default class ConsentButton extends React.Component{

    state = {
        open: false
    }

    sendConsentQuery = async(type, body, contextId) => {
        let {onProcessed, newConsent, state} = this.props;

        try {
            let page = `/ledger/context/${contextId}/${state.includes("permission") ? "permission": "consent"}-${type}`;
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

        let body = {
            payload: {
                consentDefinitionId: parseInt(consentId, 10)
            }
        };
        if (value === 'grant')
            body.payload['dataTypeId'] = dataTypeId;

        this.sendConsentQuery(value, body, contextId);
    }

    toggleOptions = () => {
        this.setState({open: !this.state.open})
    }

    render() {
        let {open} = this.state
        let {state, dict, disableRevoke, onClick, isSwitch} = this.props
        let buttonText = dict.getName(consentButtonDict);
        let granted = ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(state);
        let content
        if (isSwitch) {
            content = <Switch 
                onChange={this.handleConsent}
                value={granted ? "revoke" : "grant"}
                disabled={granted && disableRevoke}
                color="primary"
                checked={granted}
            />
        }
        else {
            let secondOption = state === 'NotActed' ? 'deny' : 'revoke'
            content = <div><span onClick={this.toggleOptions}>
                <span className="action-button">Actions <ExpandMoreIcon /></span>
            </span>
            <span>
                <Select open={open}
                        style={{position: 'absolute',width: 5,visibility: 'hidden'}}
                        onClose={this.toggleOptions}
                        onOpen={this.toggleOptions}
                        onChange={this.handleConsent}
                        margin="normal">
                    <MenuItem value="grant">Grant</MenuItem>}
                    <MenuItem value={secondOption} disabled={disableRevoke}>{_.upperFirst(secondOption)}</MenuItem>}
                </Select>
            </span>
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
    iSwitch: false
};

ConsentButton.propTypes = consentButtonTypes;