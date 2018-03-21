import React from 'react';
import PropTypes from 'prop-types';

class Logo extends React.Component{

    render() {
        let {link} = this.props;

        return link && <a href={this.props.link} target="_blank" color='blue' id='truLogo' rel="noopener noreferrer">
            <i className="icon-question-circle-o" aria-hidden="true"/>
        </a>
    }
}

Logo.defaultProps = {
    link: undefined
};

Logo.propTypes = {
    link: PropTypes.string
};

export default Logo;