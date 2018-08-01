import * as React from 'react'
import * as BS from 'react-bootstrap'
import WidgetsPanel from './panel/screen'
import qs from "query-string"
import axios from 'axios'
import trunomi_logo from "./assets/logo.svg"

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
        const {protocol, hostname, pathname} = window.location
        let host_addr = protocol + "//" + hostname, name, logo,
            {enterpriseId, queryParams} = this.props, error = ''
        let magicLinksAllowed;

        const mockAddr = host_addr + (host_addr.includes("localhost") ? ":8343/api" : "/mock/api")
        const statsAddr = host_addr + "/enterprise-portal/stats"

        await axios.get(`${statsAddr}/magicLink-allowed/${enterpriseId}`).then((res)=>{
            magicLinksAllowed = res.data
        }).catch(()=>{
            error = `Enterprise with id ${enterpriseId} not found`
        })

        if (queryParams.magicToken && magicLinksAllowed) {
            await axios.post(`${mockAddr}/passwordless/login`, {magicToken: queryParams.magicToken}
            ).then((res) => {
                sessionStorage.setItem("TRUNOMI_USE_TOKEN", res.headers['www-authenticate'])
                delete queryParams.magicToken
                window.location = host_addr + pathname + "?" + qs.stringify(queryParams)
            }).catch((err) => {
                error = err.response.data
            })
        }

        let loggedIn = sessionStorage.getItem("TRUNOMI_USE_TOKEN") !== null

        await axios.get(`${statsAddr}/enterprise-name/${enterpriseId}`).then((res)=>{
            name = res.data || "Trunomi"
        }).catch(()=>{
            error = `Enterprise with id ${enterpriseId} not found`
        })

        await axios.get(`${statsAddr}/enterprise-icon/${enterpriseId}`).then((res)=>{
            logo = res.data || trunomi_logo
        }).catch(()=>{
            error = `Enterprise with id ${enterpriseId} not found`
        })

        this.setState({name, logo, loggedIn, loading: false, error, magicLinksAllowed, mockAddr, statsAddr})
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

        await axios.post(mockAddr + "/passwordless", {enterpriseId, username}).then(()=>{
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
    
        await axios.post(statsAddr + "/username-exists", {enterpriseId, username}).then((res)=>{
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
        const {error, emailSent, usernameVerified, username} = this.state
        const {enterpriseId} = this.props
        let formInputs
        let buttons
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
                    onChange={this.onChange}/>
                </BS.FormGroup>
            </section>

            buttons = <div style={{width:'100%'}}>
                <BS.Button bsStyle="primary" bsSize="large" type="submit" 
                        style={{width: '48%'}}>
                    Sign In
                </BS.Button>
                <p style={{display: 'inline'}}> or </p>
                <BS.Button bsStyle="success" bsSize="large" onClick={this.magicLink} style={{width:'48%'}}>
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

            buttons = <BS.Button bsStyle='primary' type='submit' block>
                Continue
            </BS.Button> 
        }

        return <form onSubmit={(usernameVerified) ? this.onSubmit : this.verifyUsername}>
            {formInputs}
            {error && <p style={{color: 'red'}}>
                <strong><i className="icon-attention"/> {error}</strong>
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
                <strong><i className="icon-attention"/> {error}</strong>
            </p>}
            <BS.Button bsStyle="primary" bsSize="large" type='submit' block>
                Sign In
            </BS.Button>
            {this.forgotPassBtn()}
        </form>
    }

    forgotPassBtn = () => {
        return  <BS.Button bsStyle="link" className="float-right" bsSize="large" style={{paddingTop: '7px'}}
            href={"/portal/forgot-password/" + this.props.enterpriseId}>
            Forgot Password?
        </BS.Button>
    }

    renderModal = () => {
        let {loggedIn, name, logo, magicLinksAllowed} = this.state

        return  <BS.Modal show={!loggedIn} style={{minWidth: '600px'}}>
            <BS.Modal.Body style={{padding: '25px'}}>
                <img className="enterprise-logo" style={{position: 'absolute'}} src={logo}/>
                <h1 className="text-center">{name}</h1>
                {magicLinksAllowed ? this.magicLinkForm() : this.baseLogInForm()}
            </BS.Modal.Body>
        </BS.Modal>
    }

    render() {
        let {loggedIn, loading} = this.state

        let display = null

        if (!loading)
            display = <section>
                {this.renderModal()}
                {loggedIn && <section>
                    <WidgetsPanel title="Preferences Centre" managed/>
                </section>}
            </section>

        return display
    }
}

export default class PrefCentre extends React.Component {
    render() {
        let queryParams = qs.parse(this.props.location.search),
            managed = (queryParams.managed === null)

        if (managed)
            return <ManagedPrefCentre enterpriseId={queryParams.enterpriseId} queryParams={queryParams}/>

        return <WidgetsPanel title="Preferences Centre"/>
    }
}