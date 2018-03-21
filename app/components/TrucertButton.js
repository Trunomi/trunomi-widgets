import React from 'react';
import * as BS from 'react-bootstrap';
import {closeButtonDict} from "../config/widgetDict";
import Trucert from '../widgets/Trucert';
import {trucertButtonTypes} from "./propTypes";

class TrucertButton extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            show: false
        };

        this.api = this.props.api;
        this.dict = this.props.dict;
    }

    toggleTrucert = () => {
        this.setState({show: !this.state.show})
    };

    render() {

        return <div className='text-center'>
            <BS.Button bsSize='small' bsStyle="link" onClick={this.toggleTrucert}>
                <i className="icon-doc-text" style={{fontSize: '180%'}} aria-hidden="true"/>
            </BS.Button>
            <BS.Modal show={this.state.show} onHide={this.toggleTrucert}>
                <BS.Modal.Header closeButton/>
                <BS.Modal.Body>
                    <Trucert {...this.props} truConfig={this.api.truConfig} />
                </BS.Modal.Body>
                <BS.Modal.Footer>
                    <BS.Button onClick={this.toggleTrucert}>{this.dict.getName(closeButtonDict)}</BS.Button>
                </BS.Modal.Footer>
            </BS.Modal>
        </div>
    }
}

TrucertButton.propTypes = trucertButtonTypes;

export default TrucertButton;