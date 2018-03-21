import React, {Component} from 'react';
import axios from 'axios';
import _ from 'lodash';
import * as BS from 'react-bootstrap';
import TrucertButton from "components/TrucertButton";
import ConsentButton from "components/ConsentButton";
import {LoadingInline} from "components/Loading";
import Locale from "components/locale";
import ErrorPanel from "components/ErrorPanel";

class RightsWidget extends Component{

    constructor(props){
        super(props);
        this.state = {
            loaded: false,
            data: '',
            trucertModal: false,
            error: ''
        };
        this.dict = new Locale();
    }

    getRightsQuery = async () => {
        const {headers, enterpriseId, customerId, host_addr} = this.props.truConfig;

        let queryParams = "?customerId=" + customerId + "&enterpriseId=" +  enterpriseId;

        await axios({
            method: 'post',
            url: host_addr + "/rights/query" + queryParams,
            headers: headers
        }).then((response) => {
            if (response.status === 200){
                this.setState({data: response.data, error: '', loaded: true});
            }
        }).catch((error)=>{
            console.log(error);
            this.setState({error: error.toString()});
        });
    }

    onProcessed = async (eventProcessed) => {

        window.parent.postMessage({
            instruction: 'actionResult',
            payload: eventProcessed
        }, '*');

        await this.getRightsQuery();
    }

    componentDidMount() {
        this.getRightsQuery()
    }

    genRow = async (element, contextId) => {
        let aux = 0;
        return _.map(element, (right, id) => {

            let state;

            switch (right.consentState) {
                case 'consent-grant':
                    state = <p className='text-success'>Granted</p>;
                    break;
                case 'consent-revoke':
                    state = <p className='text-warning'>Revoked</p>;
                    break;
                case 'consent-deny':
                    state = <p className='text-danger'>Denied</p>;
                    break;
                default:
                    state = right.consentState;
            }
            aux++;
            try {
                return (<tr key={id}>
                    <td>{(aux === 1) ? this.dict.getName(right.contextName) : ''}</td>
                    <td>{this.dict.getName(right.consentDefinition.name)}</td>
                    <td>{this.dict.getName(right.dataType[0].name)}</td>
                    <td className='text-center'>{state}</td>
                    <td className='text-center'>
                        <TrucertButton truConfig={this.props.truConfig} ledgerId={right.ledgerEntryId}/>
                    </td>
                    <td className='text-center'>
                        <ConsentButton dataTypeId={right.dataType[0].id} consentId={id} state={right.consentState}
                                       contextId={contextId} onProcessed={this.onProcesse}
                                       truConfig={this.props.truConfig}/>
                    </td>
                </tr>)
            }
            catch(e){}
        })
    }


    render() {
        let display;

        if(this.state.error)
            display = <ErrorPanel/>;
        else if(!this.state.loaded)
            display = <LoadingInline/>;
        else{
            display = <div>
                <BS.PageHeader style={{marginTop:0}}>
                    Rights <small>Customer ID: {this.props.truConfig.customerId}</small>
                </BS.PageHeader>
                <BS.Table bordered hover condensed>
                    <thead>
                    <tr>
                        <th>Context</th>
                        <th>Consent</th>
                        <th>Data Type</th>
                        <th className='text-center'>Status</th>
                        <th className='text-center'>Trucert<sup>TM</sup></th>
                        <th className='text-center'>Change</th>
                    </tr>
                    </thead>
                    <tbody>
                    {_.map(this.state.data, (element, contextId) => {
                        return this.genRow(element, contextId)
                    })}
                    </tbody>
                </BS.Table>
            </div>
        }

        return <div style={{width: '100%', minWidth: '530px'}}>
            {display}
        </div>
    }
}

export default RightsWidget;