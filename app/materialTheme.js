import blue from '@material-ui/core/colors/blue'
import {createMuiTheme} from '@material-ui/core/styles'
import {pcConfig} from './config/enterprise-config'

let trunomiBlue = '#0a4fa1'

export default function getTheme() {
    return createMuiTheme ({
        palette: {
            primary: {
                light: blue[300],
                main: trunomiBlue,
                dark: blue[700],
                contrastText: '#fff',
            },
        },
        typography: {
            fontFamily: 'Montserrat',
            title: {
                color: trunomiBlue,
                fontWeight: 500,
                fontSize: 16,
                textTransform: 'none'
            },
            body1: {
                fontSize: 12,
                color: '#818181'
            },
            body2: {
                fontSize: 12
            },
            subheading: {
                fontSize: 13
            }
        },
        overrides: {
            MuiButton: {
                label: {
                    fontSize: 14,
                }
            },
            MuiFormControlLabel: {
                root: {
                    margin: 0,
                    height: '40px'
                },
            }
        }
    })
}