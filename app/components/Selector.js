import React from 'react';
import * as BS from 'react-bootstrap';
import _ from 'lodash';
import PropTypes from 'prop-types';

export default class Select extends React.Component {
    constructor(){
        super();
        this.state = {
            selected: false
        };
    }

    selectOption = (event) => {
        event.preventDefault();

        let option = event.target.value, {onSelect} = this.props, {selected} = this.state;

        if(option!=='select' && !selected)
            this.setState({selected: true});

        onSelect(option);
    };

    style = {
        color: 'white',
        background: 'rgb(51, 153, 255)',
        fontWeight: 'bold',
        fontSize: 'larger',
        height: '40px'
    };

    render(){
        let {title, options, keys} = this.props, {selected} = this.state;

        return <div>
            <BS.ControlLabel>{title}</BS.ControlLabel>
            <BS.FormControl componentClass="select" onChange={this.selectOption} style={this.style}>
                {!selected && <option value='select'>select</option>}
                {options.map((element, i)=>{
                    return <option key={i} value={keys[i]}>
                        {element}
                    </option>
                })}
            </BS.FormControl>
        </div>
    }
}

Select.defaultProps = {
    onSelect: _.noop,
    title: '',
    options: [],
    keys: []
};

Select.propTypes = {
    onSelect: PropTypes.function,
    title: PropTypes.node,
    options: PropTypes.arrayOf(PropTypes.node),
    keys: PropTypes.arrayOf(PropTypes.string)
};
