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
import {pcConfig} from '../config/enterprise-config'

class UserPreferences extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
        }
    }

    refreshRights = () => {
        this.refs.ActiveDSR.refreshData()
    }

    refreshData = (err, newConsent) => {
        if(!err && newConsent)
            this.refs.MyData.refreshData()
    }

    panel = (title = {}, body = {}) => {
        if (_.size(title) && _.size(body)) {
            let { text, pane } = title
            let { Widget, props } = body
            const {paneHeadersFont, paneBackground, tableBody} = pcConfig

            return <ExpansionPanel className="expansion-panel">
                <ExpansionPanelSummary id={pane} style={paneBackground} className={"expansion-panel-summary"} expandIcon={<ExpandMoreIcon />}>
                    <Typography style={paneHeadersFont} variant="title">{text.toUpperCase()}</Typography>
                </ExpansionPanelSummary>
                <div className="expansion-panel-details">
                    <Widget {...props} />
                </div>
            </ExpansionPanel>

        }
    }

    render() {
        let {truConfig, title, consentPane, consentTitle, dataPane, disableRevoke, contextTags,
            dataTitle, dsrPane, dsrTitle, helpLink, dataTypeIds, contextIds} = this.props

        const {paneHeadersText, columnHeaders0, columnHeaders1, columnHeaders2, show} = pcConfig

        let consentPaneTitle = {
            text: (paneHeadersText && paneHeadersText[0]) || consentTitle,
            pane: 'pane1',
            iconClass: 'icon-commenting-o'
        }, consentPaneBody = {
            Widget: ConsentsWidget,
            props: {
                truConfig: truConfig,
                onProcessed: this.refreshData,
                contextIds,
                disableRevoke,
                contextTags,
                headers: columnHeaders0
            }
        }, dataPaneTitle = {
            text: (paneHeadersText && paneHeadersText[1]) || dataTitle,
            pane: 'pane2',
            iconClass: "icon-address-card-o"
        }, dataPaneBody = {
            Widget: DSRWidget,
            props: {
                truConfig: truConfig,
                onProcessed: this.refreshRights,
                ref: "MyData",
                dataTypeIds,
                contextTags,
                headers: columnHeaders1
            }
        }, dsrPaneTitle = {
            text: (paneHeadersText && paneHeadersText[2]) || dsrTitle,
            pane: 'pane3',
            iconClass: "icon-exchange"
        }, dsrPaneBody = {
            Widget: ActiveDSRWidget,
            props: {
                truConfig: truConfig,
                ref: "ActiveDSR",
                dataTypeIds,
                headers: columnHeaders2
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
    consentTitle: 'My Permissions',
    dataPane: true,
    dataTitle: 'My Data',
    dsrPane: true,
    dsrTitle: 'My Data Requests',
    helpLink: '',
    contextIds: null,
    dataTypeIds: null,
    contextTags: null,
    style: {},
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