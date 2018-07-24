import ReactDOM from 'react-dom';
import React from 'react';
import Router from './router';
import theme from './materialTheme'
import {MuiThemeProvider} from '@material-ui/core'
import 'typeface-roboto'

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
        <Router />
    </MuiThemeProvider>,
    document.getElementById('root'));