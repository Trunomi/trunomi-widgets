import * as React from 'react';
import * as BS from 'react-bootstrap';

export default class DeveloperButton extends React.Component {

    render() {
        let {dev, stateChange} = this.props;
        return <div style={{paddingTop: '20px'}}>
            <BS.Checkbox inline onChange={() => stateChange([{dev: !dev}])} checked={dev}>
                Developer View
            </BS.Checkbox>
        </div>
    }
}