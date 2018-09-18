import config from './environment.json'

const {protocol, hostname} = window.location
var apiAddress = !config.env ? `${protocol}//${hostname}` : config.env
if (apiAddress.includes('localhost'))
    apiAddress = 'http://trunomi.local'

export default apiAddress