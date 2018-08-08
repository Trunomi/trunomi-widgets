import React from 'react';
import '../assets/style/css/bootstrap.min.css';
import BaseWidget from './Base';
import {withStyles} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import TableX from "../components/DynamicTable";
import {receiptsTableDict} from "../config/widgetDict";
import UploadReceipt from '../components/UploadReceipt';
import ExternalReceiptView from '../components/ExternalReceiptView';

class Externalreceipts extends BaseWidget{
    state = {
        loaded: false,
        data: [],
        dataViews: [],
        error: ''
    }

    componentWillMount = async() => {
        try{
            const receipts = await this.api.sendRequest('/data-model/external-receipts')
            let data = [], dataViews = []
            receipts.forEach(el => {
                const {services, consentTimestamp} = el.receipt
                data.push([
                    services[0].service,
                    services[0].purposes[0].purpose,
                    services[0].purposes[0].piiName,
                    (new Date(consentTimestamp * 1000)).toDateString(),
                    <DeleteIcon/>
                ])

                dataViews.push(<ExternalReceiptView show entry={el}/>)
            })
            this.setState({loaded: true, data, dataViews})
        }catch(error){
            this.setState({loaded: true, error: error.response.data})
        }
    }

    render(){
        const {data, dataViews} = this.state
        const headers = this.dict.getName(receiptsTableDict)

        return <React.Fragment>
            <UploadReceipt api={this.api}/>
            <TableX
                style={{margin: 0}}
                header={headers}
                data={data}
                onRowClick={dataViews}
                //{...table}
                className="list-table"
                headerClass="list-table-header"
            />
        </React.Fragment>
    }
}

export default Externalreceipts



