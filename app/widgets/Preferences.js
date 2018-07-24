import React from 'react'
import * as BS from 'react-bootstrap'
import Logo from '../components/Logo'
import ConsentsWidget from "./Consent"
import ActiveDSRWidget from "./ActiveDSR"
import DSRWidget from "./DSR"

import propTypeTruConfig from '../config/customPropType'
import PropTypes from 'prop-types'
import PaneHeader from './Preferences/PaneHeader'
import {ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary, Typography} from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

class UserPreferences extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pane1: false,
            pane2: false,
            pane3: false
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
            let { pane, iconClass, text } = title
            let { Widget, props } = body
            let isOpen = this.state[pane]
            let {fontFamily, headerColor} = this.props.style

            return <ExpansionPanel className="expansion-panel">
                <ExpansionPanelSummary className="expansion-panel-summary" expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="title">{text.toUpperCase()}</Typography>
                </ExpansionPanelSummary>
                <div className="expansion-panel-details">
                    <Widget {...props} />
                </div>
            </ExpansionPanel>

        }
    }

    render() {
        let {truConfig, title, consentPane, consentTitle, dataPane, disableRevoke, contextTags,
            dataTitle, dsrPane, dsrTitle, helpLink, dataTypeIds, contextIds, onProcessed} = this.props

        let consentPaneTitle = {
            text: consentTitle,
            pane: 'pane1',
            iconClass: 'icon-commenting-o'
        }, consentPaneBody = {
            Widget: ConsentsWidget,
            props: {
                truConfig: truConfig,
                onProcessed: this.refreshData,
                contextIds,
                disableRevoke,
                contextTags
            }
        }, dataPaneTitle = {
            text: dataTitle,
            pane: 'pane2',
            iconClass: "icon-address-card-o"
        }, dataPaneBody = {
            Widget: DSRWidget,
            props: {
                truConfig: truConfig,
                onProcessed: this.refreshRights,
                ref: "MyData",
                dataTypeIds,
                contextTags
            }
        }, dsrPaneTitle = {
            text: dsrTitle,
            pane: 'pane3',
            iconClass: "icon-exchange"
        }, dsrPaneBody = {
            Widget: ActiveDSRWidget,
            props: {
                truConfig: truConfig,
                ref: "ActiveDSR",
                dataTypeIds
            }
        }

        return (
            <div>
                {(title || helpLink) && <h3 id={'wTitle'}>{title}<Logo link={helpLink}/></h3>}
                <BS.PanelGroup id='User Preferences'>
                    {consentPane && this.panel(consentPaneTitle, consentPaneBody)}
                    {dataPane && this.panel(dataPaneTitle, dataPaneBody)}
                    {dsrPane && this.panel(dsrPaneTitle, dsrPaneBody)}
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