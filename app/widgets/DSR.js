import React from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import DSRButton from "../components/DsrButton";
import FadeOutNotice from "../components/FadeOutNotice";
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {dataTableDict, dataTableDict2} from "../config/widgetDict";

import PropTypes from 'prop-types';
import BaseWidget from './Base'
import Table from "../components/DynamicTable";
import { pcConfig } from '../config/enterprise-config';

class DSRWidget extends BaseWidget{

    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            noticeMessage: '',
            error: '',
            dsrError: false,
            data: []
        };

    }

    loadRights = async() => {
        try{
            const {contextTags, dataTypeIds} = this.props
            const rights = await this.api.getRights(null, contextTags)
            const dataTypes = await this.api.getDataTypes(dataTypeIds);
            let data = []

            _.forEach(rights, context => {
                _.forEach(context, consent => {
                    const {consentState, consentDefinition} = consent
                    const {name, justification, dataTypeId} = consentDefinition
                    const dt = dataTypes[dataTypeId]
                    const granted = consentState.includes('grant') || consentState.includes('implicit') || consentState.includes('mandate')
                    if (!dt || !granted)
                        return

                    data.push({
                        name: this.dict.getName(dt.name),
                        permission: this.dict.getName(name),
                        justification: this.dict.getName(justification),
                        dataType: dt
                    })
                })
            })

            this.setState({data, loaded: true})
        }catch(error){
            this.setState({error: error.toString()})
        }
    }

    loadAll = async() => {
        try{
            const {contextTags, dataTypeIds} = this.props
            const contexts = await this.api.getContexts(null, true, contextTags)
            const dataTypes = await this.api.getDataTypes(dataTypeIds);
            let data = []

            contexts.forEach(context => {
                context.consentDefinitions.forEach(consent => {
                    const {name, justification, dataTypeId} = consent
                    const dt = dataTypes[dataTypeId]

                    data.push({
                        name: this.dict.getName(dt.name),
                        permission: this.dict.getName(name),
                        justification: this.dict.getName(justification),
                        dataType: dt
                    })
                })
            })

            this.setState({data, loaded: true})
        }catch(error){
            this.setState({error: error.toString()})
        }
    }

    genenerateRowData = (entry, i) => {
        const {name, permission, justification, dataType} = entry

        return ([
            <span id={"my-data-personal-info-" + i}>{name}</span>,
            <span id={"my-data-where-its-used-" + i} style={{wordBreak: "break-word"}}>
                {permission}
            </span>,
            <span>{_.capitalize(justification)}</span>,
            <DSRButton id={"my-data-action-button-" + i} dict={this.dict} truConfig={this.props.truConfig}
                       dataType={dataType} onProcessed={this.onProcessed}/>
        ])
    }

    onProcessed = (eventProcessed) => {
        let {onProcessed} = this.props;

        let noticeMessage, {code, dataType, action} = eventProcessed;
        if(code === 409) {
            noticeMessage = `Unable to register your request. There is already a data ${action} \
            request pending for ${dataType}`;
            this.setState({noticeMessage: noticeMessage, dsrError: true});
        }
        else {
            noticeMessage = `Thank you, your ${action} request for ${dataType} is currently being reviewed`;
            this.setState({noticeMessage: noticeMessage, dsrError: false});
            if (_.isFunction(onProcessed))
                onProcessed();
        }
    }

    componentDidMount = () => {
        this.refreshData()
    }

    refreshData = () => {
        return this.props.showAll ? this.loadAll() : this.loadRights()
    }


    render() {
        let display;
        let {error, loaded, dsrError, noticeMessage, data} = this.state,
            {table, showAll} = this.props;

        if(error)
            display = <ErrorPanel/>;
        else if(!loaded)
            display = <LoadingInline/>;
        else{
            const body = data.map(this.genenerateRowData);
            let headers = this.dict.getName(showAll ? dataTableDict : dataTableDict2)
            headers = headers.map((el, id) => this.props.headers[id] || el)

            display = <Table    data={body}
                                style={{margin: 0}}
                                header={headers}
                                {...table}
                                className="list-table"
                                headerClass="list-table-header" />
        }


        return <BS.Panel style={{width: '100%', minWidth: '530px', background: _.get(pcConfig,['columnHeaders','background'], '')}}>
            <FadeOutNotice show={!!noticeMessage} text={noticeMessage}
                           variant={dsrError ? 'error':'success'}
                           onClose={()=>{this.setState({noticeMessage: ''})}}/>
            {display}
        </BS.Panel>
    }
}

DSRWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    dataTypeIds: PropTypes.arrayOf(PropTypes.string),
    showAll: PropTypes.bool,
    contextTags: PropTypes.arrayOf(PropTypes.string),
    headers: PropTypes.arrayOf(PropTypes.string)
};

DSRWidget.defaultProps = {
    table: Table.widgetTableProps,
    dataTypeIds: null,
    showAll: false,
    contextTags: null,
    headers: []
};

export default DSRWidget;