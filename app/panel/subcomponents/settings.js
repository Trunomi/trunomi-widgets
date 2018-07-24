import * as React from 'react';
import {Button} from '@material-ui/core'

export default class Settings extends React.Component {

    render() {
        return <Button  variant="contained"
                        color="primary"
                        onClick={()=>{this.props.stateChange([{configModal: true}])}}>
            CUSTOMISE THIS PREVIEW
        </Button>
    }
}