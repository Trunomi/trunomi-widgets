import React from 'react';
import * as BS from 'react-bootstrap';

export const LoadingInline = () => {
    return <div className='loadingContainer'>
        <div className='loadingRow'>
            <i className='icon-spin1 animate-spin loadingIcon' style={{fontSize: '75px'}}/>
        </div>
    </div>
};


class LoadingModal extends React.Component{
    render() {
        let {children, loading} = this.props

        return <div className="modal-container">
            <BS.Modal id="loadingModal"
                show={loading}
                container={this}
                aria-labelledby="contained-modal-title">
                <i className='icon-spin1 animate-spin loadingIcon' style={{fontSize: '8vw'}}/>
            </BS.Modal>
            {children}
        </div>
    }
}

export default LoadingModal;