import React from 'react';
import ConsentsWidget from "./widgets/Consent";
import ActiveDSRWidget from "./widgets/ActiveDSR";
import DSRWidget from "./widgets/DSR";
import CaptureDSR from './widgets/CaptureDSR';
import CaptureConsent from './widgets/CaptureConsent';
import UserPreferences from './widgets/Preferences';
import Trucert from './widgets/Trucert';
import NewDSR from './widgets/NewDSR';
import NewConsents from './widgets/NewConsents';

import {startSession, stopSession} from "./config/api";
import {loadConfigurations} from './config/enterprise-config'

import './assets/style/css/bootstrap-theme.css';
import './assets/style/helper.css';
import './assets/style/css/bootstrap.min.css';

import './assets/animate.min.css';
import './assets/custom.css';

export {
    UserPreferences,
    ConsentsWidget,
    ActiveDSRWidget,
    DSRWidget,
    CaptureConsent,
    CaptureDSR,
    NewDSR,
    NewConsents,
    Trucert,
    startSession,
    stopSession,
    loadConfigurations,
}