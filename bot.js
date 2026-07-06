const TelegramBot = require('node-telegram-bot-api');
const Translator = require('./translator');
const config = require('./config');

class Bot {
    constructor() {
        if (!config.BOT_TOKEN) {
            throw new Error('BOT_TOKEN is required!');
        }

        this.bot = new TelegramBot(config.BOT_TOKEN, { 
            polling: true
        });
        
        this.translator = new Translator();
        this.setupCommands();
        this.setupListeners();
        this.setupErrorHandling();
        
        console.log('✅ Bot initialized successfully');
    }

    setupErrorHandling() {
        this.bot.on('error', (error) => {
            console.error('Bot error:', error);
        });

        this.bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
        });
    }

    setupCommands() {
        this.bot.setMyCommands([
            { command: 'start', description: '🚀 Start the bot' },
            { command: 'help', description: '📖 Show help' },
            { command: 'translate', description: '🔄 Translate: /translate en es Hello' },
            { command: 'languages', description: '🌍 Available languages' },
            { command: 'about', description: 'ℹ️ About this bot' }
        ]).catch(err => console.error('Error setting commands:', err));
    }

    setupListeners() {
        // Start command
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, `
🌐 *Welcome to Language2Translator Bot!*

I can translate text between multiple languages.

*Commands:*
/start - Show this message
/help - Detailed guide
/translate [from] [to] [text] - Translate text
/languages - See all languages
/about - About this bot

*Example:*
/translate en es Hello World
            `, { parse_mode: 'Markdown' });
        });

        // Help command
        this.bot.onText(/\/help/, async (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, `
📚 *Help Guide*

*Translate:*
/translate en es Hello World

*Language Codes:*
en - English | es - Spanish | fr - French
de - German | it - Italian | ja - Japanese

*Auto-Translate:*
Just send any text and I'll translate it to English

*Commands:*
/start - Welcome
/help - This help
/languages - All languages
/about - About
            `, { parse_mode: 'Markdown' });
        });

        // Languages command
        this.bot.onText(/\/languages/, async (msg) => {
            const chatId = msg.chat.id;
            const list = this.translator.formatLanguageList();
            this.bot.sendMessage(chatId, list, { parse_mode: 'Markdown' });
        });

        // About command
        this.bot.onText(/\/about/, async (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, `
ℹ️ *About Language2Translator Bot*

Version: 1.0.0
Powered by: LibreTranslate API
Languages: 50+ supported

*Features:*
✅ Translate between 50+ languages
✅ Auto-detect source language
✅ Free to use

Made with ❤️ for Telegram
            `, { parse_mode: 'Markdown' });
        });

        // Translate command
        this.bot.onText(/\/translate\s+(\w+)\s+(\w+)\s+(.+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const from = match[1].toLowerCase();
            const to = match[2].toLowerCase();
            const text = match[3].trim();

            if (!this.translator.isLanguageSupported(from)) {
                this.bot.sendMessage(chatId, `❌ Language '${from}' not supported. Use /languages`);
                return;
            }

            if (!this.translator.isLanguageSupported(to)) {
                this.bot.sendMessage(chatId, `❌ Language '${to}' not supported. Use /languages`);
                return;
            }

            this.bot.sendChatAction(chatId, 'typing');

            try {
                const translated = await this.translator.translate(text, from, to);
                const fromName = this.translator.getLanguageName(from);
                const toName = this.translator.getLanguageName(to);

                this.bot.sendMessage(chatId, 
                    `🔄 *${fromName} → ${toName}:*\n\n${translated}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (error) {
                this.bot.sendMessage(chatId, 
                    `❌ Error: ${error.message}`
                );
            }
        });

        // Auto-translate
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            if (!text || text.startsWith('/')) return;
            if (text.length < 3) return;

            this.bot.sendChatAction(chatId, 'typing');

            try {
                const detection = await this.translator.detectLanguage(text);
                if (!detection || detection.confidence < config.MIN_CONFIDENCE) return;

                const detectedLang = detection.language;
                if (detectedLang === 'en') {
                    this.bot.sendMessage(chatId, 
                        `ℹ️ Text is already in English`
                    );
                    return;
                }

                const translated = await this.translator.translate(text, detectedLang, 'en');
                const langName = this.translator.getLanguageName(detectedLang);
                
                this.bot.sendMessage(chatId, 
                    `🔍 *Detected:* ${langName}\n📝 *English:*\n\n${translated}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (error) {
                // Silent fail
                console.error('Auto-translate error:', error.message);
            }
        });

        console.log('✅ Bot listeners set up');
    }

    start() {
        console.log('🚀 Language2Translator Bot is running!');
        console.log('📱 Ready to translate!');
    }
}

module.exports = Bot;
