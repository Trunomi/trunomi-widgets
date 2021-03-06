import React from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import TrucertButton from "../components/TrucertButton";
import ConsentButton from "../components/ConsentButton";
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {consentTableDict, consentStatusDict, consentBoxTitlesDict, noItemsDict} from "../config/widgetDict";
import PropTypes from 'prop-types';
import BaseWidget from './Base'
import TableX from "../components/DynamicTable";
import FadeOutNotice from "../components/FadeOutNotice";
import LoadingModal from "../components/Loading";
import jwt from 'jsonwebtoken';
import shapes from '../assets/shapes1.png'

const msInDay = 86400000;

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

        this.consentStatusDict = this.dict.getName(consentStatusDict)
        this.consentTableDict = this.dict.getName(consentTableDict)
    }

    expiry = (rules, trucert = undefined) => {
        const {duration: {days, expires}, isExtendable} = rules;
        const parsedTrucert = jwt.decode(trucert) || {};
        const granted = ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(parsedTrucert.event)
        const now = Date.now();
        
        if(expires){
            let expiryDate = Date.parse(expires);  // String format
            if (isNaN(expiryDate)) expiryDate = new Date(expires);   // Epoch format
            if (isNaN(expiryDate)) return {expired: false}; // Other: like "conditional"

            return {
                expired: now > expiryDate, 
                almostExpired: granted && (now < expiryDate && expiryDate < now + msInDay * 2)
            };
        }

        if(days && trucert){
            
            const expiryDate = Date.parse(parsedTrucert.capturedAt) + parseInt(days, 10) * msInDay;
            const expired = now > expiryDate;
            const almostExpired = granted && (now < expiryDate && expiryDate < now + msInDay * 2);

            return {
                expired,
                almostExpired, 
                extendable: granted && isExtendable && (almostExpired || expired)
            }
        }

        return {expired: false};
    }

    loadData = async () => {
        let {contextIds, contextTags} = this.props;
        try {
            let rights = await this.api.getRights(contextIds, contextTags),
                raw = await this.api.getContexts(contextIds, true, contextTags);
            let contexts = {};
            raw.forEach((el) => {contexts[el.id]= el});

            console.log({this: 'this', ...contexts})
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
        let ctxName = this.dict.getName(contexts[contextId].name)
        let ctxDescription = this.dict.getName(contexts[contextId].description)
        let {revoke, grant, deny, extend, justification, mocOptions} = cd
        let defaults = this.getLegalBasisDefaults(justification, grant, deny, revoke)
        let legalb = this.dict.getName(cd.justification)
        let legalBasesOptions = [
            {id: 'consent', name: 'Consent'},
            {id: 'impliedconsent', name: 'Implied/Deemed Consent'},
            {id: 'contract', name: 'Contractual necessity'},
            {id: 'legal', name: 'Compliance with a legal obligation'},
            {id: 'protection', name: 'Protection of vital interests'},
            {id: 'public', name: 'Public interest'},
            {id: 'legitimate', name: 'Legitimate interests'},
            {id: 'publicstudy', name: 'Research by Public Study Entities'},
            {id: 'legalproceedings', name: 'Exercise of Rights in Legal Proceedings'},
            {id: 'health', name: 'Health Protection'},
            {id: 'credit', name: 'Credit Protection'},
            {id: 'protectionoflife', name: 'Protection of Life'},
            {id: 'dnsmpi', name: 'Do Not Sell My Personal Information'},
            {id: 'other', name: 'Custom/Other'}
        ]

        legalBasesOptions.forEach(x => {
            if (x.id === legalb) {
                legalb = x.name;
            }
        })

        let regulations = cd.regulations ? cd.regulations : {'NA': 'NA'}

        let consentUse = this.dict.getName(cd.consentUse)
        grant = defaults.grant
        deny = defaults.deny
        revoke = defaults.revoke
        let {disableRevoke, pcConfig} = this.props
        let disabled = false
        if (!revoke || (disableRevoke && disableRevoke[contextId] && disableRevoke[contextId].includes(consentId)))
            disabled = true;

        let preferences = []
        if (cd.extraData) {
            const xd = JSON.parse(cd.extraData)
            if(Object.keys(xd).some((k) => { return ~k.indexOf("pref-") })){
                if(xd.hasOwnProperty(`pref-${this.dict.locale}`)) {
                    preferences = xd[`pref-${this.dict.locale}`].split(';')
                } else {
                    for (const key of Object.keys(xd)) {
                        if (key.toLowerCase().startsWith('pref-')) {
                            preferences = xd[key].split(';')
                            break
                        }
                    }
                }
            }
        }

        if (right.consentState.includes('update'))
            right.consentState = right.coreState

        try {
            // let isConsent = this.dict.getName(justification) === 'consent';
            // let uiId = i + "-" + consentId
            let {expired, almostExpired, extendable} = this.expiry(cd.rules, right.trucert) 
            expired = expired || right.consentState.includes('expired')

            if (truCert)
                return <TrucertButton pcConfig={pcConfig} api={this.api} dict={this.dict} ledgerId={right.ledgerEntryId} />
            else {
                return ([
                    this.dict.getName(dataType.name),
                    this.dict.getName(right.consentDefinition.name),
                    expired ? this.consentStatusDict[3] :
                        ['consent-grant', 'permission-grant', 'permission-mandate', 'permission-implicit'].includes(right.consentState) ?
                            this.consentStatusDict[1] :
                            this.consentStatusDict[2],
                    <ConsentButton  dataTypeId={dataType.id}
                                    consentId={consentId}
                                    state={right.consentState}
                                    pcConfig={pcConfig}
                                    contextId={contextId}
                                    onProcessed={this.onProcessed}
                                    newConsent
                                    moc={mocOptions}
                                    expired={expired}
                                    almostExpired={almostExpired}
                                    extend={extendable && extend !== false}
                                    api={this.api}
                                    dict={this.dict}
                                    onClick={()=> {this.setState({processing: true})}}
                                    grant={grant}
                                    deny={deny}
                                    revoke={revoke}
                                    disableRevoke={disabled} 
                                    preferences={preferences} />,
                    ctxName,
                    preferences,
                    consentUse,
                    ctxDescription,
                    legalb,
                    regulations
                ])
            }
        }catch(e) {}
    }

    genContextRowArray = (context, truCert = false) => {
        let {id} = context;
        let {pcConfig} = this.props;
        let ctxName = this.dict.getName(context.name)
        let ctxDescription = this.dict.getName(context.description)
        let elements = context.consentDefinitions
            .map((consentDefinition, consentId) => {
                // Only show processing definitions with consent as it's legal basis, unless DPO
                const DPO = window.sessionStorage.getItem("TRUNOMI_DPO")
                const MOC = window.sessionStorage.getItem("TRUNOMI_MOC")

                if(consentDefinition===null)
                    return;

                /*if (!(DPO && MOC)) {
                    if(!this.dict.getName(consentDefinition.justification).includes('consent'))
                        return;
                }*/

                if (!DPO && consentDefinition.hide) {
                    return;
                }

                let consentUse = this.dict.getName(consentDefinition.consentUse)
                let legalb = this.dict.getName(consentDefinition.justification)
                let legalBasesOptions = [
                    {id: 'consent', name: 'Consent'},
                    {id: 'impliedconsent', name: 'Implied/Deemed Consent'},
                    {id: 'contract', name: 'Contractual necessity'},
                    {id: 'legal', name: 'Compliance with a legal obligation'},
                    {id: 'protection', name: 'Protection of vital interests'},
                    {id: 'public', name: 'Public interest'},
                    {id: 'legitimate', name: 'Legitimate interests'},
                    {id: 'publicstudy', name: 'Research by Public Study Entities'},
                    {id: 'legalproceedings', name: 'Exercise of Rights in Legal Proceedings'},
                    {id: 'health', name: 'Health Protection'},
                    {id: 'credit', name: 'Credit Protection'},
                    {id: 'protectionoflife', name: 'Protection of Life'},
                    {id: 'dnsmpi', name: 'Do Not Sell My Personal Information'},
                    {id: 'other', name: 'Custom/Other'}
                ]
        
                legalBasesOptions.forEach(x => {
                    if (x.id === legalb) {
                        legalb = x.name;
                    }
                })
                let regulations = consentDefinition.regulations ? consentDefinition.regulations : {'NA': 'NA'}
                let preferences = []
                if (consentDefinition.extraData) {
                    const xd = JSON.parse(consentDefinition.extraData)
                    if(Object.keys(xd).some((k) => { return ~k.indexOf("pref-") })){
                        if(xd.hasOwnProperty(`pref-${this.dict.locale}`)) {
                            preferences = xd[`pref-${this.dict.locale}`].split(';')
                        } else {
                            for (const key of Object.keys(xd)) {
                                if (key.toLowerCase().startsWith('pref-')) {
                                    preferences = xd[key].split(';')
                                    break
                                }
                            }
                        }
                    }
                }

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
                            const {expired} = this.expiry(consentDefinition.rules);
                            if (expired){
                                return;
                            }
                            let dataT = this.dataTypes[consentDefinition.dataTypeId];
                            let {grant, deny, revoke, justification, mocOptions} = consentDefinition
                            let defaults = this.getLegalBasisDefaults(justification, grant, deny, revoke)

                            grant = defaults.grant
                            deny = defaults.deny
                            revoke = defaults.revoke
                            return ([
                                this.dict.getName(dataT.name),
                                this.dict.getName(consentDefinition.name),
                                expired ? this.consentStatusDict[3] : this.consentStatusDict[0],
                                <ConsentButton  dataTypeId={consentDefinition.dataTypeId}
                                                consentId={consentId}
                                                state="NotActed"
                                                moc={mocOptions}
                                                contextId={id}
                                                pcConfig={pcConfig}
                                                grant={grant}
                                                deny={deny}
                                                revoke={revoke}
                                                expired={expired}
                                                onProcessed={this.onProcessed.bind(null, null, true)}
                                                onClick={() => {this.setState({processing: true})}}
                                                api={this.api}
                                                dict={this.dict}
                                                preferences={preferences}
                                                />,
                                ctxName,
                                preferences,
                                consentUse,
                                ctxDescription,
                                legalb,
                                regulations
                            ])
                        }catch (e){console.log(e)}
                    }
                }
            });

        //to remove undefineds
        return _.compact(elements)
    }

    render() {
        let display, {error, loaded, contexts, actionError, processing} = this.state;
        let {table, pcConfig} = this.props;

        let titles = this.dict.getName(consentBoxTitlesDict)
        let noItems = this.dict.getName(noItemsDict)

        if(error) {
            display = <ErrorPanel/>
        }
        else if(!loaded) {
            display = <LoadingInline/>
        }
        else {
            let headers = this.consentTableDict
            const customHeaders = pcConfig ? pcConfig.columnHeaders0 || [] : []
            headers = headers.map((el, id) => customHeaders[id] || el)

            this.i = 0
            let k = 0
            let isFirst = false
            display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue" style={pcConfig.prefCentrePaneBackground}>
                {
                    _.map(contexts, (element) => {
                        let items = this.genContextRowArray(element)
                        let trucerts = this.genContextRowArray(element, true)
                        
                        let j = 0

                        return _.map(items, (el) => {
                            let tc = trucerts[j]
                            if (k === 0) {
                                isFirst = true
                            } else {
                                isFirst = false
                            }
                            k++
                            j++
                            if (el[2] === 'OFF') {
                                if (pcConfig.listTableMode) {
                                    return <div className={isFirst ? 'center flex flex-wrap justify-around w-100 mw9 ma2 bg-white mb3  bt b--light-gray pt2' : 'center flex flex-wrap justify-around w-100 mw9 ma2 bg-white mb3  bt b--light-gray pt2'}>
                                        <div className="flext flex-wrap justify-around w-50 pl3">
                                            <div className="w-100">
                                            <h1 class="f4 mv2 lh-solid dark-blue w-100 pb2" style={{overflow: 'hidden', textOverflow: 'ellipsis', ...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>{el[4]}: {el[0]}</h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}:<br/><span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[1]}</span></h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span><br/><span class="hot-pink fw6" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{el[2]}</span></h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Justification:</span><br/><span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[8]}</span></h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Regulation(s):</span><br/><span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[9] ? Object.keys(el[9]).length > 0 ? Object.keys(el[9]).map(x => {return x + '       '}) : 'N/A' : 'N/A'}</span></h1>
                                            </div>
                                        </div>
                                        <div className="flext flex-wrap justify-around w-50">
                                        <div className="w-100 tc pv3 flex justify-center">
                                            <h1 class="f5 fw2 mv0 lh-title w-100" style={pcConfig.prefCentreGridItemTextFont}>{el[7]}<br/>{el[6]}</h1>
                                            </div>
                                            <div className="w-100 tc pv3 flex justify-center">
                                            {tc}
                                            {el[3]}
                                            </div>
                                        </div>
                                    </div>
                                } else {
                                    return <div class="relative animated fadeIn slow ma3 pb3">
                                        <div class="relative w7 bg-near-white br4 ba b--tdark-blue pv3" style={{minHeight:'15rem', ...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>
                                        <div class="w-100 flex flex-wrap items-center ">
                                            <div class="w-100 ph3">
                                            <h1 class="f4 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2" style={{...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>{el[4]}: {el[0]}</h1>
                                            </div>
                                            <div class="w-100 ph3">
                                            <h1 class="f5 fw2 mv3 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[1]}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{el[2]}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Justification:</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[8]}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Regulation(s):</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[9] ? Object.keys(el[9]).length > 0 ? Object.keys(el[9]).map(x => {return x + '       '}) : 'N/A' : 'N/A'}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title" style={pcConfig.prefCentreGridItemTextFont}>{el[7]}<br/>{el[6]}</h1>
                                            <div class="bottom-0 right-0 tr w-100 bt b--silver pt3 flex justify-end">
                                            {tc}
                                            {el[3]}
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                }
                                
                            } else {
                                if (pcConfig.listTableMode) {
                                    return <div className={isFirst ? 'center flex flex-wrap justify-around w-100 mw9 ma2 bg-white mb3 bt b--light-gray pt2' : 'center flex flex-wrap justify-around w-100 mw9 ma2 bg-white mb3 bt b--light-gray pt2'}>
                                        <div className="flext flex-wrap justify-around w-50 pl3">
                                            <div className="w-100">
                                            <h1 class="f4 mv2 lh-solid dark-blue w-100 pb2" style={{overflow: 'hidden', textOverflow: 'ellipsis', ...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>{el[4]}: {el[0]}</h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[1]}</span></h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{el[2]}</span></h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Justification:</span><br/><span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[8]}</span></h1>
                                            </div>
                                            <div className="w-100">
                                            <h1 class="f5 fw2 mv2 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Regulation(s):</span><br/><span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[9] ? Object.keys(el[9]).length > 0 ? Object.keys(el[9]).map(x => {return x + '       '}) : 'N/A' : 'N/A'}</span></h1>
                                            </div>
                                        </div>
                                        <div className="flext flex-wrap justify-around w-50">
                                            <div className="w-100 tc pv3 flex justify-center">
                                            <h1 class="f5 fw2 mv0 lh-title w-100" style={pcConfig.prefCentreGridItemTextFont}>{el[7]}<br/>{el[6]}</h1>
                                            </div>
                                            <div className="w-100 tc pv3 flex justify-center">
                                            {tc}
                                            {el[3]}
                                            </div>
                                        </div>
                                    </div>
                                } else {
                                    return <div class="relative animated fadeIn slow ma3 pb3">
                                        <div class="relative w7 bg-white br4 ba b--tdark-blue pv3"  style={{minHeight:'15rem', ...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>
                                        <div class="w-100 flex flex-wrap items-center ">
                                            <div class="w-100 ph3">
                                            <h1 class="f4 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2" style={{...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>{el[4]}: {el[0]}</h1>
                                            </div>
                                            <div class="w-100 ph3">
                                            <h1 class="f5 fw2 mv3 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[1]}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{el[2]}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Justification:</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[8]}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title"><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>Regulation(s):</span> <span class="hot-pink fw6" style={pcConfig.prefCentreGridItemTextFont}>{el[9] ? Object.keys(el[9]).length > 0 ? Object.keys(el[9]).map(x => {return x + '       '}) : 'N/A' : 'N/A'}</span></h1>
                                            <h1 class="f5 fw2 mv3 lh-title" style={pcConfig.prefCentreGridItemTextFont}>{el[7]}<br/>{el[6]}</h1>
                                            <div class="bottom-0 right-0 tr w-100 bt b--silver pt3 flex justify-end">
                                            {tc}
                                            {el[3]}
                                            </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                }
                                
                            }
                            
                        })
                    })
                }
            </div>
        }
        return <LoadingModal loading={processing} >
                <FadeOutNotice show={!!actionError} text={actionError}
                               variant={'error'}
                               onClose={()=>{this.setState({actionError: ''})}}/>
                {(this.i ===0) ? <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue" style={pcConfig.prefCentrePaneBackground}><p class="f2 fw4 dark-blue ma4" style={pcConfig.prefCentreSectionTitleFont}>{noItems[0]}</p></div>: display} 
            </LoadingModal>
        
        /*return <BS.Panel style={{width: '100%', minWidth: '530px', background: _.get(pcConfig,['columnHeaders','background'], '')}}>
            <LoadingModal loading={processing}>
                <FadeOutNotice show={!!actionError} text={actionError}
                               variant={'error'}
                               onClose={()=>{this.setState({actionError: ''})}}/>
                {display}
            </LoadingModal>
        </BS.Panel>*/
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