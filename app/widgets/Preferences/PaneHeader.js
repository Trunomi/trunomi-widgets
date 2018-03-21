import React from 'react';

class PaneHeader extends React.Component {
    render() {
        let {text, iconClass, shown } = this.props;

        let arrow = shown ? 'icon-angle-down':'icon-angle-right';

        return <div>
            <p><i className={iconClass}/> {text}
                <i className={arrow} style={{float: 'right', fontSize: '150%'}}/></p>
        </div>
    }
}

PaneHeader.defaultProps = {
    text: '',
    iconClass: '',
    shown: false
}

export default PaneHeader