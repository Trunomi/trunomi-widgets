import React, {Component} from 'react';
import API from '../../config/api';
import {Trucert} from '../../index';
import WaitingConfig from "../../components/WaitingConfig";
import Select from "../../components/Selector";


export default class TrucertSelector extends Component{
    constructor(props){
        super(props);

        this.state = {
            data: [],
            id: ''
        };

        this.api = new API(this.props.truConfig);
        this.loadData = this.loadData.bind(this);
    }


    async componentDidMount(){
        await this.loadData();
    }

    async loadData(contexts, rights){
        try {
            let ledgers = await this.api.getLedgers();
            this.setState({data: ledgers});
        }
        catch (error) {
            console.log(error);
        }
    }


    render(){
        let {data, id} = this.state;

        let ledgerEvents = [], ledgerIDs = [];
        data.forEach((ledger) => {
            let date = new Date(ledger.capturedAt);

            ledgerEvents.push(`${ledger.event} event at ${date.toDateString()}`);
            ledgerIDs.push(ledger.id);
        });

        let display;

        if(!id){
            display = <WaitingConfig>
                This Page Allows you to preview a TruCert widget with real data.<br/>
                Please select the ledger event to be displayed.
            </WaitingConfig>
        }else{
            display = <Trucert {...this.props} ledgerId={id} key={Math.random()}/>
        }

        return <div>
            <Select title={'Ledger Events'} options={ledgerEvents} keys={ledgerIDs}
                    onSelect={id => {
                        this.setState({id: id})}}/>
            <br/>
            {display}
        </div>
    }
}

TrucertSelector.defaultProps = Trucert.defaultProps;