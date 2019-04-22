import React from 'react'
import CaptureDSR from "../widgets/CaptureDSR"
import {eventDict} from "../config/dataTypes"
import {dsrButtonDict} from "../config/widgetDict"
import {dsrButtonTypes} from "./propTypes"
import _ from 'lodash'
import {MenuItem, Select, Dialog} from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import {isPreview} from '../config/enterprise-config'

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

    menuItem = (definition, value, text) => {
        if (!definition || definition === "null")
            return null
        let {pcConfig} = this.props
        return <MenuItem key={value} style={pcConfig ? pcConfig.tableBody : null} disabled={isPreview} value={value}>{text}</MenuItem>
    }

    render() {
        const {reasonsPrompt, dsrType, open} = this.state
        const {dataType} = this.props

        let reasons

        if(reasonsPrompt) {
            reasons = <Dialog open={reasonsPrompt} onClose={this.toggleReasons} scroll='body' PaperProps={{id: 'DSR-dialog'}}>
                <CaptureDSR dataType={dataType} truConfig={this.props.truConfig} onClose={this.toggleReasons}
                            dataTypeId={dataType.id} type={eventDict[dsrType].toLowerCase()}
                            onError={this.onProcessed} onSuccess={this.onProcessed}/>
            </Dialog>
        }

        let buttonText = this.props.dict.getName(dsrButtonDict)
        const definitions = [dataType.accessDefinition, dataType.erasureDefinition, dataType.rectifyDefinition,
            dataType.objectDefinition]
        const menuValues = ["dar", "der", "drr", "dor"]

        if (!definitions.find(val => val && val !== "null"))
            return null

        return <div class="w4">
            <span onClick={this.toggleOptions}>
                <span className="action-button">{buttonText[0]}<ExpandMoreIcon /></span>
            </span>
            <span>
                <Select open={open}
                        MenuProps={{id: 'consent-select'}}
                        style={{position: 'absolute',width: 5,visibility: 'hidden'}}
                        onClose={this.toggleOptions}
                        onOpen={this.toggleOptions}
                        onChange={this.toggleReasons}
                        value={1}>
                    {definitions.map((el, id) => this.menuItem(el, menuValues[id], buttonText[id + 1]))}
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