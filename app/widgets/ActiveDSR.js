import React from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import {eventDict} from '../config/dataTypes'
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {dsrTableDict} from "../config/widgetDict";

import PropTypes from 'prop-types';
import BaseWidget from './Base'
import Table from "../components/DynamicTable";
import shapes from '../assets/shapes1.png';


let events = {
    'r': 'Request is being reviewed. Please check back here to view its status.',
    'r-accept': 'Request has been accepted and is being processed. Please check back here to view its status.',
    'r-decline': 'Request has been declined.',
    'r-cancel': 'Request has been cancelled.',
    'r-actioned': 'Request has been processed and your data sent via email.',
    'r-in-process': 'Request is being processed. Please check back here to view its status.',
    'r-extend': 'Request is being processed and a time extension has been requested.',
    'r-close': 'Request has been closed.',
    'r-error': 'Request has experienced an error.',
    'r-complete': 'Request has been completed.'
};

let eventDefinitions = {
    'r-accept': 'requestAccept',
    'r-decline': 'requestDecline',
    'r-cancel': 'requestCancel',
    'r-actioned': 'requestDataSent',
    'r': 'requestInteract',
    'r-in-process': 'requestInProcess',
    'r-extend': 'requestExtend',
    'r-close': 'requestClose',
    'r-error': 'requestError'
};
let dsrStatus = (event) => {
    switch(event.split('-')[1]) {
        case undefined:
            return 'Request';
        case 'accept':
            return 'Accepted';
        case 'decline':
            return 'Declined';
        case 'cancel':
            return 'Cancelled';
        case 'actioned':
            return 'Actioned';
        case 'in':
            return 'In Process';
        case 'extend':
            return 'Extended';
        case 'close':
            return 'Closed';
        case 'error':
            return 'Error';
        case 'complete':
            return 'Completed';
        default:
            return event;
    }
}

class ActiveDSRWidget extends BaseWidget {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            error: '',
        };
    }

    refreshData = async () => {
        let {type, dataTypeIds} = this.props;
        try {
            let DSRs = await this.api.sendRequest('/ledger/requests/dataSubject/' + (type !== '' ? type + '/' : '') + 'last');
            if(dataTypeIds)
                DSRs = DSRs.filter((el) => { return dataTypeIds.includes(el.contextId)})
            DSRs = _.sortBy(DSRs, 'capturedAt');
            this.setState({data: DSRs, error: '', loaded: true});
        } catch(error) {
            console.log(error.toString());
            this.setState({error: error.toString()});
        }
    }

    async componentDidMount() {
        try {
            this.dataTypes = await this.api.getDataTypes();
        }catch(error){
            this.setState({error: error.toString()})
        }
        this.refreshData();
    }


    genRowArray = (element, i) => {
        let {capturedAt, event, payload, contextId} = element;
        let dsrType = eventDict[event.split('-')[0]];
        let dataType = this.dataTypes[contextId]; // it is the data type id here
        //let definition = JSON.parse(dataType[dsrType.toLowerCase()+'Definition']);

        //let status = definition[eventDefinitions[event.substring(2)]].notice;

        capturedAt = new Date(capturedAt);

        return ([
            dsrType,
            this.dict.getName(dataType.name),
            `${capturedAt.toDateString()} ${capturedAt.toTimeString().split('GMT')[0]}`,
            // events[event.substring(2)], //For demo purposes
            dsrStatus(event),
            payload.message ||  "",
            // payload.reasons ? payload.reasons.join(", ") : ''
        ]);
        /*<td>{definitions.requestAccept.successNote[Object.keys(definitions.requestAccept.successNote)[0]]}</td>*/
    }

    render() {
        const {error, loaded, data} = this.state
        let {table, pcConfig} = this.props

        let display;

        if(error)
            display = <ErrorPanel/>;
        else if(!loaded)
            display = <LoadingInline/>;
        else{
            let headers = this.dict.getName(dsrTableDict);
            const customHeaders = pcConfig ? pcConfig.columnHeaders2 || [] : []
            headers = headers.map((el, id) => customHeaders[id] || el)

            let body = [];
            _.forEachRight(data, (element, i) => {
                try{
                    body.push(this.genRowArray(element, i))
                }catch(error){}
            });

            if (_.size(body)) {
                //request, personal info, data requested, status, note
                display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-lightest-blue">
                {
                _.map(body, (el) => {
                    return <div class="relative animated fadeIn slow ma3 pb3">
                                <div class="relative w7 min-h6 bg-white br4 ba b--tdark-blue pv3">
                                <div class="w-100 flex flex-wrap items-center ">
                                    <div class="w-100 ph3">
                                    <img src={shapes} className="w4 ph0 pv3" />
                                    <h1 class="f3 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2">{el[1]}</h1>
                                    </div>
                                    <div class="w-100 ph3">
                                    <h1 class="f4 fw2 mv3 lh-title blue">Data Request Type: <span class="black">{el[0]}</span></h1>
                                    <h1 class="f4 fw2 mv3 lh-title"><span class="blue">Date Requested:</span> {el[2]}</h1>
                                    <h1 class="f4 fw2 mv3 lh-title"><span class="blue">Status:</span> {el[3]}</h1>
                                    <h1 class="f4 fw2 mv3 lh-title"><span class="blue">Note:</span> {el[4]}</h1><br/><br/>
                                    <div class="absolute bottom-0 right-0 ma3 tr w-93 bt b--silver pt3">
                                    </div>
                                    </div>
                                </div>
                                </div>
                            </div>
                })
                }   
                </div>
            } else {
                display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue"><p class="f2 fw4 dark-blue ma4">No Requests for Data</p></div>
            }
        }

        return <div>{display}</div>
    }
}

ActiveDSRWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    pcConfig: PropTypes.object,
    type: PropTypes.oneOf(['access', 'erasure', 'object', 'rectify', '']),
    dataTypeIds: PropTypes.arrayOf(PropTypes.string)
};

ActiveDSRWidget.defaultProps = {
    type: '',
    pcConfig: null,
    table: Table.widgetTableProps,
    dataTypeIds: null
};

export default ActiveDSRWidget;