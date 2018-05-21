import React from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';

import TrucertButton from "../components/TrucertButton";
import ConsentButton from "../components/ConsentButton";
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {consentTableDict} from "../config/widgetDict";

import PropTypes from 'prop-types';
import BaseWidget from './Base'
import Table from "../components/DynamicTable";
import FadeOutNotice from "../components/FadeOutNotice";
import LoadingModal from "../components/Loading";

class ConsentsWidget extends BaseWidget {

    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            contexts: '',
            rights: '',
            trucertModal: false,
            error: '',
            actionError: ''
        };
    }

    loadData = async () => {
        let {contextIds} = this.props;

        try {
            let rights = await this.api.getRights(contextIds),
                raw = await this.api.getContexts(contextIds, true);
            let contexts = {};
            raw.forEach((el) => {contexts[el.id]= el});

            this.setState({contexts, rights, loaded: true});
        }
        catch(error) {
            this.setState({error: error.toString()})
        }
    }

    checkIfIsRight = (contextId, consentId) => {

        if (this.state.rights[contextId] !== undefined) {
            if(this.state.rights[contextId][consentId.toString()] !== undefined) {
                return true;
            }
        }
        return false;
    }

    onProcessed = async(error, newConsent) => {
        let {onProcessed} = this.props;

        if(error) {
            this.setState({actionError: 'Error: ' + error.message});
        }
        await this.loadData();

        if(_.isFunction(onProcessed))
            onProcessed(error, newConsent);
        this.setState({processing: false})
    }

    async componentDidMount() {
        try {
            this.dataTypes = await this.api.getDataTypes();
        }catch(error) {
            this.setState({error: error.toString()})
        }
        this.loadData();
    }

    genRightRowArray = (contextId, consentId, aux, dataTypeId) => {
        let right = this.state.rights[contextId][consentId];
        let dataType = this.dataTypes[dataTypeId];
        let {disableRevoke} = this.props, disabled = false;
        if (disableRevoke && disableRevoke[contextId] && disableRevoke[contextId].includes(consentId))
            disabled = true;

        try {
            let isConsent = this.dict.getName(this.state.contexts[contextId].consentDefinitions[consentId].justification) === 'consent';
            return ([
                <span style={{wordBreak: "break-all"}}>{(aux === 1) ? this.dict.getName(right.contextName) : ''}</span>,
                <span style={{wordBreak: "break-all"}}>{this.dict.getName(right.consentDefinition.name)}</span>,
                <span>{this.dict.getName(dataType.name)}</span>,
                isConsent ? <ConsentButton dataTypeId={dataType.id} consentId={consentId} state={right.consentState}
                               contextId={contextId} onProcessed={this.onProcessed.bind(null, null, false)}
                               api={this.api} dict={this.dict} onClick={() => {this.setState({processing: true})}}
                               disableRevoke={disabled}/> : null,
                <TrucertButton api={this.api} dict={this.dict} ledgerId={right.ledgerEntryId}/>
            ])
        }catch(e) {}
    }

    genContextRowArray = (context) => {
        let aux = 0;

        let {id, name} = context;
        let elements = context.consentDefinitions.map((consentDefinition, consentId) => {
            if(consentDefinition===null)
                return;
            aux++;
            if (this.checkIfIsRight(id, consentId)) {
                return this.genRightRowArray(id, consentId, aux, consentDefinition.dataTypeId)
            }
            else{
                let dataT = this.dataTypes[consentDefinition.dataTypeId];
                let isConsent = this.dict.getName(consentDefinition.justification) === 'consent'; 
                try {
                    return ([
                        <span style={{wordBreak: "break-all"}}>{(aux === 1) ? this.dict.getName(name) : ''}</span>,
                        <span style={{wordBreak: "break-all"}}>{this.dict.getName(consentDefinition.name)}</span>,
                        <span>{this.dict.getName(dataT.name)}</span>,
                        isConsent ? <span className={'text-center'}>
                            <ConsentButton dataTypeId={consentDefinition.dataTypeId} consentId={consentId}
                                           state="NotActed" contextId={id}
                                           onProcessed={this.onProcessed.bind(null, null, true)}
                                           onClick={() => {
                                               this.setState({processing: true})
                                           }}
                                           api={this.api} dict={this.dict}/></span> : null,
                        <p className={'text-center'}>N/A</p>
                    ])
                }catch (e){}
            }
        });

        //to remove undefineds
        return _.compact(elements)
    }


    render() {
        let display, {error, loaded, contexts, actionError, processing} = this.state;
        let {table} = this.props;

        if(error) {
            display = <ErrorPanel/>;
        }
        else if(!loaded) {
            display = <LoadingInline/>;
        }
        else {
            let headers = _.union(this.dict.getName(consentTableDict), [<p>TruCert<sup>TM</sup></p>]);

            let contextRows = _.map(contexts, (element) => {
                return this.genContextRowArray(element);
            });
            display = <Table style={{margin: 0}} header={headers} data={_.flatten(contextRows)} {...table}/>
        }

        return <BS.Panel style={{width: '100%', minWidth: '530px'}}>
            <LoadingModal loading={processing}>
                <FadeOutNotice show={!!actionError} text={actionError}
                               bsStyle={'danger'}
                               after={()=>{this.setState({actionError: ''})}}/>
                {display}
            </LoadingModal>
        </BS.Panel>
    }
}

ConsentsWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    contextIds: PropTypes.arrayOf(PropTypes.string),
    disableRevoke: PropTypes.object
};

ConsentsWidget.defaultProps = {
    contextIds: ["77fc7dc0-4c9a-11e7-a9a4-1f09afff1a73"],
    table: Table.widgetTableProps,
    disableRevoke: {}
};

export default ConsentsWidget;