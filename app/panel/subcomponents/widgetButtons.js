import * as React from 'react';
import {ConsentsWidget,
    ActiveDSRWidget,
    DSRWidget,
    UserPreferences,
    startSession,
    stopSession} from '../../index';
import NewDSR from '../../widgets/NewDSR';
import NewConsents from "../../widgets/NewConsents";
import API from '../../config/api';
import TrucertSelector from "./trucertSelector";
import Cookies from 'universal-cookie';


export default class extends React.Component {

    constructor(){
        super();
        this.state = {};
    }

    Button = (widgetButton, text, newC) => {
        let {widget, chooseWidget} = this.props;
        let cName = 'widget-button';
        cName += (widgetButton===widget) ? ' widget-button-active' : '';

        return <div>
            <button style={{width: '75%'}} className={cName}
                    onClick={() => chooseWidget(widgetButton)}>
                {text} {newC ? `(${newC})` : ''}
            </button>
            <br/>
        </div>
    };

    prefCentreButtons = () => {
        let {prefCentre} = this.props;

        if (prefCentre) {
            return (<div>
                    {this.Button(UserPreferences, 'My Preferences')}
                    {this.Button(NewConsents, 'New Consents', this.state.newC)}
                </div>
            )
        }
    };

    componentWillMount = async () => {
        if (this.props.prefCentre) {
            let cookies = new Cookies,
                config = cookies.get('tru_config'),
                api = new API(config);

            let consents = await api.getNewConsents();

            this.setState({newC: consents.length});
        }
    };

    widgetButtons = () => {
        let {prefCentre} = this.props;

        if (!prefCentre) {
            return (<div>
                    {this.Button(UserPreferences, 'User Preferences')}
                    {this.Button(ConsentsWidget, 'My Consents')}
                    {this.Button(DSRWidget, 'My Data')}
                    {this.Button(ActiveDSRWidget, 'Data Subject Requests')}
                    {this.Button(NewDSR, 'New DSR')}
                    {this.Button(NewConsents, 'New Consent')}
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