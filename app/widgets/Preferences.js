import React from 'react'
import * as BS from 'react-bootstrap'
import Logo from '../components/Logo'
import ConsentsWidget from "./Consent"
import ActiveDSRWidget from "./ActiveDSR"
import DSRWidget from "./DSR"
import ExternalReceipts from "./ExternalReceipts"
import TrunomiAPI, {Session} from '../config/api'
import Fade from '@material-ui/core/Fade'

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
            pane3: false,
            pane4: false,
            externalReceipts: false
        }
    }

    componentWillMount = async () => {
        const api = Session.started ? Session.api : new TrunomiAPI(this.props.truConfig);
        const enterprise = await api.sendRequest("/data-model/enterprise/" + api.truConfig.enterpriseId)
        
        this.setState({
            externalReceipts: enterprise.config && enterprise.config.externalReceipts === true
        })
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
            dataTitle, dsrPane, dsrTitle, helpLink, dataTypeIds, contextIds, receiptsPane, receiptsTitle} = this.props

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
        }, receiptsPaneTitle = {
            text: receiptsTitle,
            pane: 'pane4'
        }, receiptsPaneBody = {
            Widget: ExternalReceipts,
            props: {
                truConfig: truConfig
            }
        }

        return (
            <div>
                {(title || helpLink) && <h3 id={'wTitle'}>{title}<Logo link={helpLink}/></h3>}
                <BS.PanelGroup id='User Preferences'>
                    {consentPane && <Fade in>{this.panel(consentPaneTitle, consentPaneBody)}</Fade>}
                    {dataPane && <Fade in timeout={200}>{this.panel(dataPaneTitle, dataPaneBody)}</Fade>}
                    {dsrPane && <Fade in timeout={400}>{this.panel(dsrPaneTitle, dsrPaneBody)}</Fade>}
                    {receiptsPane &&  <Fade in timeout={600}>{this.state.externalReceipts ? this.panel(receiptsPaneTitle, receiptsPaneBody) : <span/>}</Fade>}
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
    receiptsPane: true,
    receiptsTitle: 'External Receipts',
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
    receiptsPane: PropTypes.bool,
    receiptsTitle: PropTypes.string,
    helpLink: PropTypes.string,
    contextIds: PropTypes.arrayOf(PropTypes.string),
    dataTypeIds: PropTypes.arrayOf(PropTypes.string),
    contextTags: PropTypes.arrayOf(PropTypes.string),
    style: PropTypes.object,
    disableRevoke: PropTypes.object
}

export default UserPreferences