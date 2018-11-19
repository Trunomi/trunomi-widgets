import * as React from 'react';
import * as _ from 'lodash';
import BaseWidget from './Base';
import {LoadingInline} from '../components/Loading';
import ErrorPanel from "../components/ErrorPanel";
import HorTable from '../components/HorizontalTable';
import Events from './Trucert/Events';
import FingerPrint from './Trucert/Fingerprint';
import DownloadPDF from './Trucert/DownloadPDF';
import Collapse from '../components/Collapse';
import {eventDict} from '../config/dataTypes';
import trunomi_logo from "../assets/logo.svg";
import { enterprise_logo } from '../config/enterprise-config';

class Trucert extends BaseWidget {
    constructor(props) {
        super(props);
        this.state = {
            context: {},
            dataType: {},
            ledger: {},
            general: '',
            fingerprint: '',
            events: '',
            loaded: false
        };
    }

    trucertRequest = async (id = "") => {
        let dataType, context, dataTypeId
        const ledger = await this.api.sendRequest("/enterprise-portal/stats/trucert/ledger/history/" + id)
        if (!ledger[0]){
            return;
        }
        const payload = JSON.parse(ledger[0].payload)

        //Only get the context if it's not a data subject request
        if(!ledger[0].event.startsWith('d')){
            context = await this.api.sendRequest('/context/' + ledger[0].contextId)
            dataTypeId = [context.consentDefinitions[payload.consent_definition_id].dataTypeId]
        }else{
            dataTypeId = payload.data_type_id
        }
        if (_.size(dataTypeId)) {
            dataType = await this.api.sendRequest('/data-type/' + dataTypeId).then((res) => {
                return res
            });
        }

        this.setState({ledger, context, dataType, loaded: true});
    }

    arrayToString = (input) => {
        let output = '';
        _.map(input, (inp) => {
            output += inp + ', '
        });

        output = output.substring(0, output.length - 2);
        return output
    }


    initVars = () => {
        let {dataType, context, ledger} = this.state;
        let firstLedger = ledger[0];
        let general = [];
        let payload
        let consentDef
        if (firstLedger.payload)
            payload = JSON.parse(firstLedger.payload)
        if (dataType)
            general.push(['Data Type', _.startCase(dataType.name[Object.keys(dataType.name)[0]])]);
        if (context){
            consentDef = context ? context.consentDefinitions[payload.consent_definition_id] : null
            general.push(['Purpose', _.startCase(context.name[Object.keys(context.name)[0]])])
            if (consentDef){
                general.push(['Processing Permission', _.startCase(consentDef.name[Object.keys(consentDef.name)[0]])])
            }
        }
        else
            general.push(['Purpose', `Data ${eventDict[firstLedger.event.substring(0,3)]} Request`]);
        if (payload) {
            if (_.size(payload.gf_products)) {
                let product = this.arrayToString(payload.gf_products);
                general.push(['Product', product]);
            }
            if (payload.gf_jurisdiction)
                general.push(['Jurisdiction', payload.gf_jurisdiction]);
            if (consentDef && consentDef.extraData) {
                _.forEach(JSON.parse(consentDef.extraData), (val, key) => {
                    general.push([[key], val])
                })
            }
            if (payload.custom_data && payload.custom_data !== '')
                general.push(['Custom Data', payload.custom_data])
        }
        let fingerprint = ledger[0].trucert;

        this.setState({
            fingerprint: fingerprint,
            general: general
        })

    }

    async componentWillMount() {
        await this.trucertRequest(this.props.ledgerId)
        this.initVars();

    }

    renderError(error) {
        if (error) {
            return <ErrorPanel />
        }
    }

    loading(loaded) {
        if (!loaded) {
            return <LoadingInline />
        }
    }

    renderTrucert() {
        let {general, fingerprint, ledger, loaded} = this.state;
        let {error} = this.props;

        if (loaded && !error) {
            return <div>
                <h2>
                    <img className="enterprise-logo" src={enterprise_logo || trunomi_logo}/>
                    TruCert <small>for {ledger[0].customerId}</small>
                </h2>
                <hr/>
                <Collapse text="General" headerBsStyle="active">
                    <HorTable data={general} headerStyle={{width: '30%'}}/>
                </Collapse>
                <Collapse text="History" headerBsStyle="active">
                    <div id="trueCert-popup">
                        <Events ledger={ledger}/>
                        <hr/>
                        <FingerPrint fingerprint={fingerprint} />
                        <div className="trucert-footer">Powered by Trunomi © 2014 - {new Date().getFullYear()}. All rights reserved</div>
                    </div>
                </Collapse>

                <DownloadPDF general={general} events={ledger} />
            </div>
        }
    }

    render() {
        let {error} = this.props;
        let {loaded} = this.state;

        return <div>
            {this.renderError(error)}
            {this.loading(loaded)}
            {this.renderTrucert()}
        </div>
    }
}

Trucert.defaultProps = {
    onError: _.noop,
    onLoaded: _.noop
}

export default Trucert;