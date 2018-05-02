import * as React from 'react';
import {ConsentsWidget,
    ActiveDSRWidget,
    DSRWidget,
    UserPreferences} from '../../index';
import NewDSR from '../../widgets/NewDSR';
import NewConsents from "../../widgets/NewConsents";
import TrucertSelector from "./trucertSelector";

export default class extends React.Component {

    constructor(props){
        super(props);
        this.state = {
            newConsents: this.props.newConsents
        };
    }

    Button = (widgetButton, text, newConsents) => {
        let {widget, chooseWidget} = this.props;
        let cName = 'widget-button';
        cName += (widgetButton===widget) ? ' widget-button-active' : '';

        return <div>
            <button style={{width: '75%'}} className={cName}
                    onClick={() => chooseWidget(widgetButton)}>
                {text} {newConsents !== undefined ? `(${newConsents})` : ''}
            </button>
            <br/>
        </div>
    };

    componentWillReceiveProps = (newProps) => {
        this.setState({newConsents: newProps.newConsents})
    }

    prefCentreButtons = () => {
        let {prefCentre} = this.props;

        if (prefCentre) {
            return (<div>
                    {this.Button(UserPreferences, 'My Preferences')}
                    {this.Button(NewConsents, 'New Permissions', this.state.newConsents)}
                </div>
            )
        }
    };

    widgetButtons = () => {
        let {prefCentre} = this.props;

        if (!prefCentre) {
            return (<div>
                    {this.Button(UserPreferences, 'User Preferences')}
                    {this.Button(ConsentsWidget, 'My Permissions')}
                    {this.Button(DSRWidget, 'My Data')}
                    {this.Button(ActiveDSRWidget, 'Data Subject Requests')}
                    {this.Button(NewDSR, 'New DSR')}
                    {this.Button(NewConsents, 'New Permission')}
                    {this.Button(TrucertSelector, 'Sample Trucert')}
                </div>
            )
        }
    };


    render() {
        return (<div>
                {this.widgetButtons()}
                {this.prefCentreButtons()}
            </div>
        )
    }
}