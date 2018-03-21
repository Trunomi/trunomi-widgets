import _ from 'lodash';
import {Session} from "./api";

import jwt from 'jsonwebtoken';

export default function propTruConfig(props, propName, componentName) {
    let configObject = props[propName];

    //Not mandatory if a session was started
    if(Session.started)
        return null;

    if(!_.isObject(configObject)){
        return new Error(propName + ' object in ' + componentName + " must be a trunomi config object")
    }

    let {host_addr, jwtToken, apiToken, customerId, enterpriseId, refreshJWT} =configObject;

    if(!_.isString(host_addr)){
        return new Error(propName + ' object in ' + componentName + " must contain a valid host address (host_addr)");
    }

    if((jwtToken && apiToken) || (!jwtToken && !apiToken)){
        return new Error(propName + ' object in ' + componentName +
            " must contain one of: jwt token (jwtToken) or api token (apiToken)");
    }

    if(apiToken){
        if (!_.isString(customerId) || !_.isString(enterpriseId)) {
            return new Error(propName + ' object in ' + componentName + " must contain a customer ID (customerId) and a" +
                " enterprise Id (enterpriseId) when using static authentication (apiToken)");
        }

        if (!_.isString(apiToken)){
            return new Error('apiToken entry in truConfig in ' + componentName + " must be a string");
        }
    }
    else{
        if (!_.isString(jwtToken)){
            return new Error('jwtToken entry in truConfig in '+ componentName + " must be a string");
        }

        let params;
        try{
            params = jwt.decode(jwtToken.split('Bearer ')[1]);
        }catch(e){
            params = undefined;
        }

        if(!params )
            return new Error('Failed to decode JWT token in ' + componentName);

        if(!params.aud[2] && !this.truConfig.customerId){
            return new Error('Customer ID hasn\'t been specified in the config object in ' + componentName +
            'The customer id must be present either in the jwt token or in the config object.');
        }

        if(refreshJWT !== undefined && !_.isBoolean(refreshJWT)){
            return new Error('refreshJWT entry in truConfig in ' + componentName + " must be a boolean value")
        }
    }

    // passed validation
    return null;
}