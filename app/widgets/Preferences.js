import React from 'react';
import * as BS from 'react-bootstrap';
import Logo from '../components/Logo';
import ConsentsWidget from "./Consent";
import ActiveDSRWidget from "./ActiveDSR";
import DSRWidget from "./DSR";

import propTypeTruConfig from '../config/customPropType';
import PropTypes from 'prop-types';
import PaneHeader from './Preferences/PaneHeader';

class UserPreferences extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            pane1: false,
            pane2: false,
            pane3: false
        };
    }

    refreshRights = () => {
        this.refs.DSRdisp.refreshData();
    }

    panel = (title = {}, body = {}) => {
        if (_.size(title) && _.size(body)) {
            let { pane, iconClass, text } = title;
            let { Widget, props } = body;
            let isOpen = this.state[pane];

            return (
                <BS.Panel expanded={isOpen} onToggle={() => this.setState({ [pane]: !isOpen })}>
                    <BS.Panel.Heading>
                        <BS.Panel.Title toggle>
                            <PaneHeader text={text} shown={isOpen} iconClass={iconClass} />
                        </BS.Panel.Title>
                    </BS.Panel.Heading>
                    <BS.Panel.Body collapsible>
                        <Widget {...props} />
                    </BS.Panel.Body>
                </BS.Panel>
            )
        }
    }

    render() {
        let {truConfig, title, consentPane, consentTitle, dataPane,
            dataTitle, dsrPane, dsrTitle, helpLink} = this.props;


        let consentPaneTitle = {
            text: consentTitle,
            pane: 'pane1',
            iconClass: 'icon-commenting-o'
        }, consentPaneBody = {
            Widget: ConsentsWidget,
            props: {
                truConfig: truConfig
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
                ref: "DSRs"
            }
        }, dsrPaneTitle = {
            text: dsrTitle,
            pane: 'pane3',
            iconClass: "icon-exchange"
        }, dsrPaneBody = {
            Widget: ActiveDSRWidget,
            props: {
                truConfig: truConfig,
                ref: "DSRdisp"
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
    helpLink: ''
};

UserPreferences.propTypes = {
    truConfig: propTypeTruConfig,
    title: PropTypes.string,
    consentPane: PropTypes.bool,
    consentTitle: PropTypes.string,
    dataPane: PropTypes.bool,
    dataTitle: PropTypes.string,
    dsrPane: PropTypes.bool,
    dsrTitle: PropTypes.string,
    helpLink: PropTypes.string
};

export default UserPreferences