import React, {Component} from 'react';
import * as BS from 'react-bootstrap';
import {CaptureConsent,
    CaptureDSR,
    Trucert,
    UserPreferences} from '../index';
import DeveloperOptions from './subcomponents/developerOptions';
import WidgetButtons from './subcomponents/widgetButtons';
import DeveloperButton from './subcomponents/developerButton';
import Cookies from 'universal-cookie';
import ConfigModal from "./subcomponents/configModal";
import Settings from './subcomponents/settings';
import _ from 'lodash';
import '../assets/style/css/bootstrap.min.css'

class PanelScreen extends Component {
    constructor(props) {
        super(props);

        this.state = {
            show: true,
            Widget: UserPreferences,
            params: UserPreferences.defaultProps,
            randKey: Math.random(),
            dev: false,
            config: null,
            configModal: false
        };
        this.cookie = new Cookies();
    }

    componentWillMount() {
        let cookies = this.cookie.get('tru_config'),
            token = window.sessionStorage.getItem('TRUNOMI_USE_TOKEN');

        let host_addr = window.location.protocol + "//" + window.location.hostname;
        
        if (token){
            this.setState({
                config: {
                    jwtToken: token,
                    host_addr: host_addr
                }
            })
        }
        else if (cookies)
            this.setState({config: cookies});
    }

    chooseWidget = (widget) => {
        this.setState({Widget: widget, params: widget.defaultProps})
    }

    updateJSON = (edit, config) => {
        let {updated_src, new_value, existing_value} = edit;

        if(existing_value !== null && typeof existing_value !== typeof new_value)
            return false;

        //The random key is to force the component to remount after a change in the props
        if(config)
            this.setState({config: updated_src, randKey: Math.random()});
        else
            this.setState({params: updated_src, randKey: Math.random()});
    }

    saveConfig = (event, staticAuth) => {
        event.preventDefault();
        this.cookie.remove('tru_config');

        let config;
        if(staticAuth) {
            config = {
                apiToken: event.target.elements[0].value,
                host_addr: event.target.elements[1].value,
                enterpriseId: event.target.elements[2].value,
                customerId: event.target.elements[3].value

            };
        } else {
            config = {
                jwtToken: event.target.elements[0].value,
                host_addr: event.target.elements[1].value
            };
        }

        this.cookie.set('tru_config', config)

        this.setState({
            config: config,
            configModal: false,
            randKey: Math.random()
        });
    }

    stateChange = (states) => {
        let obj = {}
        if (_.size(states)) {
            _.map(states, (state) => {
                if (_.size(state)) {
                    _.map(state, (value, key) => {
                        obj[key] = value
                    })
                }
            })
        }

        this.setState(obj)
    }

    loginScreen = () => {
        let {prefCentre} = this.props;

        let text = prefCentre ? 'a sample Preferences Centre' : 'the Trunomi widgets using live data'
        if (!this.state.config) {
            return (
                <BS.Grid className="main-section">
                    <BS.Col md={12}>
                        <h1 style={{textAlign: "center"}}>
                            <small>This page allows you to preview {text} <br/><br/>
                            Please click on <Settings stateChange={this.stateChange}/> to configure the previewer
                            </small>
                        </h1>
                    </BS.Col>
                </BS.Grid>
            )
        }
    }

    widgetsScreen = () => {
        let {Widget, dev, config, randKey, params} = this.state;
        if (config) {
            return (
                <BS.Grid className="main-section">
                    <BS.Col md={4}>
                        <WidgetButtons widget={Widget}  chooseWidget={this.chooseWidget} prefCentre={this.props.prefCentre}/>
                        {!this.props.prefCentre && <DeveloperButton dev={dev} stateChange={this.stateChange}/>}
                        <DeveloperOptions {...this.state} updateJSON={this.updateJSON}
                                          stateChange={this.stateChange}/>
                    </BS.Col>
                    <BS.Col md={8}>
                        <Widget {...params} truConfig={config} key={randKey} />
                    </BS.Col>
                </BS.Grid>
            )
        }
    }

    render() {
        let {config, configModal} = this.state;
        let {title} = this.props;

        return <div>
            <ConfigModal show={configModal} {...config} onSubmit={this.saveConfig}
                         onHide={()=>{this.setState({configModal: false})}}/>
            <BS.Grid>
                <BS.Col md={12}>
                    <h1>
                        <b>{title}</b>
                        <p className='float-right'><Settings stateChange={this.stateChange} /></p></h1>
                    <hr/>
                </BS.Col>
            </BS.Grid>
            {this.loginScreen()}
            {this.widgetsScreen()}
        </div>
    }
}

PanelScreen.defaultProps = {
    title: '',
    prefCentre: true
}

export default PanelScreen
