import React from 'react';
import {Panel} from 'react-bootstrap';
import PropTypes from 'prop-types';
import ErrorIcon from '@material-ui/icons/Warning';

class ErrorPanel extends React.Component {

    render() {
        let {header, text} = this.props;

        return <Panel bsStyle="danger">
            <Panel.Heading>
                <Panel.Title style={{fontWeight: 'bold'}}>
                    <ErrorIcon/>  {header}
                </Panel.Title>
            </Panel.Heading>
            <Panel.Body>
                <p className='text-danger'>{text}</p>
            </Panel.Body>
        </Panel>
    }
}

ErrorPanel.propTypes = {
    header: PropTypes.string,
    text: PropTypes.string
};

ErrorPanel.defaultProps = {
    header: 'Oops. We encountered a problem.',
    text: `Could not establish connection with the Trunomi service.\
           Please ask your administrator to verify  your Trunomi Host Address,  Enterprise ID, and API Token`
};

export default ErrorPanel;