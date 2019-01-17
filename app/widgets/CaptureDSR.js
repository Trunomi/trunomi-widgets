import React from 'react';
import * as BS from 'react-bootstrap';
import _ from 'lodash';
import PropTypes from 'prop-types';
import CustomPanel, {blueStyle} from "../components/CustomPanel";
import {LoadingInline} from "../components/Loading";
import BaseWidget from "./Base"
import { withStyles, Button, FormControl, Radio, FormControlLabel, Fade} from '@material-ui/core';
import {submitButtonDict} from '../config/widgetDict'

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
            dataType: null,
            loaded: false,
            finished: false,
            show: this.props.show,
            selectedReason: null,
            otherReason: "",
            notice: '',
            missingOption: false
        };
    }

    async componentWillMount() {
        let {dataTypeId, dataType, type} = this.props;

        try {
            if(!dataType) {
                dataType = await this.api.sendRequest('/data-type/' + dataTypeId);
            }

            if(!dataType[type + 'Definition']) {
                this.setState({
                    notice: <p><b>Unfortunately</b>, {this.dict.getName(dataType.name)} does not allow {type} requests</p>,
                    finished: true
                });
                return
            }

            if (typeof dataType[type + 'Definition'] === 'string'){
                dataType[type + 'Definition'] = JSON.parse( dataType[type + 'Definition'])
            }
            this.setState({dataType, loaded: true});
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

        let {otherReason, selectedReason, dataType} = this.state, {type} = this.props;
        let {reasons} = dataType[type + 'Definition'];

        let types = {
            'access': 'dar',
            'object': 'dor',
            'rectify': 'drr',
            'erasure': 'der'
        };

        const DPO = sessionStorage.getItem("TRUNOMI_DPO")
        const MOC = sessionStorage.getItem("TRUNOMI_MOC")

        if (selectedReason === null){
            return this.setState({missingOption: true})
        }

        try {
            let page = "/ledger/context/"+ dataType.id + "/" + types[type];
            let text = this.dict.getName(reasons[selectedReason]);
            if (text.includes('Please specify'))
                text = otherReason;
            let body = {
                payload: {
                    reasons: [text]
                }
            };

            if (MOC && DPO)
                body.payload['moc'] = `Entered through the Trunomi portal by DPO (${DPO}). Collected via ${MOC}.`

            await this.api.sendRequest(page, 'post', body);
            this.setState({
                notice: <p>Your request has been <b>received</b>. Please note that it takes up to
                    30 days to review the request</p>, //Demo purposes
                finished: true
            });
            this.props.onSuccess();
        }
        catch(error) {
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

    handleReasonChange = (id) => {
        this.setState({selectedReason: id, missingOption: false});
    }

    handleOtherReason = (event) => {
        this.setState({otherReason: event.target.value});
    }

    renderReasons = (reasons) => {
        let {selectedReason, otherReason} = this.state;

        return <div className={this.props.classes.options}>
            {reasons.map((element, id)=>{
                let text = this.dict.getName(element);

                return <React.Fragment key={id}>
                    <FormControlLabel
                            control={<Radio checked={selectedReason === id} onChange={this.handleReasonChange.bind(this, id)} color="primary" />}
                            label={text}
                    />
                    {_.includes(text, 'Please specify') && (selectedReason === id) &&
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
            {dataType, loaded, finished, show, notice, missingOption} = this.state, display;

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
            let {title, reasons, reasonsTitle, widgetData} = dataType[type + 'Definition'];

            reasons = reasons || []; //So the widget doesn't fail

            display = <div id='capture-dsr'>
                <p id='capture-dsr-title' style={{fontSize: '18px'}}>{this.dict.getName(title)}</p>
                <p id='capture-dsr-help' style={{padding: '5px', fontSize: '16px'}}>
                    {this.dict.getName(reasonsTitle)}
                </p>
                <form onSubmit={this.sendDSRquery} id='capture-dsr-body'>
                    {this.renderReasons(reasons)}
                    {missingOption && <small style={{color: 'red', fontWeight: 'bold'}}>Please select a reason</small>}
                    <Button id='capture-dsr-button' type='submit' fullWidth variant="contained" color="primary" className={classes.button}>
                        {this.dict.getName(submitButtonDict)}
                    </Button>
                    {widgetData && widgetData.finalCopy && 
                        <p id='capture-dsr-bottom-help'>{this.dict.getName(widgetData.finalCopy)}</p>
                    }
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