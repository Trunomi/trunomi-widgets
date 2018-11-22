import * as React from 'react'
import * as BS from 'react-bootstrap'
import WidgetsPanel from './panel/screen'
import qs from "query-string"
import axios from 'axios'
import trunomi_logo from "./assets/logo.svg"
import {MuiThemeProvider} from '@material-ui/core'
import theme from './materialTheme'
import {loadConfigurations, enterprise_logo, enterprise_name, enterprise_magicLink_allowed, pcConfig} from './config/enterprise-config'
import ErrorIcon from '@material-ui/icons/ErrorOutline'
import api_addr from './config/env'
import Cookies from 'universal-cookie';

class ManagedPrefCentre extends React.Component {
    state = {
        loggedIn: false,
        loading: true,
        username: "",
        password: "",
        emailSent: false,
        usernameVerified: false
    }

    componentWillMount = async () => {
        this.setState({loading: true})
        const {origin, pathname} = window.location
        let {queryParams, error} = this.props

        // For when preview has been used right before using ?managed
        const cookie = new Cookies()
        cookie.remove("tru_config")

        const mockAddr = api_addr + (api_addr.includes("local") ? ":8343/api" : "/mock/api")
        const statsAddr = api_addr + "/enterprise-portal/stats"

        if (queryParams.magicToken && enterprise_magicLink_allowed) {
            await axios.post(`${mockAddr}/passwordless/login`, {magicToken: queryParams.magicToken}
            ).then((res) => {
                sessionStorage.setItem("TRUNOMI_USE_TOKEN", res.headers['www-authenticate'])
                delete queryParams.magicToken
                window.location = origin + pathname + "?" + qs.stringify(queryParams)
            }).catch((err) => {
                error = err.response.data
            })
        }

        let loggedIn = sessionStorage.getItem("TRUNOMI_USE_TOKEN") !== null

        this.setState({
            loggedIn,
            loading: false,
            error: error,
            mockAddr,
            statsAddr
        })
    }

    onSubmit = async (event) => {
        event.preventDefault()
        let {username, password, mockAddr} = this.state, {enterpriseId} = this.props

        await axios.post(mockAddr + "/login/v2", {username, password, enterpriseId}).then((res) => {
            sessionStorage.setItem("TRUNOMI_USE_TOKEN", res.headers['www-authenticate'])
            this.setState({loggedIn: true, error: "", emailSent: false})
        })
        .catch((err) => {
            this.setState({error: err.response.data, emailSent: false})
        })
    }

    magicLink = async () => {
        let {username, mockAddr} = this.state, {enterpriseId} = this.props

        await axios.post(mockAddr + "/passwordless", {enterpriseId, email:username}).then(()=>{
            this.setState({emailSent: true, error: ''})
        }).catch((err)=>{
            this.setState({error: err.response.data, emailSent: false})
        })
    }

    onChange = (event) => {
        event.preventDefault()
        const {value, name} = event.target
        this.setState({[name]: value})
    }

    verifyUsername = async (event) => {
        event.preventDefault()
        const {statsAddr, username} = this.state
        const {enterpriseId} = this.props

        await axios.get(statsAddr + `/email-exists/${username}/${enterpriseId}`).then((res)=>{
            let error = ''
            let usernameVerified = false
            if (res.data === true)
                usernameVerified = true
            else
                error = 'Username not found'
            this.setState({error, usernameVerified})
        }).catch((err)=>{
            this.setState({error: err.response.data})
        })

    }

