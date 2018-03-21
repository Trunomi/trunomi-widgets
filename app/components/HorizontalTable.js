import * as React from 'react';
import * as BS from 'react-bootstrap';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export default class Table extends React.Component {
    constructor(props){
        super(props);
    }

    renderBody = () => {
        let {className, data} = this.props;
        let style = {width: "50%"};
        return _.map(data, (d, i) => {
            return <tr key={i} className={className}>
                <th style={style}>{d[0]}</th>
                <td style={style}>{d[1]}</td>
            </tr>
        })
    };

    render() {
        return <div>
            <BS.Table>
                <tbody>
                {this.renderBody()}
                </tbody>
            </BS.Table>
        </div>
    }
}

Table.defaultProps = {
    className: '',
    data: [],
    tableStyle: ''
};

Table.propTypes = {
    className: PropTypes.string,
    data: PropTypes.array,
    tableStyle: PropTypes.string
};