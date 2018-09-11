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
import TableX from "../components/DynamicTable";
import FadeOutNotice from "../components/FadeOutNotice";
import LoadingModal from "../components/Loading";
import { pcConfig } from '../config/enterprise-config';

class ConsentsWidget extends BaseWidget {
    constructor(props) {
        super(props);
        this.i = 0
        this.state = {
            loaded: false,
            processing: false,
            contexts: '',
            rights: '',
            trucertModal: false,
            error: '',
            actionError: ''
        };
    }

    loadData = async () => {
        let {contextIds, contextTags} = this.props;
        try {
            let rights = await this.api.getRights(contextIds, contextTags),
                raw = await this.api.getContexts(contextIds, true, contextTags);
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

    // for backwards compatibility ever since we introduced the custom actions per legal basis
    getLegalBasisDefaults = (justification = '', grant, deny, revoke) => {
        let legalBasis = this.dict.getName(justification)
        grant = _.isUndefined(grant) ? true : grant
        deny = _.isUndefined(deny) && ('consent,other').includes(legalBasis) ? true : deny
        revoke = _.isUndefined(revoke) && ('consent,other').includes(legalBasis) ? true : revoke

        return {
            grant: grant,
            deny: deny,
            revoke: revoke
        }
    }

    genRightRowArray = (contextId, consentId, aux, dataTypeId, i, truCert = false) => {
        let {contexts, rights} = this.state
        let right = rights[contextId][consentId];
        let dataType = this.dataTypes[dataTypeId];
        let cd = contexts[contextId].consentDefinitions[consentId]
        let {revoke, grant, deny, justification} = cd
        let defaults = this.getLegalBasisDefaults(justification, grant, deny, revoke)
        grant = defaults.grant
        deny = defaults.deny
        revoke = defaults.revoke
        let {disableRevoke} = this.props,
        disabled = false
        if (!revoke || (disableRevoke && disableRevoke[contextId] && disableRevoke[contextId].includes(consentId)))
            disabled = true;

        try {
            // let isConsent = this.dict.getName(justification) === 'consent';
            // let uiId = i + "-" + consentId
            if (truCert)
                return <TrucertButton api={this.api} dict={this.dict} ledgerId={right.ledgerEntryId} show />
            else {
                return ([
                    <span id={"my-permissions-purpose-"+i} style={{wordBreak: "break-word"}}>{(aux === 1) ? this.dict.getName(right.contextName) : ''}</span>,
                    <span id={"my-permissions-permission-"+i} style={{wordBreak: "break-word"}}>{this.dict.getName(right.consentDefinition.name)}</span>,
                    <span id={"my-permissions-personal-info-"+i}>{this.dict.getName(dataType.name)}</span>,
                        <ConsentButton  dataTypeId={dataType.id}
                                        consentId={consentId}
                                        state={right.consentState}
                                        contextId={contextId}
                                        onProcessed={this.onProcessed}
                                        newConsent
                                        isSwitch
                                        api={this.api}
                                        dict={this.dict}
                                        onClick={()=> {this.setState({processing: true})}}
                                        grant={grant}
                                        deny={deny}
                                        revoke={revoke}
                                        disableRevoke={disabled} />
                ])
            }
        }catch(e) {}
    }

    genContextRowArray = (context, truCert = false) => {
        let aux = 0;
        let {id, name} = context;
        let elements = context.consentDefinitions
            .map((consentDefinition, consentId) => {
                if(consentDefinition===null)
                return;
                aux = aux +1;
            
                this.i++
                let {i} = this
                if (this.checkIfIsRight(id, consentId)) {
                    return this.genRightRowArray(id, consentId, aux, consentDefinition.dataTypeId, i, truCert)
                }
                else if (this.props.showAll){
                    if (truCert)
                        return []
                    else {
                        try {
                            let dataT = this.dataTypes[consentDefinition.dataTypeId];
                            let {grant, deny, revoke, justification} = consentDefinition
                            let defaults = this.getLegalBasisDefaults(justification, grant, deny, revoke)
                            grant = defaults.grant
                            deny = defaults.deny
                            revoke = defaults.revoke
                            // let uiId = aux + "-" + consentId
                            return ([
                                <span id={"my-permissions-purpose-"+i} style={{wordBreak: "break-word"}}>{aux === 1 ? this.dict.getName(name) : ''}</span>,
                                <span id={"my-permissions-permission-"+i} style={{wordBreak: "break-word"}}>{this.dict.getName(consentDefinition.name)}</span>,
                                <span id={"my-permissions-personal-info-"+i}>{this.dict.getName(dataT.name)}</span>,
                                <span className={'text-center'}>
                                    {(grant || deny) &&
                                        <ConsentButton  dataTypeId={consentDefinition.dataTypeId}
                                                        consentId={consentId}
                                                        state="NotActed"
                                                        contextId={id}
                                                        grant={grant}
                                                        deny={deny}
                                                        revoke={revoke}
                                                        onProcessed={this.onProcessed.bind(null, null, true)}
                                                        onClick={() => {this.setState({processing: true})}}
                                                        api={this.api}
                                                        dict={this.dict}/>}
                                </span>
                            ])
                        }catch (e){}
                    }
                }
            });
            
        //to remove undefineds
        return _.compact(elements)
    }

    render() {
        let display, {error, loaded, contexts, actionError, processing} = this.state;
        let {table} = this.props;
        if(error) {
            display = <ErrorPanel/>
        }
        else if(!loaded) {
            display = <LoadingInline/>
        }
        else {
            let headers = this.dict.getName(consentTableDict)
            headers = headers.map((el, id) => this.props.headers[id] || el)

            this.i = 0
            let contextRows = _.map(contexts, (element) => {
                return this.genContextRowArray(element)
            })

            let truCerts = _.map(contexts, (element) => {
                return this.genContextRowArray(element, true)
            })

            display = <TableX   style={{margin: 0}}
                                header={headers}
                                data={_.flatten(contextRows)}
                                onRowClick={_.flatten(truCerts)}
                                {...table}
                                className="list-table"
                                headerClass="list-table-header"
                                />
        }
        return <BS.Panel style={{width: '100%', minWidth: '530px', background: _.get(pcConfig,['columnHeaders','background'], '')}}>
            <LoadingModal loading={processing}>
                <FadeOutNotice show={!!actionError} text={actionError}
                               variant={'error'}
                               onClose={()=>{this.setState({actionError: ''})}}/>
                {display}
            </LoadingModal>
        </BS.Panel>
    }
}

ConsentsWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    contextIds: PropTypes.arrayOf(PropTypes.string),
    disableRevoke: PropTypes.object,
    contextTags: PropTypes.arrayOf(PropTypes.string),
    showAll: PropTypes.bool,
    headers: PropTypes.arrayOf(PropTypes.string)
};

ConsentsWidget.defaultProps = {
    contextIds: null,
    contextTags: null,
    table: TableX.widgetTableProps,
    disableRevoke: {},
    showAll: true,
    headers: []
};

export default ConsentsWidget;