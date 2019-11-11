/**
 Functions to manage locale (languages)
 */
class Locale{
    constructor(customLocale){
        let lang;
        try {
            lang =  customLocale || window.navigator.userLanguage || window.navigator.language;
            lang = lang.replace('_', '-');
            if (!lang.includes('-'))
                lang += `-${lang.toUpperCase()}`
        }catch(error){
            lang = null
        }

        this.locale = lang || 'en-US';
    }

    getName(nameDict){
        try{
            return nameDict[this.locale] || similarKey(nameDict, this.locale) || nameDict[Object.keys(nameDict)[0]];
        }catch(e){
            console.log(nameDict, e)
            return '';
        }
    }
}

function similarKey(dictionary, key){
    for (let k in Object.keys(dictionary)){
        if (k.startsWith(key))
            return dictionary[key]
    }
    return undefined
}

export default Locale