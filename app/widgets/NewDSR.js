import React from 'react';
import * as BS from 'react-bootstrap';
import API from '../config/api';
import _ from 'lodash';
import CaptureDSR from './CaptureDSR';
import WaitingConfig from "../components/WaitingConfig";
import Select from "../components/Selector";
import {Grid} from '@material-ui/core'

class NewDSR extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            dataTypes: {},
            id: '',
            type: ''
        };

        this.api = new API(this.props.truConfig);
    }

    async componentDidMount() {
        try {
            let data = await this.api.getDataTypes();

            this.setState({dataTypes: data});
        }
        catch (error) {}
    }

    render() {
        let {dataTypes, id, type} = this.state;

        let dataTypeNames = [], dataTypeIDs = [];
        _.forEach(dataTypes, (elem) => {
            dataTypeNames.push(elem.name[Object.keys(elem.name)[0]]);
            dataTypeIDs.push(elem.id);
        });

        let widget;

        if(!id || !type) {
            widget = <WaitingConfig>
                This Page Allows you to preview a Data Subject Request widget with real data.<br/>
                Please select a Data Type name and type of action above to display the widget.
            </WaitingConfig>
        } else {
            widget = <CaptureDSR key={Math.random()} {...this.props} dataTypeId={id} type={type}/>
        }

        return <div>
            <Grid container spacing={16}>
                <Grid item xs={2}/>
                <Grid item xs={4} style={{paddingLeft: 0}}>
                    <Select title={'Data Type'} options={dataTypeNames} keys={dataTypeIDs}
                            onSelect={id => this.setState({id: id})}/>
                </Grid>
                <Grid item xs={4} style={{paddingRight: 0}}>
                    <Select title={'Request Type'} options={['Access', 'Object', 'Rectify', 'Erase']}
                            keys={['access', 'object', 'rectify', 'erasure']}
                            onSelect={type => this.setState({type: type})}/>
                </Grid>
                <Grid item xs={2}/>
            </Grid>
            <br/>
            {widget}
        </div>
    }
}

NewDSR.defaultProps = {
    show: true,
    style: {},
    onError: _.noop,
    onSuccess: _.noop,
    onClose: _.noop
};

export default NewDSR;