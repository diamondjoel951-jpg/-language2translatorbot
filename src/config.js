require('dotenv').config();

module.exports = {
    // Bot Configuration
    BOT_TOKEN: process.env.BOT_TOKEN,
    PORT: process.env.PORT || 3000,
    
    // API Endpoints
    TRANSLATE_API: process.env.TRANSLATE_API || 'https://libretranslate.com/translate',
    LANGUAGES_API: process.env.LANGUAGES_API || 'https://libretranslate.com/languages',
    DETECT_API: process.env.DETECT_API || 'https://libretranslate.com/detect',
    
    // Bot Settings
    MAX_TEXT_LENGTH: 5000,
    SUPPORTED_LANGUAGES: [
        'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru', 
        'pt', 'ar', 'hi', 'ko', 'nl', 'pl', 'tr', 'vi',
        'th', 'id', 'ms', 'fa'
    ]
};
