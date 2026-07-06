const dotenv = require('dotenv');
dotenv.config();

// Check if BOT_TOKEN exists
if (!process.env.BOT_TOKEN) {
    console.error('❌ ERROR: BOT_TOKEN not found in environment variables!');
    console.error('Please set BOT_TOKEN in your .env file or Railway variables.');
    process.exit(1);
}

module.exports = {
    BOT_TOKEN: process.env.BOT_TOKEN,
    PORT: process.env.PORT || 3000,
    TRANSLATE_API: 'https://libretranslate.com/translate',
    LANGUAGES_API: 'https://libretranslate.com/languages',
    DETECT_API: 'https://libretranslate.com/detect',
    MAX_TEXT_LENGTH: 5000,
    MIN_CONFIDENCE: 0.3,
    SUPPORTED_LANGUAGES: [
        'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru',
        'pt', 'ar', 'hi', 'ko', 'nl', 'pl', 'tr', 'vi',
        'th', 'id', 'ms', 'fa'
    ]
};
