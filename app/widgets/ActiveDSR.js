import React from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import {eventDict} from '../config/dataTypes'
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {dsrTableDict, dataActiveBoxTitlesDict, noItemsDict} from "../config/widgetDict";

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

        let titles = this.dict.getName(dataActiveBoxTitlesDict)
        let noItems = this.dict.getName(noItemsDict)

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
                display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue" style={pcConfig.prefCentrePaneBackground}>
                {
                _.map(body, (el) => {
                    if (pcConfig.listTableMode) {
                        return <div className={'center flex flex-wrap w-100 mw9 ma2 bg-white mb3  bt b--light-gray pt2'}>
                                    <div className="flex flex-wrap justify-around w-50 pl3">
                                        <div className="w-100">
                                        <h1 class="f4 mv2 lh-solid dark-blue w-100 pb2" style={{...pcConfig.prefCentreGridItemTitleFont}}>{el[1]}</h1>
                                        </div>
                                        <div className="w-100">
                                        <h1 class="f5 fw2 mv0 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[0]}</span></h1>
                                        </div>
                                        <div className="w-100">
                                        <h1 class="f5 fw2 mv0 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> {el[2]}</h1>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap justify-around w-50 pl3">
                                        <div className="w-100 pv3 flex flex-wrap justify-around">
                                        <div className="w-100">
                                        <h1 class="f5 fw2 mv0 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[2]}:</span> {el[3]}</h1>
                                        </div>
                                        <div className="w-100">
                                        <h1 class="f5 fw2 mv0 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[3]}:</span> {el[4]}</h1><br/><br/>
                                        </div>
                                        </div>
                                    </div>
                                </div>
                    } else {
                        return <div class="relative animated fadeIn slow ma3 pb3">
                            <div class="relative w7 bg-white br4 ba b--tdark-blue pv3" style={{minHeight:'15rem', ...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>
                            <div class="w-100 flex flex-wrap items-center ">
                                <div class="w-100 ph3">
                                <h1 class="f4 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2" style={{...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>{el[1]}</h1>
                                </div>
                                <div class="w-100 ph3">
                                <h1 class="f5 fw2 mv3 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[0]}</span></h1>
                                <h1 class="f5 fw2 mv3 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> {el[2]}</h1>
                                <h1 class="f5 fw2 mv3 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[2]}:</span> {el[3]}</h1>
                                <h1 class="f5 fw2 mv3 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[3]}:</span> {el[4]}</h1><br/><br/>
                                <div class="bottom-0 right-0 tr w-100 bt b--silver pt3">
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    }
                    
                })
                }   
                </div>
            } else {
                display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue" style={pcConfig.prefCentrePaneBackground}><p class="f2 fw4 dark-blue ma4" style={pcConfig.prefCentrePaneBackground}>{noItems[2]}</p></div>
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