import * as React from 'react';
import * as _ from 'lodash';
import PropTypes from 'prop-types';

export default class Table extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            show: null
        }
    }

    renderHeader = () => {
        let {header, headerClass, pcConfig} = this.props;

        let content = _.map(header, (h, i) => {
            return <th style={pcConfig ? pcConfig.columnHeaders : null} key={i}>{h}</th>
        })
            return <tr className={headerClass}>
                {content}
            </tr>
    }

    rowClick = async (i) => {
        let {onRowClick} = this.props

        if (onRowClick && onRowClick[i] && _.size(onRowClick[i])) {
            await this.setState({show: null})
            this.setState({show: onRowClick[i]})
        }
    }

    renderBody = () => {
        let {data, onRowClick, pcConfig} = this.props;
        let onClick = () => {}
        return _.map(data, (row, i) => {
            let hasTruCert = onRowClick && onRowClick[i] && _.size(onRowClick[i]) ? 'cursor' : ''
            return <tr className={hasTruCert} key={i}>
                {_.map(row, (column, j) => {
                    if (j < (_.size(row) - 1)) // onClick should not work on the last cell
                        onClick = () => {this.rowClick(i)}
                    else
                        onClick = () => {}
                    return <td onClick={onClick} key={j} style={pcConfig ? pcConfig.tableBody : null}>{column}</td>
                })}
            </tr>
        })
    };

    render() {
        let {show} = this.state
        const {style, className, id} = this.props
        return <div>
            <table style={style} className={className} id={id}>
                <tbody>
                    {this.renderHeader()}
                    {this.renderBody()}
                </tbody>
            </table>
            <div style={{display: 'none'}}>{show}</div>
        </div>
    }
}

Table.propTypes = {
    header: PropTypes.array,
    pcConfig: PropTypes.object,
    data: PropTypes.arrayOf(PropTypes.array),
    headerClass: PropTypes.string
};


Table.defaultProps = {
    data: [],
    pcConfig: null,
    header: [],
    headerClass: 'greyHeader',
    className: '',
    tableClass: '',
    onRowClick: null,
    id: "",
    style: undefined
};


//This are the default props that the consents widget, dsrWidget and activedsr widget use
Table.widgetTableProps = {
    headerClass: 'greyHeader'
};