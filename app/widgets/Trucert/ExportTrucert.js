import React from 'react';
import { withStyles, Button } from '@material-ui/core';
import ExportIcon from '@material-ui/icons/ImportExport';
import FileSaver from 'file-saver';

const styles = theme => ({
    button: {
        float: 'right'
    }
})

class ExportBtn extends React.Component {
    static defaultProps = {
        ledgerId: ''
    }
    
    export = async () => {
        const {api, ledgerId} = this.props
        try{
            const receipt = await api.sendRequest('/data-model/external-receipts/' + ledgerId)
            const blob = new Blob([JSON.stringify(receipt, null, "\t")], {type: "application/json"})
            FileSaver.saveAs(blob, 'receipt.json')
        }catch(e){
            alert(e.response.data)
        }
    }

    render(){
        const {classes} = this.props; 

        return <Button variant="contained" color="secondary" size='small' 
            className={classes.button} onClick={this.export}>
            <ExportIcon/> Export
        </Button>
    }
}

export default withStyles(styles)(ExportBtn)