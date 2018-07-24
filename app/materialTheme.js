import blue from '@material-ui/core/colors/blue'
import {createMuiTheme} from '@material-ui/core/styles'

let trunomiBlue = '#0265B0'
export default createMuiTheme({
    palette: {
        primary: {
            light: blue[300],
            main: trunomiBlue,
            dark: blue[700],
            contrastText: '#fff',
        },
    },
    typography: {
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
});