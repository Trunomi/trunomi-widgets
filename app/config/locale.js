/**
 Functions to manage locale (languages)
 */
class Locale{
    constructor(customLocale){
        let lang;
        try {
            lang =  customLocale || window.navigator.userLanguage || window.navigator.language;
        }catch(error){}

        if(lang) {
            lang = lang.replace('_', '-');
            if (lang.startsWith('es'))
                lang = 'es-ES';
        }

        this.locale = lang || 'en-US';
    }

    getName(nameDict){
        try{
            return nameDict[this.locale] || nameDict[Object.keys(nameDict)[0]];
        }catch(e){
            return '';
        }
    }
}

export default Locale