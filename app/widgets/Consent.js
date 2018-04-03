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
        let {contextId} = this.props;

        try {
            let rights = await this.api.sendRequest("/rights/query", 'post', {contextId: contextId||undefined}),
                contexts = await this.api.getContexts(contextId, this.api.truConfig.customerId);

            this.setState({contexts: contexts, rights: rights, loaded: true});
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

    onProcessed = async(error) => {
        let {onProcessed} = this.props;

        if(error) {
            let {code, message} = error;

            this.setState({actionError: 'Error: ' + error.message});
        }
        await this.loadData();
        if(_.isFunction(onProcessed))
            onProcessed();
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
        try {
            return ([
                (aux === 1) ? this.dict.getName(right.contextName) : '',
                this.dict.getName(right.consentDefinition.name),
                this.dict.getName(dataType.name),
                <ConsentButton dataTypeId={dataType.id} consentId={consentId} state={right.consentState}
                               contextId={contextId} onProcessed={this.onProcessed.bind(this)}
                               api={this.api} dict={this.dict}/>,
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
                return ([
                    (aux === 1) ? this.dict.getName(name) : '',
                    this.dict.getName(consentDefinition.name),
                    this.dict.getName(dataT.name),
                    <span className={'text-center'}>
                        <ConsentButton dataTypeId={consentDefinition.dataTypeId} consentId={consentId}
                                       state="NotActed" contextId={id} onProcessed={this.onProcessed.bind(this)}
                                       api={this.api} dict={this.dict}/></span>,
                    <p className={'text-center'}>N/A</p>
                ])
            }
        });

        //to remove undefineds
        return _.compact(elements)
    }


    render() {
        let display, {error, loaded, contexts, actionError} = this.state;
        contexts = _.isArray(contexts) ? contexts : [contexts];
        let {table} = this.props;

        if(error) {
            display = <ErrorPanel/>;
        }
        else if(!loaded) {
            display = <LoadingInline/>;
        }
        else {
            let headers = _.union(this.dict.getName(consentTableDict), [<p>Trucert<sup>TM</sup></p>]);

            let contextRows = _.map(contexts, (element) => {
                return this.genContextRowArray(element);
            });

            display = <Table header={headers} data={_.flatten(contextRows)} {...table}/>
        }

        return <BS.Panel style={{width: '100%', minWidth: '530px'}}>
            <FadeOutNotice show={!!actionError} text={actionError}
                           bsStyle={'danger'}
                           after={()=>{this.setState({actionError: ''})}}/>
            {display}
        </BS.Panel>
    }
}

ConsentsWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    contextId: PropTypes.string
};

ConsentsWidget.defaultProps = {
    contextId: '',
    table: Table.widgetTableProps
};

export default ConsentsWidget;