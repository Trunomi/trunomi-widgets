import React from 'react';
import PropTypes from 'prop-types';
import BluePanel from "../components/CustomPanel";
import _ from 'lodash';
import {LoadingInline} from "../components/Loading";
import BaseWidget from './Base'

/**
 * Capture consent widget for a context/consent IDs.
 */
export default class CaptureConsent extends BaseWidget{

    constructor(props) {
        super(props);
        this.state = {
            context: '',
            consentDef: '',
            notice: '',
            consentState: '',
            loaded: false,
            finished: false,
            show: this.props.show
        };
    }

    async componentWillMount() {
        let {contextId, consentId} = this.props;

        try {
            let data = await this.api.getContexts([contextId]);

            if (data.consentDefinitions[consentId] === undefined)
                throw new Error(
                    `Context with Id: ${contextId} does not have a consent definition with id ${consentId}`
                );

            let consentState = await this.api.getCosentState(contextId, consentId);

            this.setState({
                context: data,
                consentDef: data.consentDefinitions[consentId],
                loaded: true,
                consentState: consentState}); //If undefined means that the customer hasn't acted on it yet
        }
        catch (error) {
            console.log(error);
            this.props.onError(error);
            this.setState({notice: <p><b>Error</b>: failed to reach the Trunomi platform</p>, finished: true})
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({show: nextProps.show});
    }


    sendConsentQuery = async (action) => {

        let {contextId, consentId} = this.props, {consentDef} = this.state;

        try {
            let page = "/ledger/context/"+ contextId + "/consent-" + action,
                body = {payload: {
                    consentDefinitionId: consentId
                }},
                type = {
                    grant: 'Accept',
                    deny: 'Deny',
                    revoke: 'Revoke'
                };

            if(action==='grant')
                body.payload['dataTypeId'] = this.state.consentDef.dataTypeId;

            await this.api.sendRequest(page, 'post', body);

            let notice = consentDef['consent' + type[action]].notice;
            this.props.onSuccess();

            this.setState({
                //notice: this.dict.getName(notice),
                notice: <p>Your request has been <b>processed</b></p>, //Demo purposes
                finished: true
            })
        }
        catch(error) {
            console.log(error);
            this.props.onError(error);
            let errorMessage;
            if(error.response.data.code === 409)
                errorMessage = `This consent is already in ${action} state.`;
            else
                errorMessage = `This consent has expired.`;


            this.setState({
                notice: <p><b>Unfortunately</b> we were unable to register your request.
                    {errorMessage}</p>,
                finished: true
            })
        }
    }

    closeWidget = () => {
        this.props.onClose();

        this.setState({show: false});
    }

    render() {
        let {consentDef, loaded, finished, notice, consentState, show} = this.state, display;

        if(!show) {
            return null;
        }

        if (finished) {
            display = <div>
                {<strong>Thank you</strong>}
                {notice}
            </div>;
        }
        else if (!loaded) {
            display = <LoadingInline/>;
        }
        else {
            display = <div>
                <strong>{this.dict.getName(consentDef.name)}</strong>
                <p style={{padding: '5px'}}>{this.dict.getName(consentDef.consentUse)}</p>
                <button className={'link'} onClick={() => {
                    this.sendConsentQuery('grant')
                }}>
                    Yes, personalize my rewards {/* DEMO purposes */}
                    {/*{this.dict.getName(consentDef.consentAccept.prompt)}*/}
                </button>
                {(consentState === undefined) ?
                    <button className={'link'} onClick={() => {
                        this.sendConsentQuery('deny')
                    }}>
                        No, maybe another time {/* DEMO purposes */}
                        {/*{this.dict.getName(consentDef.consentDeny.prompt)}*/}
                    </button>
                    :
                    <button className={'link'} onClick={() => {
                        this.sendConsentQuery('revoke')
                    }}>
                        No, maybe another time {/* DEMO purposes */}
                        {/*{this.dict.getName(consentDef.consentRevoke.prompt)}*/}
                    </button>
                }
            </div>;
        }

        return <BluePanel style={this.props.style} onClose={this.closeWidget}>{display}</BluePanel>
    }

}

CaptureConsent.propTypes = {
    ...BaseWidget.propTypes,
    contextId: PropTypes.string.isRequired,//TODO: custom error (contextId or context must be a proper prop)
    context: PropTypes.object, //?Should the user be able to pass a context json already loaded in the page?
    consentId: PropTypes.number.isRequired,
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    onClose: PropTypes.func,
    show: PropTypes.bool,
    style: PropTypes.object
};

CaptureConsent.defaultProps = {
    show: true,
    style: {},
    onError: _.noop,
    onSuccess: _.noop,
    onClose: _.noop
};