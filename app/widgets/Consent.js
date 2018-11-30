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
        deny = _.isUndefined(deny) && !('contract,legal,protection,public,legitimate').includes(legalBasis) ? true : deny
        revoke = _.isUndefined(revoke) && !('contract,legal,protection,public,legitimate').includes(legalBasis) ? true : revoke

        return {
            grant: grant,
            deny: deny,
            revoke: revoke
        }
    }

    genRightRowArray = (contextId, consentId, dataTypeId, i, truCert = false) => {
        let {contexts, rights} = this.state
        let right = rights[contextId][consentId];
        let dataType = this.dataTypes[dataTypeId];
        let cd = contexts[contextId].consentDefinitions[consentId]
        let {revoke, grant, deny, extend, justification, mocOptions} = cd
        let defaults = this.getLegalBasisDefaults(justification, grant, deny, revoke)
        grant = defaults.grant
        deny = defaults.deny
        revoke = defaults.revoke
        let {disableRevoke, pcConfig} = this.props
        let disabled = false
        if (!revoke || (disableRevoke && disableRevoke[contextId] && disableRevoke[contextId].includes(consentId)))
            disabled = true;

        if (right.consentState.includes('update'))
            right.consentState = right.coreState

        try {
            // let isConsent = this.dict.getName(justification) === 'consent';
            // let uiId = i + "-" + consentId
            let expired = right.consentState === 'permission-expired' || right.consentState === 'consent-expired'
            if (truCert)
                return <TrucertButton api={this.api} dict={this.dict} ledgerId={right.ledgerEntryId} show />
            else {
                return ([
                    <span id={"my-permissions-purpose-"+i} style={{wordBreak: "break-word"}}>{this.dict.getName(dataType.name)}</span>,
                    <span id={"my-permissions-permission-"+i} style={{wordBreak: "break-word"}}>{this.dict.getName(right.consentDefinition.name)}</span>,
                    <span>{
                        ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(right.consentState) ?
                            "ON" :
                            "OFF"
                            //right.consentState.includes('deny') ? 'Denied' : 'Revoked'
                    }</span>,
                    <ConsentButton  dataTypeId={dataType.id}
                                    consentId={consentId}
                                    state={right.consentState}
                                    pcConfig={pcConfig}
                                    contextId={contextId}
                                    onProcessed={this.onProcessed}
                                    newConsent
                                    moc={mocOptions}
                                    expired={expired}
                                    extend={extend}
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
        let {id} = context;
        let elements = context.consentDefinitions
            .map((consentDefinition, consentId) => {
                // Only show processing definitions with consent as it's legal basis
                if(consentDefinition===null || !this.dict.getName(consentDefinition.justification).includes('consent'))
                    return;

                this.i++
                let {i} = this
                if (this.checkIfIsRight(id, consentId)) {
                    return this.genRightRowArray(id, consentId, consentDefinition.dataTypeId, i, truCert)
                }
                else if (this.props.showAll){
                    if (truCert)
                        return []
                    else {
                        try {
                            let dataT = this.dataTypes[consentDefinition.dataTypeId];
                            let {grant, deny, revoke, justification, mocOptions} = consentDefinition
                            let defaults = this.getLegalBasisDefaults(justification, grant, deny, revoke)
                            grant = defaults.grant
                            deny = defaults.deny
                            revoke = defaults.revoke
                            return ([
                                <span id={"my-permissions-purpose-"+i} style={{wordBreak: "break-word"}}>{this.dict.getName(dataT.name)}</span>,
                                <span id={"my-permissions-permission-"+i} style={{wordBreak: "break-word"}}>{this.dict.getName(consentDefinition.name)}</span>,
                                <span>NEW</span>,
                                <ConsentButton  dataTypeId={consentDefinition.dataTypeId}
                                                consentId={consentId}
                                                state="NotActed"
                                                moc={mocOptions}
                                                contextId={id}
                                                grant={grant}
                                                deny={deny}
                                                revoke={revoke}
                                                onProcessed={this.onProcessed.bind(null, null, true)}
                                                onClick={() => {this.setState({processing: true})}}
                                                api={this.api}
                                                dict={this.dict}/>
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
        let {table, pcConfig} = this.props;
        if(error) {
            display = <ErrorPanel/>
        }
        else if(!loaded) {
            display = <LoadingInline/>
        }
        else {
            let headers = this.dict.getName(consentTableDict)
            const customHeaders = pcConfig ? pcConfig.columnHeaders0 || [] : []
            headers = headers.map((el, id) => customHeaders[id] || el)

            this.i = 0
            let contextRows = _.map(contexts, (element) => {
                return this.genContextRowArray(element)
            })

            let truCerts = _.map(contexts, (element) => {
                return this.genContextRowArray(element, true)
            })

            display = <TableX   style={{margin: 0}}
                                header={headers}
                                pcConfig={pcConfig}
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
    pcConfig: PropTypes.object,
    showAll: PropTypes.bool
};

ConsentsWidget.defaultProps = {
    contextIds: null,
    contextTags: null,
    pcConfig: null,
    table: TableX.widgetTableProps,
    disableRevoke: {},
    showAll: true
};

export default ConsentsWidget;