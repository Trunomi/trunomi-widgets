import axios from 'axios';
import _ from 'lodash';
import jwt from 'jsonwebtoken';
import Locale from './locale';

function addID(page, id){
    return page + (id ? '/'+id : '')
}

class trunomiAPI{

    constructor(truConfig, refreshToken=false){
        this.truConfig = truConfig;

        let {jwtToken} = truConfig;

        if(jwtToken){
            //decode jwt and add parameters to truConfig
            let params = jwt.decode(jwtToken.split('Bearer ')[1]);

            if(params) {
                this.truConfig.enterpriseId = params.aud[1];
                this.truConfig.customerId = params.aud[2] || this.truConfig.customerId;
            }

            if(refreshToken) {
                //The refresh time can vary depending on the exp in the jwt Token, usually is 30 min.
                let refreshTime = (params.exp - params.iat - 10) * 1000;
                this.intervalID = setInterval(this.refreshToken.bind(this), 5000);
            }
        }
    }

    removeRefreshInterval(){
        clearInterval(this.intervalID);
    }

    async refreshToken(){
        const {host_addr, jwtToken} = this.truConfig;
        console.log('Attempting to refresh token')

        let authEndPoint = host_addr + '/auth', header = {headers: { Authorization: jwtToken }};

        await axios.put(authEndPoint, '', header).then((response) =>{
            this.truConfig.jwtToken = response.headers['www-authenticate'];
            console.log('JWT token refreshed');
        }).catch((error) => {
            console.log('Failed to refresh JWT token');
            this.removeRefreshInterval();
        })
    }

    async validateToken(){
        const {host_addr, jwtToken} = this.truConfig;
        console.log('Validating token with Trunomi');

        let authEndPoint = host_addr + '/auth', header = {headers: { Authorization: jwtToken }};

        await axios.post(authEndPoint, '', header).then((response) =>{
            this.truConfig.jwtToken = response.headers['www-authenticate'];
            console.log('JWT token validated');
            return true;
        }).catch((error) => {
            console.log('Failed to validate JWT token');
            return false;
        })
    }

    async checkToken(){
        const {host_addr, jwtToken} = this.truConfig;
        let authEndPoint = host_addr + '/auth', header = {headers: { Authorization: jwtToken }};
        console.log('Checking token');

        return await axios.get(authEndPoint, header).then(()=>{
            console.log('JWT token is validated');
            return true
        }).catch(async (error) => {
            console.log('JWT token is not validated');
            return false
        });
    }

    async sendRequest(page = '', method = 'GET', body = null, additionalHeaders=null) {
        const {apiToken, enterpriseId, customerId, host_addr, jwtToken} = this.truConfig;


        let headers = {
            "Content-Type": "application/json",
            "x-trunomi-version": "2017-02-28",
            ...additionalHeaders
        };

        let queryParams = '';
        if(jwtToken) {
            headers["authorization"] = jwtToken;
        }
        else {
            headers["X-Trunomi-Enterprise-Api-Token"] = apiToken;
            headers["X-Trunomi-Api-Policy"] = "enterprise on behalf of customer";
            queryParams = "?customerId=" + customerId + "&enterpriseId=" + enterpriseId;
        }

        let params = {
            method: method,
            url: host_addr + page + queryParams,
            headers: headers
        };

        if (body && _.size(body))
            params['data'] = body;

        let apiRequest = await axios(params).catch((error) => {
            let {status, data} = error.response;
            console.log(status, data);

            if(status===401 && data.includes('Expired')){
                window.sessionStorage.removeItem('TRUNOMI_USE_TOKEN');
                document.cookie = 'tru_config=""';
                window.location.reload();
            }

            throw error
        });

        return apiRequest.data;
    }

    async getDataTypes(ids = null){
        let raw = [], processed = {};

        if(!ids)
            raw = await this.sendRequest('/data-type');
        else
            raw = await Promise.all(ids.map((id) => {
                return this.sendRequest(addID('/data-type', id))
            }));

        _.map(raw, (element) => {
            processed[element.id] = element;
        });

        return processed
    }

    async getCosentState(contextId, consentId){
        let body = {
                contextId: contextId,
                consentDefinitionId: consentId
            };

        let data = await this.sendRequest('/rights/query', 'post', body);

        if(_.isEmpty(data))
            return undefined;
        else
            return data[contextId][consentId].consentState;
    }

    async getDSR(){
        return await this.sendRequest('/ledger/requests/dataSubject');
    }

    async getLedgers(id=null){
        return await this.sendRequest(addID('/ledger', id));
    }

    async getContexts(ids=null, customerId=false){
        // TODO: use filters approach once filters are working
        let headers = customerId ? {"X-Trunomi-Customer-Id": this.truConfig.customerId} : null;

        if (!ids)
            return await this.sendRequest('/context', 'GET', null, headers);

        return  await Promise.all(ids.map((id) => {
            return this.sendRequest(addID('/context', id), 'GET', null, headers);
        }));
    }

    async getRights(ids=null){
        // TODO: use filters approach once filters are working
        if (!ids)
            return await this.sendRequest('/rights/query', 'POST');

        return  await Promise.all(ids.map((id) => {
            return this.sendRequest('/rights/query', 'POST', {contextId: id});
        }));
    }

    async getNewConsents(customerId=false){
        let contexts = await this.getContexts(null, customerId),
            rights = await this.sendRequest('/rights/query', 'POST');

        let newConsents = [];

        contexts.forEach((context)=>{
            let {id, consentDefinitions} = context;

            consentDefinitions.forEach((consent, consentId)=>{
                if((!rights[id] || !rights[id][consentId]) && consent)
                    newConsents.push([id, consentId]);
            })
        });

        return newConsents;
    }
}

var Session = {};
export async function startSession(truConfig) {
    Session['api'] = new trunomiAPI(truConfig, true);
    Session['dict'] = new Locale(truConfig.locale);

    if(truConfig.jwtToken) {
        let validated = await Session.api.checkToken();

        if (!validated)
            validated = await Session.api.validateToken();
        else
            await Session.api.refreshToken();

        if (!validated) {
            Session.api.truConfig.refreshToken = false;
            return false;
        }
    }

    console.log('Session started');
    Session['started'] = true;
    return true;
}

export function stopSession(){
    Session.api.removeRefreshInterval();
    Session.api.truConfig.jwtToken = 'Bearer ';

    console.log('Session stopped')
}

export {Session}
export default trunomiAPI
