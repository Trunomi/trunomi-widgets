import React from 'react';
import * as BS from 'react-bootstrap';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CustomPanel, {blueStyle} from "../components/CustomPanel";
import {LoadingInline} from "../components/Loading";
import BaseWidget from "./Base"

/**
 * Data subject request widget for a data Type / dsr type. Props the user for
 * a reason and sends the request to the Trunomi platform.
 */
export default class CaptureDSR extends BaseWidget {
    constructor(props) {
        super(props);
        this.state = {
            dataType: '',
            loaded: false,
            finished: false,
            show: this.props.show,
            selectedReasons: [],
            otherReason: "",
            notice: ''
        };
        this.sendDSRquery = this.sendDSRquery.bind(this);
        this.closeWidget = this.closeWidget.bind(this);
    }

    async componentWillMount() {
        let {dataTypeId, dataType, type} = this.props;

        if(dataType) {
            this.setState({dataType: dataType, loaded: true});
        }
        try {
            let data = await this.api.getDataTypes(dataTypeId);

            if(!data[type + 'Definition']) {
                this.setState({
                    notice: <p><b>Unfortunately</b>, {this.dict.getName(data.name)} does not allow {type} requests</p>,
                    finished: true
                });
            }
            else {
                this.setState({dataType: data, loaded: true});
            }
        }
        catch (error) {
            console.log(error);
            this.props.onError(error);
            this.setState({notice: <p><b>Error</b>: failed to reach the Trunomi platform</p>, finished: true})
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({show: nextProps.show});
    }

    sendDSRquery = async (event) => {
        event.preventDefault();

        let {id} = this.state.dataType, {otherReason, selectedReasons} = this.state, {type} = this.props,
            index = selectedReasons.indexOf('Other (Please specify)');

        if (index >= 0){
            selectedReasons[index] = otherReason;
        }

        let types = {
            'access': 'dar',
            'object': 'dor',
            'rectify': 'drr',
            'erasure': 'der'
        };

        try {
            let page = "/ledger/context/"+ id + "/" + types[type],
                body = {payload: {reasons: selectedReasons}};

            await this.api.sendRequest(page, 'post', body);
            this.setState({
                notice: <p>Your request has been <b>received</b>. Please note that it takes up to
                    30 days to review the request</p>, //Demo purposes
                finished: true
            });
            this.props.onSuccess();
        }
        catch(error) {
            console.log(error);
            this.setState({
                notice: <p><b>Unfortunately</b> we were unable to register your request.
                    There is already a data {type} request pending for {this.dict.getName(this.state.dataType.name)}.</p>,
                finished: true
            });
            this.props.onError(error);
        }
    }

    closeWidget = () => {
        this.setState({show: false});
        this.props.onClose();
    }

    handleReasonChange = (value, maxSelections) => {
        let {selectedReasons} = this.state;

        if (selectedReasons.includes(value))
            _.pull(selectedReasons, value);
        else {
            if (selectedReasons.length.toString() === maxSelections)
                _.pullAt(selectedReasons, 0);
            selectedReasons.push(value);
        }
        this.setState({selectedReasons});
    }

    handleOtherReason = (event) => {
        this.setState({otherReason: event.target.value});
    }

    renderReasons = (reasons, maxSelections) => {
        let {selectedReasons, otherReason} = this.state;

        return <BS.FormGroup>
            {reasons.map((element, id)=>{
                let text = this.dict.getName(element);

                return <div key={id}>
                    {maxSelections == 1 ?
                        <BS.Radio name="radioGroup" required
                                  checked={selectedReasons.includes(text)}
                                  onChange={this.handleReasonChange.bind(this, text, maxSelections)}>
                            {text}
                        </BS.Radio>
                        :
                        <BS.Checkbox checked={selectedReasons.includes(text)}
                                     required={selectedReasons.length < 1}
                                     onChange={this.handleReasonChange.bind(this, text, maxSelections)}>
                            {text}
                        </BS.Checkbox>
                    }
                    {_.includes(text, 'Please specify') && _.includes(selectedReasons, 'Other (Please specify)') &&
                    <BS.FormControl type="text" required
                                    value={otherReason}
                                    placeholder="Specify your reason"
                                    onChange={this.handleOtherReason.bind(this)}/>
                    }
                </div>;
            })}
        </BS.FormGroup>
    }

    render() {
        let {type, style} = this.props,
            {dataType, loaded, finished, show, notice} = this.state, display;

        if(!show)
            return null;

        if (finished) {
            display = <div>
                {<strong>Thank you</strong>}
                {notice}
            </div>;
        }
        else if(!loaded)
            display = <LoadingInline/>;
        else{
            let {title, reasons, reasonsTitle, widgetData, selections} = dataType[type + 'Definition'];

            reasons = reasons || []; //So the widget doesn't fail

            display = <div>
                <strong>{this.dict.getName(title)}</strong>
                <p style={{padding: '5px'}}>
                    {this.dict.getName(reasonsTitle)}
                    {selections>1 && <small> (Up to {selections} reasons can be selected)</small>}
                </p>
                <form onSubmit={this.sendDSRquery}>
                    {this.renderReasons(reasons, selections)}
                    <BS.Button type='submit' className={'btn-block'} style={{maxWidth: '500px'}}>
                        Submit
                    </BS.Button>
                    <p>{widgetData && this.dict.getName(widgetData.finalCopy)}</p>
                </form>
            </div>
        }


        return <CustomPanel style={style} onClose={this.closeWidget}>{display}</CustomPanel>
    }
}

CaptureDSR.propTypes = {
    ...BaseWidget.propTypes,
    dataTypeId: PropTypes.string.isRequired,//TODO: custom error (or dataTypeID or dataType must be a proper prop)
    dataType: PropTypes.object,
    type: PropTypes.oneOf(['rectify', 'object', 'access', 'erasure']).isRequired,
    onError: PropTypes.func,
    onSuccess: PropTypes.func,
    onClose: PropTypes.func,
    show: PropTypes.bool,
    style: PropTypes.object
};

CaptureDSR.defaultProps = {
    show: true,
    style: {},
    onError: _.noop,
    onSuccess: _.noop,
    onClose: _.noop
};