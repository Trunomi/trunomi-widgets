import React from 'react';
import API from '../config/api';
import {CaptureConsent} from '../index';
import WaitingConfig from "../components/WaitingConfig";

class NewConsents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            show: {},
            loading: true,
        };

        this.api = new API(this.props.truConfig);
    }

    async componentWillMount() {
        let newConsents = await this.api.getNewConsents(true);

        this.setState({data: newConsents, loading: false});
    }

    close = (key) => {
        let {show} = this.state;
        show[key] = false;

        this.setState({show})
    }

    render() {
        let {data, show, loading} = this.state;

        if (loading)
            return null;

        return <div>
            {
                data.map((elem, i)=>{
                    return <CaptureConsent key={i} contextId={elem[0]} consentId={elem[1]} {...this.props}
                                           show={show[i] !== false}
                                           onClose={this.close.bind(null, i)}/>
                })
            }
            {data.length === 0 &&
                <WaitingConfig>
                    This customer doesn't have any new Permissions
                </WaitingConfig>
            }
        </div>
    }
}

NewConsents.defaultProps = {
    onSuccess: _.noop
};

export default NewConsents