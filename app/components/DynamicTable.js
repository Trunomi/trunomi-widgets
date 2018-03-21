import * as React from 'react';
import * as BS from 'react-bootstrap';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export default class Table extends React.Component {
    constructor(props){
        super(props);
    }

    renderHeader = () => {
        let {header, headerClass} = this.props;

        return <tr className={headerClass}>
            {_.map(header, (h, i) => {
                return <th key={i}>{h}</th>
            })}
        </tr>
    };

    renderBody = () => {
        let {data} = this.props;

        return _.map(data, (row, i) => {
            return <tr key={i}>
                {_.map(row, (column, i) => {
                    return <td key={i}>{column}</td>
                })}
            </tr>
        })
    };

    render() {
        return <BS.Table {..._.omit(this.props, ['data', 'header', 'headerClass'])}>
            <tbody>
            {this.renderHeader()}
            {this.renderBody()}
            </tbody>
        </BS.Table>
    }
}

Table.propTypes = {
    striped:PropTypes.bool,
    bordered:PropTypes.bool,
    condensed:PropTypes.bool,
    hover:PropTypes.bool,
    responsive:PropTypes.bool,
    header: PropTypes.array,
    data: PropTypes.arrayOf(PropTypes.array),
    headerClass: PropTypes.string
};


Table.defaultProps = {
    data: [],
    header: [],
    headerClass: '',
    responsive: true
};


//This are the default props that the consents widget, dsrWidget and activedsr widget use
Table.widgetTableProps = {
    striped: false,
    bordered: true,
    condensed: true,
    hover: true,
    responsive: false,
    headerClass: 'greyHeader'
};