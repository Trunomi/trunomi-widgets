import React from 'react';
import Dropzone from 'react-dropzone';
import '../assets/style/css/bootstrap.min.css';
import * as BS from 'react-bootstrap';
import {withStyles, Button, Dialog, DialogContent, DialogTitle, 
    DialogActions, InputAdornment, TextField, DialogContentText} from '@material-ui/core';

const styles = theme => ({
    bootstrapRoot: {
        padding: 0,
        'label + &': {
          marginTop: theme.spacing.unit * 3,
        },
      },
    bootstrapInput: {
        borderRadius: 4,
        marginTop: '15px',
        marginBottom: '15px',
        backgroundColor: theme.palette.common.white,
        border: '1px solid #ced4da',
        fontSize: 16,
        padding: '10px 12px',
        width: 'calc(100% - 24px)',
        transition: theme.transitions.create(['border-color', 'box-shadow']),
        '&:focus': {
            borderColor: '#80bdff',
            boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
        },
    },
    dialogContent: {
        paddingBottom: '15px'
    },
    uploadBtn: {
        marginTop: '50px'
    }
})

class UploadReceipt extends React.Component{
    state = {
        open: false,
        file: null,
        fileAsTxt: ''
    }

    sendReceipt = async () => {
        await this.props.api.sendRequest('/data-model/external-receipts', 'POST', {receipt: this.state.fileAsTxt})
    } 
    
    onDrop = (files) => {
        if (!files || !files.length)
            return

        const reader = new FileReader();
        reader.onload = () => {
            this.setState({
                file: files[0],
                fileAsTxt: reader.result
            });
        };
        reader.readAsText(files[0], 'UTF-8');
    };

    auditFile = (input) => {
        let fileAsTxt = input.target.value;
        this.setState({
            fileAsTxt,
            file: new File([fileAsTxt], "edited.json", {type: "text/json"})
        })
    };

    renderUploadDialog = () => {
        const {classes} = this.props;
        const {fileAsTxt, file} = this.state;
        return <Dialog open={this.state.open} onClose={()=>this.setState({open: false})}>
            <DialogTitle>External Receipt</DialogTitle>
            <DialogContent className={classes.dialogContent}>
                <DialogContentText>
                    You can upload a receipt from another platform that h....
                </DialogContentText>
                <Dropzone onDrop={this.onDrop} multiple={false} accept={'.json'}
                        style={{width: '300px', height: '50px', position: 'relative',display: 'inline'}}>
                    <TextField
                        value={file ? file.name : ''}
                        InputProps={{
                            disableUnderline: true,
                            classes: {
                                root: classes.bootstrapRoot,
                                input: classes.bootstrapInput,
                            },
                            endAdornment: <InputAdornment position="end">
                                <Button variant='contained' onClick={this.onDrop} className={classes.uploadBtn}>
                                    upload
                                </Button>
                            </InputAdornment>
                        }}
                    />
                </Dropzone>
                <BS.FormGroup controlId="formControlsTextarea">
                    <BS.FormControl componentClass="textarea" style={{height: '350px', width: '500px', resize: 'none'}}
                                    placeholder="Edit or Paste a CSV with a list of permissions to Import"
                                    value={fileAsTxt}
                                    onChange={this.auditFile}/>
                </BS.FormGroup>
            </DialogContent>
            <DialogActions>
                <Button onClick={()=>this.setState({open: false})} color="primary">
                    Cancel
                </Button>
                <Button onClick={this.sendReceipt} color="primary" disabled={!file}>
                    Submit
                </Button>
            </DialogActions>
        </Dialog>
    }

    render(){

        return <React.Fragment>
            {this.renderUploadDialog()}
            <Button onClick={()=>this.setState({open: true})}>Open form dialog</Button>
        </React.Fragment>
    }
}

export default withStyles(styles)(UploadReceipt)