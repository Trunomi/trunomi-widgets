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
import trunomi_logo from "../assets/trulogo.gif";
import { enterprise_logo } from '../config/enterprise-config';
import shapes from '../assets/shapes1.png';

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
                <div>
                    <p class="w-100 tc">
                    <img src={enterprise_logo || trunomi_logo} alt="logo" style={{maxWidth: '200px'}} />
                    <div className="mt2 f3 fw5 hot-pink">TruCert&trade; for {ledger[0].customerId}<br/><br/> Powered by Trunomi © 2014 - 2019</div>
                    </p>
                </div>
                <div>
                    <div class="relative w100 bg-white br4 pv3">
                    <img src={shapes} className="w4 ph0 pv3" />
                    <h1 class="pl2 f2 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2 mb3">Overview</h1>
                    <div class="w-100 ph3 mt3">
                    {
                        _.map(general, (d, i) => {
                            return <h1 class="f4 fw2 mv3 lh-title">
                            <span class="blue">{d[0]}: </span>{d[1]}
                            </h1>
                        })
                    }
                    </div>
                    </div>
                    <div class="relative w100 bg-white br4 pv3">
                    <img src={shapes} className="w4 ph0 pv3" />
                    <h1 class="pl2 f2 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2 mb3">History</h1>
                    <div class="w-100 ph3 mt3">
                    <Events ledger={ledger} />
                    <FingerPrint fingerprint={fingerprint} />
                    </div>
                    </div>
                </div>
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