import API from './api'
import Axios from 'axios'

export var pcConfig = {}
export var enterprise_logo = undefined
export var enterprise_name = undefined
export var enterprise_magicLink_allowed = undefined

export async function loadConfigurations(enterpriseId){
    // For the preview through the portal
    const fromSession = sessionStorage.getItem('TRUNOMI_PC_CONFIG')
    if(fromSession){
        pcConfig = JSON.parse(pcConfig) || {}
        return
    }
    
    const api = new API()
    api.loadConfig()

    if (!enterpriseId && !api.isConfigured())
        return

    try{
        const id = enterpriseId || api.truConfig.enterpriseId
        const host_addr = window.location.protocol + '//' + window.location.hostname

        let req = await Axios.get(host_addr + '/enterprise-portal/stats/preferenceCentre-config/' + id)
        pcConfig = req.data || {}

        req = await Axios.get(host_addr + '/enterprise-portal/stats/enterprise-icon/' + id)
        enterprise_logo = req.data || undefined

        req = await Axios.get(host_addr + '/enterprise-portal/stats/magicLink-allowed/' + id)
        enterprise_magicLink_allowed = req.data || undefined

        req = await Axios.get(host_addr + '/enterprise-portal/stats/enterprise-name/' + id)
        enterprise_name = req.data || undefined
    }catch(e){
        console.log('Failed to load enterprise custom prefrence centre configuration', e)
        return false
    }
    return true
}