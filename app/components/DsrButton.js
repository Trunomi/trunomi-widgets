import React from 'react'
import * as BS from 'react-bootstrap'
import CaptureDSR from "../widgets/CaptureDSR"
import {eventDict} from "../config/dataTypes"
import {dsrButtonDict} from "../config/widgetDict"
import {dsrButtonTypes} from "./propTypes"
import _ from 'lodash'
import {MenuItem, Select, Dialog, DialogContent, DialogTitle} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {isPreview, pcConfig} from '../config/enterprise-config'

class DsrButton extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            reasonsPrompt: false,
            dsrType: '',
            open: false
        }
    }

    toggleReasons = (event) => {
        this.setState({
            reasonsPrompt: !this.state.reasonsPrompt,
            dsrType: event ? event.target.value : false
        })
    }

    onProcessed = (error) => {
        let params = {
            dataType: this.props.dict.getName(this.props.dataType.name),
            action: eventDict[this.state.dsrType],
            code: error ? error.response.data.code : null
        }

        this.toggleReasons()
        this.props.onProcessed(params)
    }

    toggleOptions = () => {
        this.setState({open: !this.state.open})
    }

    render() {
        const {reasonsPrompt, dsrType, open} = this.state
        const {dataType, id} = this.props

        let reasons

        if(reasonsPrompt) {
            reasons = <Dialog open={reasonsPrompt} onClose={this.toggleReasons} scroll='body' PaperProps={{id: 'DSR-dialog'}}>
                <CaptureDSR dataType={dataType} truConfig={this.props.truConfig} onClose={this.toggleReasons}
                            dataTypeId={dataType.id} type={eventDict[dsrType].toLowerCase()}
                            onError={this.onProcessed} onSuccess={this.onProcessed}/>
            </Dialog>
        }

        let buttonText = this.props.dict.getName(dsrButtonDict)

        return <div>
            <span onClick={this.toggleOptions}>
                <i className="dsr-actions-label-icon fa fas fa-chevron-down"/>
                <span className="action-button">Actions <ExpandMoreIcon /></span>

            </span>
            <span>
                <Select open={open}
                        MenuProps={{id: 'consent-select'}}
                        style={{position: 'absolute',width: 5,visibility: 'hidden'}}
                        onClose={this.toggleOptions}
                        onOpen={this.toggleOptions}
                        onChange={this.toggleReasons}
                        margin="normal">
                    {(dataType.accessDefinition) && <MenuItem style={pcConfig.tableBody} disabled={isPreview} value="dar">{buttonText[1]}</MenuItem>}
                    {(dataType.erasureDefinition) && <MenuItem style={pcConfig.tableBody} disabled={isPreview} value="der">{buttonText[2]}</MenuItem>}
                    {(dataType.rectifyDefinition) && <MenuItem style={pcConfig.tableBody} disabled={isPreview} value="drr">{buttonText[3]}</MenuItem>}
                    {(dataType.objectDefinition) && <MenuItem style={pcConfig.tableBody} disabled={isPreview} value="dor">{buttonText[4]}</MenuItem>}
                </Select>
            </span>
            {reasons}
        </div>
    }
}

export default DsrButton

DsrButton.defaultProps = {
    onProcessed: _.noop,
    dataType: {}
}

DsrButton.propTypes = dsrButtonTypes