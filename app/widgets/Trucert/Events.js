import * as React from 'react';
import * as _ from 'lodash';
import Table from '../../components/DynamicTable';
import * as moment from 'moment';
// import Store from '../store';

export default class Events extends React.Component {
    constructor(props) {
        super(props);
    }

    arrayToString(input) {
        let output = '';
        _.map(input, (inp) => {
            output += inp + ', '
        });

        output = output.substring(0, output.length - 2);
        return output
    }

    eventData(payload = {}, i, header) {
        let res = [];
        if (_.size(payload)) {
            let message = payload["message"];
            let moc = payload["moc"];
            let products = payload["gf_products"];
            let justification = payload["justification"];
            let preferences = payload["gf_preferences"];

            if (message && message !== '')
                res.push(["Message", message]);
            if (moc && moc !== '')
                res.push(["Method of Collection", moc]);
            if (justification && justification !== '')
                res.push(["Justification", justification]);
            if (products && _.size(products))
                res.push(["Products", this.arrayToString(products)])
            if (preferences && _.size(preferences))
                res.push(["Preferences", this.arrayToString(preferences)])
        }
        return res;
    }



    render() {
        let {ledger, pcConfig} = this.props;
        let data, header = [];
        let payload = {};
        if (_.size(ledger)) {
            return _.map(ledger, (led, i) => {
                payload = JSON.parse(led.payload);
                header = [
                    [_.startCase(led.event).replace("Consent", "Permission")],
                    moment.unix(_.toInteger(led.capturedAt) / 1000).format("MMMM Do YYYY, h:mm a")
                ];
                data = this.eventData(payload, i, header);
                let renderedBody
                if (_.size(data)) {
                    renderedBody = <div classs="mb3">
                        {
                            _.map(data, (e, i) => {
                                return <h1 class="f5 fw2 mv3 lh-title tl" style={pcConfig.truCertHistoryTextFont}>
                                <span class="dark-gray" style={pcConfig.truCertHistoryTextFont}>{e[0]}: </span>{e[1]}
                                </h1>
                            })
                        }
                    </div>
                } else {
                    renderedBody = <div></div>
                }
                return <div><h1 class="f4 fw2 mv3 lh-title tl bb b--light-gray" style={pcConfig.truCertHistoryTitleFont}>
                <span class="blue" style={pcConfig.truCertHistoryHighlightedTitleSectionFont}>{header[0]}: </span>{header[1]}
                </h1>
                {renderedBody}
                </div>
            })
        }
        else {
            return <div>Loading</div>
        }
    }

}
