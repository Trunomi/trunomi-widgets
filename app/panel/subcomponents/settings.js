import * as React from 'react';
import {Button, withStyles} from '@material-ui/core'

const styles = theme => ({
    button: {
        backgroundColor: '#7D61F4',
        '&:hover': {
            backgroundColor: '#563C82'
        },
        textTransform: 'none',
        fontSize: '13px'
    }
})

class Settings extends React.Component {

    render() {
        const {classes} = this.props
        return <Button  variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={()=>{this.props.stateChange([{configModal: true}])}}>
            Customise this preview
        </Button>
    }
}

export default withStyles(styles)(Settings)