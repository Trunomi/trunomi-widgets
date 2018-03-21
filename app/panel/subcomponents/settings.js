import * as React from 'react';
import * as BS from 'react-bootstrap';

export default class Settings extends React.Component {

    render() {
        return (
            <BS.Button bsSize="lg" className="black-background white"
                          onClick={()=>{this.props.stateChange([{configModal: true}])}}>
                <BS.Glyphicon glyph="cog" />
            </BS.Button>
        )
    }
}