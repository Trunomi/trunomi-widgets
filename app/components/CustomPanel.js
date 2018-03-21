import React from 'react';
import {Alert} from 'react-bootstrap';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default class CustomPanel extends React.Component{
    render(){
        let {onClose, style, children} = this.props;

        return <Alert style={style} className={'blueDiv'}>
            <button type="button" className="close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
            </button>
            {children}
        </Alert>
    }
}

CustomPanel.propTypes = {
    onClose: PropTypes.func,
    style: PropTypes.object
};

CustomPanel.defaultProps = {
    onClose: _.noop
};