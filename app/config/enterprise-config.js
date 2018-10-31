import API from './api'
import Axios from 'axios'
import api_addr from './env'

export var pcConfig = {}
export var enterprise_logo = undefined
export var enterprise_name = undefined
export var enterprise_magicLink_allowed = undefined
export var isPreview = false

export const iframeHost = 'https://d3q8etrhaoye5l.cloudfront.net'

export async function loadConfigurations(enterpriseId, api_addr_custom){
    const api = new API()
    api.loadConfig()

    if (!enterpriseId && !api.isConfigured())
        return

    try{
        const id = enterpriseId || api.truConfig.enterpriseId
        const addr = api_addr_custom || (api.truConfig && api.truConfig.host_addr) || api_addr

        let req = await Axios.get(addr + '/enterprise-portal/stats/enterprise-name/' + id)
        enterprise_name = req.data || undefined

        // For the preview through the portal
        const fromSession = JSON.parse(sessionStorage.getItem('TRUNOMI_PC_CONFIG'))
        if(fromSession){
            pcConfig = fromSession.pcConfig || {}
            enterprise_logo = fromSession.icon || undefined
            enterprise_magicLink_allowed = fromSession.magicLink || undefined
            isPreview = true
        }
        else{
            req = await Axios.get(addr + '/enterprise-portal/stats/enterprise-icon/' + id)
            enterprise_logo = req.data || undefined
    
            req = await Axios.get(addr + '/enterprise-portal/stats/magicLink-allowed/' + id)
            enterprise_magicLink_allowed = req.data || undefined

            req = await Axios.get(addr + '/enterprise-portal/stats/preferenceCentre-config/' + id)
            pcConfig = req.data || {}

            isPreview = false
        }
    }catch(e){
        console.log('Failed to load enterprise custom prefrence centre configuration', e)
        return false
    }
    return true
}