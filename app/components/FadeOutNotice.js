import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

class FadeOutNotice extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            show: false,
            fadeClass: 'fadeIn'
        };
    }

    clearTimeouts = () => {
        let {timeout1, timeout2} = this;

        if(timeout1)
            clearTimeout(timeout1);
        if(timeout2)
            clearTimeout(timeout2);
    };

    componentWillReceiveProps(props){
        this.clearTimeouts();
        this.setState({show: props.show, fadeClass:'fadeIn'});
    }

    componentWillUnmount(){
        this.clearTimeouts();
    }

    renderNotice = () => {
        let {bsStyle, text, time, forever, after} = this.props;
        let {fadeClass} = this.state;
        let notice = <div style={{marginBottom: '5px'}} className={`alert alert-${bsStyle} ${fadeClass} fast`}>
            {text}
        </div>;

        if(!forever) {
            this.timeout1 = setTimeout(() => {
                this.setState({fadeClass: 'fadeOut'})
            }, time + 1000);
            this.timeout2 = setTimeout(() => {
                this.setState({show: false, fadeClass: 'fadeIn'});
                after()
            }, time + 2000);
        }

        return notice
    };


    render() {
        return this.state.show && this.renderNotice()
    }
}

FadeOutNotice.defaultProps = {
    bsStyle: 'success',
    text: null,
    time: 3000,
    forever: false,
    after: _.noop
};

FadeOutNotice.propTypes = {
    baStyle: PropTypes.string,
    text: PropTypes.node,
    time: PropTypes.number,
    forever: PropTypes.bool
};

export default FadeOutNotice;