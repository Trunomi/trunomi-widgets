import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Paper } from '@material-ui/core';

export default class CustomPanel extends React.Component{
    render(){
        let {onClose, children} = this.props;

        return <Paper style={{padding: '30px', paddingBottom: '10px'}}>
            <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
            </button>
            {children}
        </Paper>
    }
}

CustomPanel.propTypes = {
    onClose: PropTypes.func,
    style: PropTypes.object
};

CustomPanel.defaultProps = {
    onClose: _.noop
};