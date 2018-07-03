import React from 'react';
import * as BS from 'react-bootstrap';
import CaptureDSR from "../widgets/CaptureDSR";
import {eventDict} from "../config/dataTypes";
import {dsrButtonDict} from "../config/widgetDict";
import {dsrButtonTypes} from "./propTypes";
import _ from 'lodash';


class DsrButton extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            reasonsPrompt: false,
            dsrType: ''
        };
    }

    toggleReasons = (event) => {
        this.setState({
            reasonsPrompt: !this.state.reasonsPrompt,
            dsrType: event
        });
    };

    onProcessed = (error) => {
        let params = {
            dataType: this.props.dict.getName(this.props.dataType.name),
            action: eventDict[this.state.dsrType],
            code: error ? error.response.data.code : null
        };

        this.toggleReasons();
        this.props.onProcessed(params);
    };

    render() {
        const {reasonsPrompt, dsrType} = this.state;
        const {dataType, id} = this.props;

        let reasons;

        if(reasonsPrompt) {
            reasons = <BS.Modal show={reasonsPrompt} onHide={this.toggleReasons}>
                <CaptureDSR dataType={dataType} truConfig={this.props.truConfig} onClose={this.toggleReasons}
                            dataTypeId={dataType.id} type={eventDict[dsrType].toLowerCase()}
                            onError={this.onProcessed} onSuccess={this.onProcessed}/>
            </BS.Modal>
        }

        let buttonText = this.props.dict.getName(dsrButtonDict);

        return <div>
            <BS.ButtonToolbar>
                <BS.DropdownButton title={buttonText[0]}
                                   id={"dropdown-size-medium" + (id ? ` ${id}`: "")} onSelect={this.toggleReasons}>
                    {(dataType.accessDefinition) && <BS.MenuItem eventKey="dar">{buttonText[1]}</BS.MenuItem>}
                    {(dataType.erasureDefinition) && <BS.MenuItem eventKey="der">{buttonText[2]}</BS.MenuItem>}
                    {(dataType.rectifyDefinition) && <BS.MenuItem eventKey="drr">{buttonText[3]}</BS.MenuItem>}
                    {(dataType.objectDefinition) && <BS.MenuItem eventKey="dor">{buttonText[4]}</BS.MenuItem>}
                </BS.DropdownButton>
            </BS.ButtonToolbar>
            {reasons}
        </div>
    }
}

export default DsrButton;

DsrButton.defaultProps = {
    onProcessed: _.noop,
    dataType: {}
};

DsrButton.propTypes = dsrButtonTypes;