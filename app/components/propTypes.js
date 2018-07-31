import PropTypes from 'prop-types';
import API from '../config/api';
import Locale from '../config/locale';

const baseTypes = {
    api: PropTypes.instanceOf(API).isRequired,
    dict: PropTypes.instanceOf(Locale).isRequired
};

export const consentButtonTypes = {
    ...baseTypes,
    state: PropTypes.string.isRequired
};

export const dsrButtonTypes = {
    dataType: PropTypes.object
};

export const trucertButtonTypes = baseTypes;