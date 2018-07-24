import React, {Component} from 'react';
import * as BS from 'react-bootstrap';
import {NewConsents,
    UserPreferences} from '../index';
import DeveloperOptions from './subcomponents/developerOptions';
import WidgetButtons from './subcomponents/widgetButtons';
import DeveloperButton from './subcomponents/developerButton';
import Cookies from 'universal-cookie';
import ConfigModal from "./subcomponents/configModal";
import Settings from './subcomponents/settings';
import _ from 'lodash';
import '../assets/style/css/bootstrap.min.css'
import API from '../config/api';
import {Grid} from '@material-ui/core';
import {AppBar, Toolbar} from "@material-ui/core";
import Logo from '../assets/logo.svg'

class PanelScreen extends Component {
    constructor(props) {
        super(props);

        this.prefParams = UserPreferences.defaultProps
        this.prefParams.onProcessed = (err, newConsent) => {
            if (!err && newConsent)
                this.setState({newConsents: this.state.newConsents - 1})
        }

        this.newConsentParams = NewConsents.defaultProps
        this.newConsentParams.onSuccess = () => {this.setState({newConsents: this.state.newConsents - 1})}

        this.state = {
            show: true,
            Widget: UserPreferences,
            params: UserPreferences.defaultProps,
            randKey: Math.random(),
            dev: false,
            config: null,
            configModal: false,
            newConsents: null
        };
        this.cookie = new Cookies();
    }

    async componentWillMount() {
        let cookies = this.cookie.get('tru_config'),
            token = window.sessionStorage.getItem('TRUNOMI_USE_TOKEN');

        let host_addr = window.location.protocol + "//" + window.location.hostname, config, newConsents = 0
        
        if (token){
            config =  {
                jwtToken: token,
                host_addr: host_addr
            }
        }
        else if (cookies)
            config = cookies

        if (this.props.prefCentre) {
            let api = new API(config);

            let consents = await api.getNewConsents(true);

            newConsents = consents.length;
        }

        this.setState({config, newConsents})
    }

    chooseWidget = (widget) => {
        let params = widget.defaultProps

        if (widget === NewConsents){
            params = this.newConsentParams
        }
        else if(widget === UserPreferences){
            params = this.prefParams
        }

        this.setState({Widget: widget, params})
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

    saveConfig = async (event, staticAuth) => {
        event.preventDefault();
        this.cookie.remove('tru_config');

        let config;
        if(staticAuth) {
            config = {
                apiToken: event.target.elements[0].value,
                host_addr: event.target.elements[1].value,
                enterpriseId: event.target.elements[2].value,
                customerId: event.target.elements[3].value,
                locale: event.target.elements[4].value
            };
        } else {
            config = {
                jwtToken: event.target.elements[0].value,
                host_addr: event.target.elements[1].value
            };
        }

        let api = new API(config),
            consents = await api.getNewConsents(true);

        this.cookie.set('tru_config', config)

        this.setState({
            config,
            configModal: false,
            randKey: Math.random(),
            newConsents: consents.length
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
        let {Widget, dev, config, randKey, params, newConsents} = this.state;

        if (config) {
            return (
                <Grid container className="main-section">
                    <Grid item sm={12} hidden>
                        <WidgetButtons widget={Widget} chooseWidget={this.chooseWidget} prefCentre={this.props.prefCentre}
                                       newConsents={newConsents} managed={this.props.managed}/>
                        {!this.props.prefCentre && <DeveloperButton dev={dev} stateChange={this.stateChange}/>}
                        <DeveloperOptions {...this.state} updateJSON={this.updateJSON}
                                          stateChange={this.stateChange}/>
                    </Grid>
                    <Grid item sm={12}>
                        <Widget {...params} truConfig={config} key={randKey} />
                    </Grid>
                </Grid>
            )
        }
    }

    logout = () => {
        sessionStorage.removeItem("TRUNOMI_USE_TOKEN")
        location.reload()
    }

    render() {
        let {config, configModal} = this.state;
        let {title, managed} = this.props;


        return <Grid container>
            <AppBar color="inherit" position='sticky' style={{top: 0}}>
                <Toolbar>
                    <span className="navbar-logo">
                        <img src={Logo} />
                    </span>
                    <span className="navbar-logout">{managed && <a onClick={this.logout}>Logout</a>}</span>
                </Toolbar>
            </AppBar>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
                <h1>
                    <b>{title}</b>
                </h1>
                {!managed && <p className='float-right'><Settings stateChange={this.stateChange}/></p>}
                <ConfigModal    show={configModal}
                                {...config}
                                onSubmit={this.saveConfig}
                                onHide={()=>{this.setState({configModal: false})}} />
                <hr/>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
                {this.loginScreen()}
                {this.widgetsScreen()}
            </Grid>
            <Grid item xs={2}></Grid>
        </Grid>
    }
}

PanelScreen.defaultProps = {
    title: '',
    prefCentre: true
}

export default PanelScreen
