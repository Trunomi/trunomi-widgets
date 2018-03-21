import React from 'react';
import * as BS from 'react-bootstrap';
import {loadingDict} from "../config/widgetDict";
import Locale from "../config/locale";
import PropTypes from 'prop-types';

export const LoadingInline = () => {
    return <div className='loadingContainer'>
        <div className='loadingRow'>
            <i className='icon-spin1 animate-spin loadingIcon' style={{fontSize: '75px'}}/>
        </div>
    </div>
};


class LoadingModal extends React.Component{
    render() {
        let dict = new Locale(this.props.locale);

        return <BS.Modal id='loading' show={this.props.loading}>
            <BS.Modal.Header>
                <BS.Modal.Title id="contained-modal-title-lg">{dict.getName(loadingDict)}</BS.Modal.Title>
            </BS.Modal.Header>
            <BS.Modal.Body>
                <LoadingInline/>
            </BS.Modal.Body>
        </BS.Modal>
    }
}

LoadingModal.defaultProps = {
    locale: undefined
};

LoadingModal.propsTypes = {
    locale: PropTypes.string
};

export default LoadingModal;