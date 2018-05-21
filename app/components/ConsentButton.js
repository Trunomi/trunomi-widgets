import React, {Component} from 'react';
import Toggle from 'react-bootstrap-toggle';

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

    handleConsent = (event) => {
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
            <Toggle height={34} width={50} onstyle='success'
                    onClick={this.handleConsent}
                    on={<p>{buttonText[0]}</p>}
                    off={<p>{buttonText[1]}</p>}
                    disabled={granted && this.props.disableRevoke}
                    active={granted}/>
        </div>
    }
}

ConsentButton.defaultProps = {
    onProcessed: _.noop,
    state: 'NotActed',
    disableRevoke: false
};

ConsentButton.propTypes = consentButtonTypes;