import API from './api'

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
        let data = await api.sendRequest('/enterprise-portal/stats/preferenceCentre-config/' + id)
        pcConfig = data || {}

        data = await api.sendRequest('/enterprise-portal/stats/enterprise-icon/' + id)
        enterprise_logo = data || undefined

        data = await api.sendRequest('/enterprise-portal/stats/magicLink-allowed/' + id)
        enterprise_magicLink_allowed = data || undefined

        data = await api.sendRequest('/enterprise-portal/stats/enterprise-name/' + id)
        enterprise_name = data || undefined
    }catch(e){
        console.log('Failed to load enterprise custom prefrence centre configuration')
        return false
    }
    return true
}