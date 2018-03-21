import * as React from 'react';
import * as BS from 'react-bootstrap';

import PropTypes from "prop-types";

export default class Collapse extends React.Component {
    constructor(props) {
        super(props);
        this.state = {open: true};
    };

    togglePanel = () => {
        this.setState({ open: !this.state.open });
    };

    HeaderTable = () => {
        let {headerBsStyle, text} = this.props,
            {open} = this.state;

        let style = {width: '50%'};

        return <BS.Table bsStyle="info">
            <tbody><tr className={headerBsStyle}>
                <th style={style}>{text}</th>
                <th style={style}>
                    <div style={{float: 'right'}}>
                        <BS.Glyphicon glyph={open ? 'minus' : 'plus'}/>
                    </div>
                </th>
            </tr></tbody>
        </BS.Table>
    };

    render() {
        let {bodyStyle, children} = this.props;
        let {open}= this.state;

        return <div>
            <div onClick={this.togglePanel}>
                {this.HeaderTable()}
            </div>
            <BS.Collapse in={open}>
                <div style={bodyStyle}>
                    {Object.keys(children).length ? children : null}
                </div>
            </BS.Collapse>
        </div>
    }
}

Collapse.defaultProps = {
    bodyStyle: null,
    headerBsStyle: '',
    text: ''
};

Collapse.propTypes = {
    bodyStyle: PropTypes.object,
    headerBsStyle: PropTypes.string,
    text: PropTypes.node
};

