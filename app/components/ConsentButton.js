import React, {Component} from 'react';
import Switch from 'react-bootstrap-switch';
import './react-bootstrap-switch.css';

import {consentButtonDict} from "../config/widgetDict";
import {consentButtonTypes} from "./propTypes";
import _ from 'lodash';

export default class ConsentButton extends React.Component{
    sendConsentQuery = async(type, body, contextId) => {
        let {onProcessed} = this.props;

        try {
            let page = "/ledger/context/" + contextId + "/consent-" + type;
            await this.props.api.sendRequest(page, 'post', body);

            onProcessed();
        }
        catch(error){
            console.log(error);
            this.setState({loading: false});
            onProcessed(error.response.data);
        }
    };

    handleConsent = (x,event) => {
        const {dataTypeId, consentId, contextId} = this.props;

        this.props.onClick()

        let body = {
            payload: {
                consentDefinitionId: parseInt(consentId, 10)
            }
        };

        if (event){
            body.payload['dataTypeId'] = dataTypeId;
            this.sendConsentQuery('grant', body, contextId);
        }else{
            this.sendConsentQuery('revoke', body, contextId);
        }
    };

    render() {
        let buttonText = this.props.dict.getName(consentButtonDict);
        let granted = this.props.state==='consent-grant';

        return <div className='text-center'>
            <Switch onChange={this.handleConsent}
                    bsSize='mini'
                    onText={<p>{buttonText[0]}</p>}
                    onColor='success'
                    offText={<p>{buttonText[1]}</p>}
                    disabled={granted && this.props.disableRevoke}
                    value={granted}/>
        </div>
    }
}

ConsentButton.defaultProps = {
    onProcessed: _.noop,
    state: 'NotActed',
    disableRevoke: false
};

ConsentButton.propTypes = consentButtonTypes;