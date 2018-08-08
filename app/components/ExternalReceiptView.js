import React from 'react';
import {Dialog, DialogContent, DialogTitle} from '@material-ui/core'
import PropTypes from 'prop-types';

class ExternalReceiptView extends React.Component{
    state = {
        show: this.props.show === true
    }

    componentWillReceiveProps(props) {
        this.setState({show: props.show})
    }

    render() {
        const {entry} = this.props;
        if (!entry)
            return null

        const {show} = this.state
        return <Dialog open={show} onClose={() => this.setState({show: !show})} scroll='body'>
            <DialogTitle>
                External Receipt from {entry.receipt.piiControllers[0].piiController}
            </DialogTitle>
            <DialogContent>
                <div style={{whiteSpace: 'pre'}}>
                    {JSON.stringify(entry, null, "\t")}
                </div>
            </DialogContent>
        </Dialog>
    }
}

ExternalReceiptView.propTypes = {
    show: PropTypes.bool,
    entry: PropTypes.any
}

ExternalReceiptView.defaultProps = {
    show: false,
    entry: null
};

export default ExternalReceiptView;