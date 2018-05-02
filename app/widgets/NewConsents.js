import React from 'react';
import API from '../config/api';
import {CaptureConsent} from '../index';
import WaitingConfig from "../components/WaitingConfig";

class NewConsents extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: []
        };

        this.api = new API(this.props.truConfig);
    }

    async componentWillMount() {
        await this.loadData();
    }

    loadData = async () => {
        try {
            var contexts = await this.api.getContexts(null, true),
                rights = await this.api.sendRequest('/rights/query', 'POST');
        }
        catch (error) {
            console.log(error);
        }

        let newConsents = await this.api.getNewConsents(true)

        this.setState({data: newConsents});
    }


    render() {
        let {data} = this.state;

        return <div>
            {
                data.map((elem, i)=>{
                    return <CaptureConsent key={i} contextId={elem[0]} consentId={elem[1]} {...this.props}/>
                })
            }
            {data.length === 0 &&
                <WaitingConfig>
                    This customers doesn't have any new consents.
                </WaitingConfig>
            }
        </div>
    }
}

NewConsents.defaultProps = {
    show: true,
    style: {},
    onError: _.noop,
    onSuccess: _.noop,
    onClose: _.noop
};

export default NewConsents