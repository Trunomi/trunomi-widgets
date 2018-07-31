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
            payload.message || "",
            payload.reasons ? payload.reasons.join(", ") : ''
        ]);
        /*<td>{definitions.requestAccept.successNote[Object.keys(definitions.requestAccept.successNote)[0]]}</td>*/
    }

    render() {
        const {error, loaded, data} = this.state, {table} = this.props;

        let display;

        if(error)
            display = <ErrorPanel/>;
        else if(!loaded)
            display = <LoadingInline/>;
        else{
            let headers = this.dict.getName(dsrTableDict);

            let body = [];
            _.forEachRight(data, (element, i) => {
                try{
                    body.push(this.genRowArray(element, i))
                }catch(error){}
            });

            display = <Table    header={headers}
                                data={body}
                                {...table}
                                style={{margin: 0}}
                                className="list-table"
                                id="active-dsrs"
                                headerClass="list-table-header" />
        }

        return <BS.Panel style={{width: '100%', minWidth: '530px'}} className={'trunomi-active-dsr'}>
            {display}
        </BS.Panel>
    }
}

ActiveDSRWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    type: PropTypes.oneOf(['access', 'erasure', 'object', 'rectify', '']),
    dataTypeIds: PropTypes.arrayOf(PropTypes.string)
};

ActiveDSRWidget.defaultProps = {
    type: '',
    table: Table.widgetTableProps,
    dataTypeIds: null
};

export default ActiveDSRWidget;