import React from 'react';

export default class WaitingConfig extends React.Component {

    render() {
        let style = {
            fontWeight: 'bold',
            height: '70vh',
            fontSize: '25',
            color: 'grey'
        };
        return <div className='loadingContainer'>
            <div className='loadingRow' style={style}>
                {this.props.children}
            </div>
        </div>
    }
}