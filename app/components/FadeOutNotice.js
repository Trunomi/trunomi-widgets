import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import classNames from 'classnames';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import IconButton from '@material-ui/core/IconButton'; 
import WarningIcon from '@material-ui/icons/Warning';
import Fade from '@material-ui/core/Fade';
import { withStyles } from '@material-ui/core/styles';

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
  };
  
const styles = theme => ({
    success: {
        backgroundColor: green[500],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
    },
    iconVariant: {
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center'
    },
    root: {
        position: 'relative',
        height: '60px'
    },
    content: {
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0
    },
    close: {
        marginLeft: 'auto'
    }
});

class FadeOutNotice extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            show: false
        };
    }

    componentWillReceiveProps(props){
        this.setState({show: props.show});
    }

    renderText = () => {
        const {variant, classes, text} = this.props;
        const Icon = variantIcon[variant];

        return <SnackbarContent
            className={classNames(classes[variant], classes.content)}
            classes={{message: classes.maxWidth}}
            message={
                <span id="snackBar" className={classes.message}>
                    <Icon className={classNames(classes.icon, classes.iconVariant)} />
                        {text}
                    <IconButton
                        color="inherit"
                        className={classes.close}
                        onClick={this.onClose}
                    >
                        <CloseIcon className={classes.icon} />
                    </IconButton>
                </span>
            }
        />
    }

    onClose = () => {
        this.props.onClose()
        this.setState({show: false})
    }

    render() {
        const {show} = this.state
        const {time, variant, forever, classes} = this.props
        return <Snackbar
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            open={show}
            variant={variant}
            autoHideDuration={forever ? null : time}
            onClose={this.onClose}
            className={classes.root}
            TransitionComponent={Fade}
        > 
            {this.renderText()}
        </Snackbar>
    }
}

FadeOutNotice.defaultProps = {
    variant: 'success',
    text: null,
    time: 5000,
    forever: false,
    onClose: _.noop
};

FadeOutNotice.propTypes = {
    variant: PropTypes.string,
    text: PropTypes.node,
    time: PropTypes.number,
    forever: PropTypes.bool
};

export default withStyles(styles)(FadeOutNotice);