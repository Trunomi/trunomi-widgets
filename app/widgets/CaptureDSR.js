import React from 'react';
import * as BS from 'react-bootstrap';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CustomPanel, {blueStyle} from "../components/CustomPanel";
import {LoadingInline} from "../components/Loading";
import BaseWidget from "./Base"
import { withStyles, Button, FormControl, Radio, FormControlLabel, Fade} from '@material-ui/core';

const styles = theme => ({
    options: {
        display: 'flex',
        flexDirection: 'column'
    }
})

/**
 * Data subject request widget for a data Type / dsr type. Props the user for
 * a reason and sends the request to the Trunomi platform.
 */
class CaptureDSR extends BaseWidget {
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
    }

    async componentWillMount() {
        let {dataTypeId, dataType, type} = this.props;

        if(dataType) {
            this.setState({dataType: dataType, loaded: true});
        }
        try {
            let data = await this.api.sendRequest('/data-type/' + dataTypeId);

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

        let {otherReason, selectedReasons, dataType} = this.state, {type} = this.props,
            index = selectedReasons.indexOf('Other (Please specify)');
        let {reasons} = dataType[type + 'Definition'];

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
            let page = "/ledger/context/"+ dataType.id + "/" + types[type];
            let body = {
                payload: {
                    reasons: selectedReasons.length ? selectedReasons.map((id)=>{
                        let text = this.dict.getName(reasons[id]);
                        if (text.includes('Please specify'))
                            return otherReason;
                        return text
                    }): ["Not Specified"]
                }
            };
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

    handleReasonChange = (id, maxSelections) => {
        let {selectedReasons} = this.state;

        if (selectedReasons.includes(id))
            _.pull(selectedReasons, id);
        else {
            if (selectedReasons.length.toString() === maxSelections)
                _.pullAt(selectedReasons, 0);
            selectedReasons.push(id);
        }
        this.setState({selectedReasons});
    }

    handleOtherReason = (event) => {
        this.setState({otherReason: event.target.value});
    }

    renderReasons = (reasons, maxSelections) => {
        let {selectedReasons, otherReason} = this.state;

        return <div className={this.props.classes.options}>
            {reasons.map((element, id)=>{
                let text = this.dict.getName(element);

                return <React.Fragment>
                    <FormControlLabel
                            key={id}
                            control={<Radio inputProps={{required: true}} checked={selectedReasons.includes(id)} onChange={this.handleReasonChange.bind(this, id, maxSelections)} color="primary" />}
                            label={text}
                    />
                    {_.includes(text, 'Please specify') && _.includes(selectedReasons, id) &&
                        <Fade in>
                            <BS.FormControl type="text" required
                                value={otherReason}
                                placeholder="Specify your reason"
                                onChange={this.handleOtherReason.bind(this)}/>
                        </Fade>
                    }
                </React.Fragment>;
            })}
        </div>
    }

    render() {
        let {type, style, classes} = this.props,
            {dataType, loaded, finished, show, notice, selectedReasons} = this.state, display;

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
                <p style={{fontSize: '18px'}}>{this.dict.getName(title)}</p>
                <p style={{padding: '5px', fontSize: '16px'}}>
                    {this.dict.getName(reasonsTitle)}
                    {selections>1 && <small> (Up to {selections} reasons can be selected)</small>}
                </p>
                <form onSubmit={this.sendDSRquery}>
                    {this.renderReasons(reasons, selections)}
                    <Button type='submit' fullWidth variant="contained" color="primary" className={classes.button}>
                        Submit
                    </Button>
                    <p>{widgetData && this.dict.getName(widgetData.finalCopy)}</p>
                </form>
            </div>
        }


        return <CustomPanel style={style} onClose={this.closeWidget}>{display}</CustomPanel>
    }
}

export default withStyles(styles)(CaptureDSR)

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