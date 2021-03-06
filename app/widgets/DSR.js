import React from 'react';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import DSRButton from "../components/DsrButton";
import FadeOutNotice from "../components/FadeOutNotice";
import {LoadingInline} from "../components/Loading";
import ErrorPanel from "../components/ErrorPanel";
import {dataTableDict, dataTableDict2, dsrResponseDict, dataPermBoxTitlesDict, noItemsDict} from "../config/widgetDict";

import PropTypes from 'prop-types';
import BaseWidget from './Base'
import Table from "../components/DynamicTable";
import shapes from '../assets/shapes1.png'

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
                    const {name, justification, dataTypeId, consentUse} = consentDefinition
                    
                    const dt = dataTypes[dataTypeId]
                    const granted = consentState.includes('grant') || consentState.includes('implicit') || consentState.includes('mandate')
                    if (!dt || !granted)
                        return

                    let legalb = this.dict.getName(justification)

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

                    data.push({
                        name: this.dict.getName(dt.name),
                        permission: this.dict.getName(name),
                        justification: legalb,
                        dataType: dt,
                        consentUse: this.dict.getName(consentUse)
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
                    const {name, justification, dataTypeId, consentUse} = consent
                    const dt = dataTypes[dataTypeId]

                    let legalb = this.dict.getName(justification)

                    let legalBasesOptions = [
                        {id: 'consent', name: 'Global - Consent'},
                        {id: 'impliedconsent', name: 'Global - Implied/Deemed Consent'},
                        {id: 'contract', name: 'Global - Contractual necessity'},
                        {id: 'legal', name: 'Global - Compliance with a legal obligation'},
                        {id: 'protection', name: 'Global - Protection of vital interests'},
                        {id: 'public', name: 'Global - Public interest'},
                        {id: 'legitimate', name: 'Global - Legitimate interests'},
                        {id: 'publicstudy', name: 'LGPD - Research by Public Study Entities'},
                        {id: 'legalproceedings', name: 'LGPD - Exercise of Rights in Legal Proceedings'},
                        {id: 'health', name: 'LGPD - Health Protection'},
                        {id: 'credit', name: 'LGPD - Credit Protection'},
                        {id: 'protectionoflife', name: 'LGPD - Protection of Life'},
                        {id: 'other', name: 'Custom/Other'}
                    ]
            
                    legalBasesOptions.forEach(x => {
                        if (x.id === legalb) {
                            legalb = x.name;
                        }
                    })

                    data.push({
                        name: this.dict.getName(dt.name),
                        permission: this.dict.getName(name),
                        justification: this.dict.getName(justification),
                        dataType: dt,
                        consentUse: this.dict.getName(consentUse),
                    })
                })
            })

            this.setState({data, loaded: true})
        }catch(error){
            this.setState({error: error.toString()})
        }
    }

    genenerateRowData = (entry, i) => {
        const {name, permission, justification, dataType, consentUse} = entry

        return ([
            name,
            permission,
            justification,
            <DSRButton id={"my-data-action-button-" + i} dict={this.dict} truConfig={this.props.truConfig}
                       dataType={dataType} onProcessed={this.onProcessed} pcConfig={this.props.pcConfig}/>,
            consentUse
        ])
    }

    onProcessed = (eventProcessed) => {
        let {onProcessed} = this.props;
        let messages = this.dict.getName(dsrResponseDict);

        let {code, dataType, action} = eventProcessed;
        if(code === 409) {
            this.setState({
                noticeMessage: messages[0].replace('__action__', action).replace('__dataType__', dataType), 
                dsrError: true
            });
        }
        else {
            this.setState({
                noticeMessage: messages[1].replace('__action__', action).replace('__dataType__', dataType), 
                dsrError: false
            });
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
        let {error, loaded, dsrError, noticeMessage, data} = this.state
        let {table, showAll, pcConfig} = this.props;

        let titles = this.dict.getName(dataPermBoxTitlesDict)
        let noItems = this.dict.getName(noItemsDict)

        if(error)
            display = <ErrorPanel/>;
        else if(!loaded)
            display = <LoadingInline/>;
        else{
            const body = data.map(this.genenerateRowData);
            let headers = this.dict.getName(showAll ? dataTableDict : dataTableDict2)
            const customHeaders = pcConfig ? pcConfig.columnHeaders1 || [] : []
            headers = headers.map((el, id) => customHeaders[id] || el)

            if (_.size(body)) {
                display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue" style={pcConfig.prefCentrePaneBackground}>
                {
                _.map(body, (el) => {
                    if (pcConfig.listTableMode) {
                        return <div class="relative w-100 mw9 center bt b--light-gray pv3" style={{minHeight:'15rem', ...pcConfig.prefCentreGridItemTitleFont}}>
                            <div class="w-100 flex flex-wrap">
                                <div class="w-50 ph3">
                                <h1 class="f4 mv0 lh-solid dark-blue w-100 pb2" style={{...pcConfig.prefCentreGridItemTitleFont}}>{el[0]}</h1>
                                <h1 class="f5 fw2 mv0 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[1]}</span></h1>
                                </div>
                                <div class="w-50 ph3">
                                <h1 class="f5 fw2 mv0 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> {el[2]}<br/>{el[4]}</h1><br/><br/>
                                <div class="bottom-0 left-0 tr w-50 bt b--light-gray flex pv3" >
                                {el[3]}
                                </div>
                                </div>
                            </div>
                        </div>
                    } else {
                        return <div class="relative animated fadeIn slow ma3 pb3">
                            <div class="relative w7 bg-white br4 ba b--tdark-blue pv3" style={{minHeight:'15rem', ...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>
                            <div class="w-100 flex flex-wrap items-center ">
                                <div class="w-100 ph3">
                                <h1 class="f4 mv0 lh-solid dark-blue w-100 bb b--thot-pink pb2" style={{...pcConfig.prefCentreGridItemTitleFont, ...pcConfig.prefCentreGridItemDividerColor}}>{el[0]}</h1>
                                </div>
                                <div class="w-100 ph3">
                                <h1 class="f5 fw2 mv3 lh-title blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[0]}: <span class="black" style={pcConfig.prefCentreGridItemTextFont}>{el[1]}</span></h1>
                                <h1 class="f5 fw2 mv3 lh-title" style={pcConfig.prefCentreGridItemTextFont}><span class="blue" style={pcConfig.prefCentreGridItemHighlightedTextFont}>{titles[1]}:</span> {el[2]}<br/>{el[4]}</h1><br/><br/>
                                <div class="bottom-0 right-0 tr w-100 bt b--silver pt3 flex justify-end" style={pcConfig.prefCentreGridItemDividerColor} >
                                {el[3]}
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    }
                })
                }   
                </div>
            }
            else {
                display = <div class="w-100 flex center flex-wrap pa3 justify-around bg-tru-grid-blue" style={pcConfig.prefCentrePaneBackground}><p class="f2 fw4 dark-blue ma4" style={pcConfig.prefCentreSectionTitleFont}>{noItems[1]}</p></div>
            }
        }


        return <div>
            <FadeOutNotice show={!!noticeMessage} text={noticeMessage}
                           variant={dsrError ? 'error':'success'}
                           onClose={()=>{this.setState({noticeMessage: ''})}}/>
            {display}
            </div>
    }
}

DSRWidget.propTypes = {
    ...BaseWidget.propTypes,
    table: PropTypes.object,
    pcConfig: PropTypes.object,
    dataTypeIds: PropTypes.arrayOf(PropTypes.string),
    showAll: PropTypes.bool,
    contextTags: PropTypes.arrayOf(PropTypes.string)
};

DSRWidget.defaultProps = {
    table: Table.widgetTableProps,
    pcConfig: null,
    dataTypeIds: null,
    showAll: false,
    contextTags: null
};

export default DSRWidget;