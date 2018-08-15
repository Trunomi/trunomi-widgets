import * as React from 'react';
import {ConsentsWidget,
    ActiveDSRWidget,
    DSRWidget,
    UserPreferences} from '../../index';
import NewDSR from '../../widgets/NewDSR';
import NewConsents from "../../widgets/NewConsents";
import TrucertSelector from "./trucertSelector";
import * as BS from 'react-bootstrap';
import {Button, Typography} from '@material-ui/core'

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            newConsents: this.props.newConsents,
        };
    }

    Button = (widgetButton, text) => {
        let {chooseWidget} = this.props;
        return <Button onClick={() => chooseWidget(widgetButton)} color='primary' className='navbar-menu-button'>
            {text}
        </Button>
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({newConsents: newProps.newConsents})
    }

    logOut = () => {
        sessionStorage.removeItem("TRUNOMI_USE_TOKEN")
        location.reload()
    }

    prefCentreButtons = () => {
        let {prefCentre, managed} = this.props;

        if (prefCentre) {
            return <div>
                {this.Button(UserPreferences, 'My Data Preferences')}
                {managed && <BS.Button className='widget-button' bsStyle="link" style={{width: '75%'}}
                                        onClick={this.logOut}>
                    Log Out
                </BS.Button>}
                {/*{this.Button(NewConsents, 'New Permissions', this.state.newConsents)}*/}
            </div>
        }
    };

    widgetButtons = () => {
        let {prefCentre} = this.props;
        if (prefCentre !== undefined && prefCentre === false) {
            return <span>
                {this.Button(UserPreferences, 'User Preferences')}
                {this.Button(ConsentsWidget, 'My Permissions')}
                {this.Button(DSRWidget, 'My Data')}
                {this.Button(ActiveDSRWidget, 'DSR')}
                {this.Button(NewDSR, 'New DSR')}
                {this.Button(NewConsents, 'New Permission')}
                {this.Button(TrucertSelector, 'Sample Trucert')}
            </span>
        }

    };


    render() {
        return <span className='widget-buttons'>
            {this.widgetButtons()}
        </span>
    }
}