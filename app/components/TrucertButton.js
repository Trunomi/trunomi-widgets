import React from 'react';
import * as BS from 'react-bootstrap';
import {closeButtonDict} from "../config/widgetDict";
import Trucert from '../widgets/Trucert';
import {trucertButtonTypes} from "./propTypes";
import {Dialog, DialogContent, DialogTitle } from '@material-ui/core'
import NoteIcon from '@material-ui/icons/NoteOutlined';
import InsertDriveFileOutlinedIcon from '@material-ui/icons/InsertDriveFile';

class TrucertButton extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            show: false
        };

        this.api = this.props.api;
        this.dict = this.props.dict;
    }

    componentWillMount() {
        this.propsToState(this.props)
    }

    componentWillReceiveProps(props) {
        this.propsToState(props)
    }

    propsToState = (props) => {
        this.setState({show: props.show})
    }

    toggleTrucert = () => {
        this.setState({show: !this.state.show})
    };

    render() {
        console.log(this.props.pcConfig)
        console.log()
        return <div style={{verticalAlign: 'top'}}>
            <BS.Button bsSize='large' bsStyle="link" onClick={this.toggleTrucert}  style={{verticalAlign: 'top', ...this.props.pcConfig.truCertItemIconColor}}>
                <span className="glyphicon glyphicon-file f3" style={this.props.pcConfig.truCertItemIconColorForWidgets}></span>
            </BS.Button>
            <Dialog open={this.state.show} onClose={this.toggleTrucert} scroll='body'>
                <DialogContent>
                    <Trucert {...this.props} truConfig={this.api.truConfig} />
                </DialogContent>
            </Dialog>
        </div>
    }
}

TrucertButton.propTypes = trucertButtonTypes;

TrucertButton.defaultProps = {
    show: false
};

export default TrucertButton;