import * as React from 'react'
import * as BS from 'react-bootstrap'
import WidgetsPanel from './panel/screen'
import qs from "query-string"
import axios from 'axios'
import trunomi_logo from "./assets/logo.svg"

const logOut = {
    position: "absolute",
    bottom: '5%',
    right: '5%'
}

class ManagedPrefCentre extends React.Component {
    state = {
        loggedIn: false,
        loading: true
    }

    componentWillMount = async () => {
        this.setState({loading: true})
        let host_addr = window.location.protocol + "//" + window.location.hostname, name, logo,
            {enterpriseId} = this.props, error = ''

        let loggedIn = sessionStorage.getItem("TRUNOMI_USE_TOKEN") !== null

        await axios.get(host_addr + "/enterprise-portal/stats/enterprise-name/" + enterpriseId).then((res)=>{
            name = res.data || "Trunomi"
        }).catch(()=>{
            error = `Enterprise with id ${enterpriseId} not found`
        })

        await axios.get(host_addr + "/enterprise-portal/stats/enterprise-icon/" + enterpriseId).then((res)=>{
            logo = res.data || trunomi_logo
        }).catch(()=>{
            error = `Enterprise with id ${enterpriseId} not found`
        })

        this.setState({name, host_addr, logo, loggedIn, loading: false, error})
    }

    onSubmit = async (event) => {
        event.preventDefault()

        let {host_addr} = this.state

        await axios({
            method: 'post',
            url: host_addr.includes("localhost") ? "http://localhost:8343/api/login" : host_addr + "/mock/api/login",
            data: {
                username: event.target.elements[0].value,
                password: event.target.elements[1].value,
                enterpriseId: this.props.enterpriseId
            }
        }).then(async (res) => {
            await axios({
                method: 'post',
                url: host_addr + '/auth',
                headers:{
                    Authorization: res.headers['x-trunomi-www-authenticate']
                }
            })
            .then((res) => {
                sessionStorage.setItem("TRUNOMI_USE_TOKEN", res.headers['www-authenticate'])
                this.setState({loggedIn: true, error: ""})
            })
        })
        .catch((err) => {
            this.setState({error: err.response.data})
        })
    }

    renderModal = () => {
        let {loggedIn, error, name, logo} = this.state

        return  <BS.Modal show={!loggedIn}>
            <BS.Modal.Body>
                <img className="enterprise-logo" style={{position: 'absolute'}} src={logo}/>
                <h1 className="text-center">{name}</h1>
                <form onSubmit={this.onSubmit}>
                    <BS.FormGroup>
                        <BS.ControlLabel>User</BS.ControlLabel>
                        <BS.FormControl placeholder="User" type="text" />
                    </BS.FormGroup>
                    <BS.FormGroup>
                        <BS.ControlLabel>Password</BS.ControlLabel>
                        <BS.FormControl placeholder="Password" type="password" />
                    </BS.FormGroup>
                    {error && <BS.Alert bsStyle="danger" onDismiss={()=>{this.setState({error: ""})}}>
                        <strong><i className="icon-attention"/> {error}</strong>
                    </BS.Alert>}
                    <BS.Button bsStyle="primary" bsSize="large" type="submit" block>
                        Log In
                    </BS.Button>
                </form>
            </BS.Modal.Body>
        </BS.Modal>
    }

    logOut = () => {
        sessionStorage.removeItem("TRUNOMI_USE_TOKEN")
        this.setState({loggedIn: false})
    }

    render() {
        let {loggedIn, loading} = this.state

        let display = null

        if (!loading)
            display = <section>
                {this.renderModal()}
                {loggedIn && <section>
                    <WidgetsPanel title="Preferences Centre" managed/>
                    <BS.Button style={logOut} bsStyle="link" onClick={this.logOut}>
                        Log Out
                    </BS.Button>
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
            return <ManagedPrefCentre enterpriseId={queryParams.enterpriseId}/>

        return <WidgetsPanel title="Preferences Centre"/>
    }
}