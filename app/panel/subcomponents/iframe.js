import React, {Component} from 'react'
import {iframeHost} from '../../config/enterprise-config'
import {TextField, InputAdornment, IconButton, withStyles} from '@material-ui/core'
import {ContentCopy} from '@material-ui/icons'

const iframeEndPoints = {
    "ConsentsWidget": "my_permissions",
    "NewConsents": "capture_consent",
    "NewDSR": "capture_dsr",
    "TrucertSelector": "trucert",
    "ActiveDSRWidget": "my_dsr",
    "DSRWidget": "my_data",
    "UserPreferences": "user_preferences"
}

const styles = theme => ({
    container: {
        margin: '10px 0 10px 0',
        width: '50%',
        float: 'right'
    }
})

class Iframe extends Component {
    static defaultProps = {
        name: '',
        truConfig: {}
    }

    copyToClipboard = (e) => {
        this.textField.select()
        document.execCommand('copy')
        e.target.focus()
    } 

    generateAddress = (widget) => {
        const {truConfig} = this.props
        const {host_addr, jwtToken, apiToken, enterpriseId, customerId} = truConfig

        let addr = `${iframeHost}/${widget}?host_addr=${host_addr}`
        if (jwtToken){
            addr += `&jwtToken=${jwtToken}`
        }else{
            addr += `&apiToken=${apiToken}&enterpriseId=${enterpriseId}&customerId=${customerId}`
        }
        
        switch(widget){
            case "capture_consent":
                return `${addr}&contextId=${'-----------Add Context ID-----------'}`
            case "capture_dsr":
                return `${addr}&dataTypeId=${'----------Add Data Type ID----------'}&type=${'----Add data subject request type----'}`
            case "trucert":
                return `${addr}&ledgerId=${'-----------Add Ledger  ID-----------'}`
            default:
                return addr
        }
    }

    render(){
        const {name, classes} = this.props

        return <TextField
            id="iframe-addr-copy"
            className={classes.container}
            variant="outlined"
            label="Embeddable URL"
            value={this.generateAddress(iframeEndPoints[name])}
            inputRef={textField => this.textField = textField}
            helperText="Use this URL to embed this widget in an iframe"
            InputProps={{
                endAdornment: (
                    <InputAdornment position="end">
                        <IconButton
                            aria-label="Copy URL"
                            onClick={this.copyToClipboard}>
                            <ContentCopy/>
                        </IconButton>
                    </InputAdornment>
                ),
            }}
        />
    }
}

export default withStyles(styles)(Iframe)