import * as React from 'react';

export class Show extends React.Component {

    static defaultProps = {
        inline: false,
        className: '',
        when: ''
    };

    render() {
        let {when, className, children, inline} = this.props;
        if (when) {
            return (
                <span className={className} style={{display: inline ? 'inline' : 'block'}}>
                    {children}
                </span>
            )
        }
        else {
            return (<div className={className}></div>)
        }
    }
}

export class Hide extends React.Component {

    static defaultProps = {
        inline: false,
        className: '',
        when: ''
    };

    render() {
        let {when} = this.props

        return <Show {...this.props} when={!when} />
    }
}