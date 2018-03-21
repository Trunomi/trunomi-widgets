import React, {Component} from 'react';
import Toggle from 'react-bootstrap-toggle';

import LoadingModal from "./Loading";
import {consentButtonDict} from "../config/widgetDict";
import {consentButtonTypes} from "./propTypes";
import _ from 'lodash';

export default class ConsentButton extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loading: false
        };

        this.api = this.props.api;
        this.dict = this.props.dict;
    }

    sendConsentQuery = async(type, body, contextId) => {
        let {onProcessed} = this.props;

        try {
            let page = "/ledger/context/" + contextId + "/consent-" + type;
            await this.api.sendRequest(page, 'post', body);

            this.setState({loading: false});
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

        this.setState({loading: true});

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
        let buttonText = this.dict.getName(consentButtonDict);

        return <div className='text-center'>
            <Toggle height={34} width={50} onstyle='success'
                    onClick={this.handleConsent}
                    on={<p>{buttonText[0]}</p>}
                    off={<p>{buttonText[1]}</p>}
                    active={this.props.state==='consent-grant'}/>
            <LoadingModal loading={this.state.loading} locale={this.dict.locale}/>
        </div>
    }
}

ConsentButton.defaultProps = {
    onProcessed: _.noop,
    state: 'NotActed'
};

ConsentButton.propTypes = consentButtonTypes;