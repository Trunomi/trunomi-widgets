import React from 'react';
import TrunomiAPI, {Session} from '../config/api';
import propTypeTruConfig from '../config/customPropType';
import Locale from '../config/locale';

export default class BaseWidget extends React.Component {
    constructor(props) {
        super(props);

        let {truConfig} = this.props, {locale} = truConfig;

        if(Session.started){
            this.api = Session.api;
            this.dict = Session.dict;
        }else{
            this.api = new TrunomiAPI(truConfig);
            this.dict = new Locale(locale);
        }
    }

    static propTypes = {
        truConfig: propTypeTruConfig
    };

    static defaultProps = {
        truConfig: {
            apiToken: undefined,
            enterpriseId: undefined,
            customerId: undefined,
            host_addr: undefined,
            locale: 'en-US',
            refreshJWT: false
        }
    };

    // onError: PropTypes.func,
    // static defaultProps = {
    //     onError: _.noop
    // }
}