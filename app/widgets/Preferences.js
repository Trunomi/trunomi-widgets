import React from 'react'
import * as BS from 'react-bootstrap'
import Logo from '../components/Logo'
import ConsentsWidget from "./Consent"
import ActiveDSRWidget from "./ActiveDSR"
import DSRWidget from "./DSR"
import propTypeTruConfig from '../config/customPropType'
import PropTypes from 'prop-types'
import {ExpansionPanel, ExpansionPanelSummary, Typography} from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {pannelTitlesDict} from '../config/widgetDict'
import Locale from '../config/locale'

class UserPreferences extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
        
        this.dict = new Locale(props.truConfig ? props.truConfig.locale || '' : '');
    }

    refreshRights = () => {
        if (this.refs.ActiveDSR)
            this.refs.ActiveDSR.refreshData()
    }

    refreshData = (err, newConsent) => {
        if(!err && newConsent && this.refs.MyData)
            this.refs.MyData.refreshData()
    }

    panel = (title = {}, body = {}) => {
        if (_.size(title) && _.size(body)) {
            let {pcConfig} = this.props
            let { text, pane } = title
            let { Widget, props } = body
            const {paneHeadersFont, paneBackground, tableBody} = pcConfig

            return <ExpansionPanel className="expansion-panel">
                <ExpansionPanelSummary id={pane} style={paneBackground} className={"expansion-panel-summary"} expandIcon={<ExpandMoreIcon />}>
                    <Typography style={paneHeadersFont} variant="title">{text}</Typography>
                </ExpansionPanelSummary>
                <div className="expansion-panel-details">
                    <Widget {...props} />
                </div>
            </ExpansionPanel>

        }
    }

    render() {
        let {truConfig, title, consentPane, consentTitle, dataPane, disableRevoke, contextTags,
            dataTitle, dsrPane, dsrTitle, helpLink, dataTypeIds, contextIds, pcConfig} = this.props

        const {paneHeadersText, show} = pcConfig
        const titlesDict = this.dict.getName(pannelTitlesDict)

        let consentPaneTitle = {
            text: (paneHeadersText && paneHeadersText[0]) || consentTitle || titlesDict[0],
            pane: 'pane1'
        }

        let consentPaneBody = {
            Widget: ConsentsWidget,
            props: {
                truConfig: truConfig,
                pcConfig: pcConfig,
                onProcessed: this.refreshData,
                contextIds,
                disableRevoke,
                contextTags
            }
        }

        let dataPaneTitle = {
            text: (paneHeadersText && paneHeadersText[1]) || dataTitle || titlesDict[1],
            pane: 'pane2'
        }

        let dataPaneBody = {
            Widget: DSRWidget,
            props: {
                truConfig: truConfig,
                onProcessed: this.refreshRights,
                ref: "MyData",
                pcConfig: pcConfig,
                dataTypeIds,
                contextTags
            }
        }

        let dsrPaneTitle = {
            text: (paneHeadersText && paneHeadersText[2]) || dsrTitle || titlesDict[2],
            pane: 'pane3'
        }

        let dsrPaneBody = {
            Widget: ActiveDSRWidget,
            props: {
                truConfig: truConfig,
                pcConfig: pcConfig,
                ref: "ActiveDSR",
                dataTypeIds
            }
        }

        return (
            <div>
                {(title || helpLink) && <h3 id={'wTitle'}>{title}<Logo link={helpLink}/></h3>}
                <BS.PanelGroup id='User Preferences'>
                    {(!show || show[0]) && consentPane && this.panel(consentPaneTitle, consentPaneBody)}
                    {(!show || show[1]) && dataPane && this.panel(dataPaneTitle, dataPaneBody)}
                    {(!show || show[2]) && dsrPane && this.panel(dsrPaneTitle, dsrPaneBody)}
                </BS.PanelGroup>
            </div>
        )
    }
}

UserPreferences.defaultProps = {
    title: '',
    consentPane: true,
    consentTitle: '',
    dataPane: true,
    dataTitle: '',
    dsrPane: true,
    dsrTitle: '',
    helpLink: '',
    contextIds: null,
    dataTypeIds: null,
    contextTags: null,
    style: {},
    pcConfig: {},
    disableRevoke: {}
}

UserPreferences.propTypes = {
    truConfig: propTypeTruConfig,
    title: PropTypes.string,
    consentPane: PropTypes.bool,
    consentTitle: PropTypes.string,
    dataPane: PropTypes.bool,
    dataTitle: PropTypes.string,
    dsrPane: PropTypes.bool,
    dsrTitle: PropTypes.string,
    helpLink: PropTypes.string,
    contextIds: PropTypes.arrayOf(PropTypes.string),
    dataTypeIds: PropTypes.arrayOf(PropTypes.string),
    contextTags: PropTypes.arrayOf(PropTypes.string),
    style: PropTypes.object,
    disableRevoke: PropTypes.object
}

export default UserPreferences