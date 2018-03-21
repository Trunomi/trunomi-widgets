import React, {Component} from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import DSRButton from "../components/DsrButton";
import FadeOutNotice from "../components/FadeOutNotice";
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {dataTableDict} from "../config/widgetDict";

import PropTypes from 'prop-types';
import BaseWidget from './Base'
import Table from "../components/DynamicTable";

class DSRWidget extends BaseWidget{

    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            contexts: '',
            data_types: '',
            noticeMessage: '',
            error: false
        };

        this.genRowArray = this.genRowArray.bind(this);
    }

    async loadData(){
        try {
            let contexts = await this.api.getContexts(),
                data_types = await this.api.getDataTypes();

            _.map(data_types, (data_type)=>{
                data_type["consentNames"] = [];
                data_type["basis"] = [];
            });

            contexts.forEach((context) => {
                let contextName = this.dict.getName(context.name).toLowerCase(), basis = "Consent";

                if (_.includes(contextName, 'banking'))
                    basis = 'Government Law';
                else if (_.includes(contextName, 'loan'))
                    basis = 'Contract';
                context.consentDefinitions.map((consent) => {
                    name = this.dict.getName(consent.name);

                    if (!data_types[consent.dataTypeId].consentNames.includes(name)) {
                        data_types[consent.dataTypeId].consentNames.push(name);
                        data_types[consent.dataTypeId].basis.push(basis);
                    }
                })
            });

            this.setState({contexts, data_types, loaded: true});
        }
        catch(error){
            console.log(error);
            this.setState({error: error.toString()})
        }
    }

    onProcessed(eventProcessed){
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

    componentDidMount() {
        this.loadData()
    }

    genRowArray(data_type){
        try {
            return ([
                this.dict.getName(data_type.name),
                (data_type.consentNames.length) ? data_type.consentNames.join(", ") : "None",
                (data_type.basis.length) ? data_type.basis.join(", ") : "None",
                <DSRButton dict={this.dict} truConfig={this.props.truConfig} dataType={data_type}
                           onProcessed={this.onProcessed.bind(this)}/>
            ])
        }catch(e){}//Sometimes the data sent by right api is corrupted
    }


    render() {
        let display;
        let {error, loaded, data_types, dsrError, noticeMessage} = this.state, {table} = this.props;

        if(error)
            display = <ErrorPanel/>;
        else if(!loaded)
            display = <LoadingInline/>;
        else{
            let headers = this.dict.getName(dataTableDict);
            let body = _.map(data_types, this.genRowArray);

            display = <Table header={headers} data={body} {...table}/>
        }

        return <BS.Panel style={{width: '100%', minWidth: '530px'}}>
            <FadeOutNotice show={!!noticeMessage} text={noticeMessage}
                           bsStyle={dsrError ? 'danger':'success'}
                           after={()=>{this.setState({noticeMessage: ''})}}/>
            {display}
        </BS.Panel>
    }
}

DSRWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    contextId: PropTypes.string
};

DSRWidget.defaultProps = {
    table: Table.widgetTableProps,
    contextId: ''
};

export default DSRWidget;