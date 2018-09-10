import React from 'react';
import * as BS from 'react-bootstrap';
import CircularProgress from '@material-ui/core/CircularProgress';

export const LoadingInline = () => {
    return <div className='loadingContainer'>
        <div className='loadingRow' style={{color: '#1a1a1a'}}>
            <CircularProgress size={100} color='inherit'/>
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
                <div style={{color: '#1a1a1a'}}>
                    <CircularProgress size={100} color='inherit'/>
                </div>
            </BS.Modal>
            {children}
        </div>
    }
}

export default LoadingModal;