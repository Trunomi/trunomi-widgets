import * as React from 'react';
import * as BS from 'react-bootstrap';

export default class Fingerprint extends React.Component {
    constructor() {
        super();
        this.state = {
            showFullTruCert: false,
        };
    }

    // set toggles the showFullTruCert state value
    toggleFullTruCertState = () => {
        let {showFullTruCert} = this.state;
        this.setState({showFullTruCert: !showFullTruCert})
    }

    // renders the TruCert string
    renderTruCertFingerPrint = (fingerprint) => {
        let moreLess = this.state.showFullTruCert ? 'less' : 'more';
        return <div class="mt3 fw5 f4">
            {this.state.showFullTruCert ? fingerprint : fingerprint.substring(0, 50)}
            <br/>
            <BS.Button bsStyle="link" onClick={() => this.toggleFullTruCertState()}>{moreLess}</BS.Button>
        </div>
    }

    render() {
        const trucertFingerprintStyle = {
            "overflowWrap": 'break-word'
        };
        let {fingerprint} = this.props;
        return (
            <div className="webTBlRow">
                <div className="webTblCol">
                    <label className="f4 fw2 mv3 lh-title blue">TruCert Fingerprint: </label>
                    <div className="modalSec fingerprint" style={trucertFingerprintStyle}>
                        {this.renderTruCertFingerPrint(fingerprint)}
                    </div>
                </div>
            </div>
        )
    }
}

