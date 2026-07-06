const axios = require('axios');
const config = require('./config');

class Translator {
    constructor() {
        this.languages = [];
        this.isReady = false;
        this.fetchLanguages();
    }

    async fetchLanguages() {
        try {
            const response = await axios.get(config.LANGUAGES_API, {
                timeout: 10000
            });
            this.languages = response.data;
            this.isReady = true;
            console.log(`✅ Loaded ${this.languages.length} languages`);
        } catch (error) {
            console.error('❌ Error fetching languages:', error.message);
            setTimeout(() => this.fetchLanguages(), 10000);
        }
    }

    async translate(text, from, to) {
        try {
            if (!text || text.length === 0) {
                throw new Error('No text to translate');
            }

            if (text.length > config.MAX_TEXT_LENGTH) {
                throw new Error(`Text too long (max ${config.MAX_TEXT_LENGTH} characters)`);
            }

            const response = await axios.post(config.TRANSLATE_API, {
                q: text,
                source: from,
                target: to,
                format: 'text'
            }, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data.translatedText;
        } catch (error) {
            console.error('Translation error:', error.message);
            if (error.response) {
                throw new Error(`Translation API error: ${error.response.status}`);
            }
            throw new Error('Translation failed. Please try again.');
        }
    }

    async detectLanguage(text) {
        try {
            if (!text || text.length === 0) {
                return null;
            }

            const response = await axios.post(config.DETECT_API, {
                q: text
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return response.data[0] || null;
        } catch (error) {
            console.error('Detection error:', error.message);
            return null;
        }
    }

    getLanguageName(code) {
        const lang = this.languages.find(l => l.code === code);
        return lang ? lang.name : code.toUpperCase();
    }

    isLanguageSupported(code) {
        return config.SUPPORTED_LANGUAGES.includes(code);
    }

    formatLanguageList() {
        if (!this.isReady) {
            return '⏳ Loading languages... Please try again.';
        }

        const popular = this.languages.filter(l => 
            config.SUPPORTED_LANGUAGES.includes(l.code)
        );
        
        const formatted = popular
            .map(l => `• \`${l.code}\` - ${l.name}`)
            .join('\n');

        return `*🌍 Supported Languages:*\n\n${formatted}\n\n_Total: ${popular.length} languages_`;
    }
}

module.exports = Translator;