    magicLinkForm = () => {
        const {error, emailSent, usernameVerified, username, password} = this.state
        const {enterpriseId} = this.props
        let formInputs
        let buttons
        let disabled = password === ''
        if (usernameVerified){
            formInputs = <section>
                <p>
                    {username}
                    <BS.Button bsStyle='link'
                        onClick={()=>{this.setState({usernameVerified: false, error: '', emailSent: false})}}>
                        Change
                    </BS.Button>
                </p>
                <BS.FormGroup>
                    <BS.ControlLabel>Password</BS.ControlLabel>
                    <BS.FormControl placeholder="Password" type="password" name='password' required autoFocus
                    onChange={this.onChange} />
                </BS.FormGroup>
            </section>

            buttons = <div style={{width:'100%'}}>
                <BS.Button bsStyle="primary" bsSize="large" type="submit"  disabled={disabled}
                        style={{width: '48%', fontSize: 14}}>
                    Sign In
                </BS.Button>
                <p style={{display: 'inline', width: '5%'}}> or </p>
                <BS.Button bsStyle="success" bsSize="large" onClick={this.magicLink} style={{width:'47%', fontSize: 14}}>
                    Get a direct link in your email
                </BS.Button>
                {this.forgotPassBtn()}
            </div>
        }
        else {
            formInputs = <section>
                <BS.FormGroup>
                    <BS.ControlLabel>User</BS.ControlLabel>
                    <BS.FormControl placeholder="User" type="text" name='username' required autoFocus
                    onChange={this.onChange} value={username}/>
                </BS.FormGroup>
            </section>

            buttons = <BS.Button bsStyle='primary' type='submit' block disabled={username === ''}>
                Continue
            </BS.Button>
        }

        return <form onSubmit={(usernameVerified) ? this.onSubmit : this.verifyUsername}>
            {formInputs}
            {error && <p style={{color: 'red'}}>
                <strong><ErrorIcon/> {error}</strong>
            </p>}
            {emailSent && <p style={{color: 'green'}}>
                <strong><BS.Glyphicon glyph="envelope" /> An email was sent to your email address</strong>
            </p>}
            {buttons}
        </form>
    }

    baseLogInForm = () => {
        const {error} = this.state
        return  <form onSubmit={this.onSubmit}>
            <BS.FormGroup>
                <BS.ControlLabel>User</BS.ControlLabel>
                <BS.FormControl placeholder="User" type="text" name='username' required
                onChange={this.onChange}/>
            </BS.FormGroup>
            <BS.FormGroup>
                <BS.ControlLabel>Password</BS.ControlLabel>
                <BS.FormControl placeholder="Password" type="password" name='password' required
                onChange={this.onChange}/>
            </BS.FormGroup>
            {error && <p style={{color: 'red'}}>
                <strong><ErrorIcon/> {error}</strong>
            </p>}
            <BS.Button bsStyle="primary" bsSize="large" type='submit' block>
                Sign In
            </BS.Button>
            {this.forgotPassBtn()}
        </form>
    }

    forgotPassBtn = () => {
        return <BS.Button bsStyle="link" className="float-right" bsSize="large" style={{paddingTop: '7px', fontSize: 14}}
            href={api_addr + "/portal/forgot-password/" + this.props.enterpriseId}>
            Forgot Password?
        </BS.Button>
    }

    renderModal = () => {
        let {loggedIn} = this.state

        return  <BS.Modal show={!loggedIn} style={{minWidth: '600px'}}>
            <BS.Modal.Body style={{padding: '25px'}}>
                <img className="enterprise-logo" style={{position: 'absolute'}} src={enterprise_logo || trunomi_logo}/>
                <h1 className="text-center">{enterprise_name}</h1>
                {enterprise_magicLink_allowed ? this.magicLinkForm() : this.baseLogInForm()}
            </BS.Modal.Body>
        </BS.Modal>
    }

    render() {
        let {loggedIn, loading} = this.state

        let display = null
        const DPO = sessionStorage.getItem('TRUNOMI_DPO')

        if (!loading)
            display = <section>
                {this.renderModal()}
                {loggedIn && <section>
                    <WidgetsPanel title={<span>Preferences Centre {DPO ? <small>managed by {DPO}</small> : null}</span>} managed/>
                </section>}
            </section>

        return display
    }
}

export default class PrefCentre extends React.Component {
    state = {
        queryParams: null,
        loaded: false,
        error: ''
    }

    componentWillMount = async () => {
        const queryParams = qs.parse(this.props.location.search)
        const {enterpriseId} = queryParams

        const idOk = await loadConfigurations(enterpriseId)
        this.setState({loaded: true, error: idOk ? '' : `Enterprise with ID: ${enterpriseId} not found`, queryParams})
    }

    render() {
        const {queryParams, loaded, error} = this.state
        if (!loaded)
            return null

        const managed = (queryParams.managed !== undefined)
        const {background} = pcConfig

        return <div style={{height: '100%', overflowY: 'scroll', ...background}}>
            <MuiThemeProvider theme={theme()}>
                {managed ?
                    <ManagedPrefCentre enterpriseId={queryParams.enterpriseId} error={error} queryParams={queryParams}/>
                :
                    <WidgetsPanel title="Preferences Centre"/>}
            </MuiThemeProvider>
        </div>
    }
}