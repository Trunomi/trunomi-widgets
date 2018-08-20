import React, {Component} from 'react';
import jwt from 'jsonwebtoken';
import {NewConsents,
    UserPreferences} from '../index';
import DeveloperOptions from './subcomponents/developerOptions';
import WidgetButtons from './subcomponents/widgetButtons';
import DeveloperButton from './subcomponents/developerButton';
import Cookies from 'universal-cookie';
import ConfigModal from "./subcomponents/configModal";
import Settings from './subcomponents/settings';
import _ from 'lodash';
import '../assets/style/css/bootstrap-theme.min.css';
import '../assets/style/css/bootstrap.min.css';
import API, {parseToken} from '../config/api';
import {Grid} from '@material-ui/core';
import {AppBar, Toolbar, Menu, Button, MenuItem} from "@material-ui/core";
import TrunomiLogo from '../assets/logo.svg'
import {loadConfigurations, enterprise_logo, pcConfig} from '../config/enterprise-config'

class PanelScreen extends Component {
    constructor(props) {
        super(props);

        this.prefParams = UserPreferences.defaultProps

        this.state = {
            show: true,
            Widget: UserPreferences,
            params: UserPreferences.defaultProps,
            dev: false,
            config: null,
            configModal: false,
            anchorEl: false,
            newConsens: null,
            loading: true
        };
        this.cookie = new Cookies();
    }

    async componentWillMount() {
        const api = new API();
        api.loadConfig();

        this.setState({config: api.truConfig, loading: false})
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
s
        if(config)
            this.setState({config: updated_src});
        else
            this.setState({params: updated_src});
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

        //let api = new API(config)
        //consents = await api.getNewConsents(true);

        this.cookie.set('tru_config', config)

        window.location.reload()
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
                <Grid>
                    <h1 style={{textAlign: "center"}}>
                        <small>This page allows you to preview {text} <br/><br/>
                        Please click on <Settings stateChange={this.stateChange}/> to configure the previewer
                        </small>
                    </h1>
                </Grid>
            )
        }
    }

    widgetsScreen = () => {
        let {Widget, dev, config, params, newConsents} = this.state;

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
                        <Widget {...params} truConfig={config} />
                    </Grid>
                </Grid>
            )
        }
    }

    logout = () => {
        sessionStorage.removeItem("TRUNOMI_USE_TOKEN")
        sessionStorage.removeItem("TRUNOMI_DPO")
        sessionStorage.removeItem("TRUNOMI_MOC")
        location.reload()
    }

    render() {
        let {config, configModal, Widget, newConsents, anchorEl, loading} = this.state;
        let {title, managed, prefCentre} = this.props;
        
        title = pcConfig.title ? pcConfig.title.text || title : title

        if(loading){
            return null
        }

        let customerId = ''
        const jwtToken = sessionStorage.getItem('TRUNOMI_USE_TOKEN')
        if (jwtToken)
            customerId = jwt.decode(jwtToken.split(' ')[1]).aud[2]

        return <Grid container>
            <AppBar color="inherit" position='sticky' style={{top: 0, ...pcConfig.topBar}}>
                <Toolbar>
                    <span className="navbar-logo">
                        <img src={enterprise_logo || TrunomiLogo} />
                    </span>
                    <WidgetButtons widget={Widget} chooseWidget={this.chooseWidget} prefCentre={prefCentre} newConsents={newConsents} managed={managed}/>
                    <span className="navbar-logout">
                        {managed && <React.Fragment>
                            <Button
                                aria-owns={anchorEl ? 'simple-menu' : null}
                                aria-haspopup="true"
                                onClick={(e) => this.setState({anchorEl: e.currentTarget})}>
                                {customerId}
                            </Button>
                            <Menu
                                className='logout-drop'
                                id="simple-menu"
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={()=>{this.setState({anchorEl: null})}}>
                                <MenuItem onClick={this.logout}>Log Out</MenuItem>
                            </Menu>
                        </React.Fragment>}
                    </span>
                </Toolbar>
            </AppBar>
            <Grid item xs={2}></Grid>
            <Grid item xs={8}>
                <h1 className='blue-text' style={pcConfig.titleFont}>{title}</h1>
                {!managed && <p className='float-right'><Settings stateChange={this.stateChange}/></p>}
                <ConfigModal    show={configModal}
                                {...config}
                                onSubmit={this.saveConfig}
                                onHide={()=>{this.setState({configModal: false})}} />
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
