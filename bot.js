const TelegramBot = require('node-telegram-bot-api');
const Translator = require('./translator');
const config = require('./config');

class Bot {
    constructor() {
        this.bot = new TelegramBot(config.BOT_TOKEN, { 
            polling: true,
            onlyFirstMatch: true
        });
        this.translator = new Translator();
        this.setupCommands();
        this.setupListeners();
        this.setupErrorHandling();
    }

    setupCommands() {
        this.bot.setMyCommands([
            { command: 'start', description: '🚀 Start the bot' },
            { command: 'help', description: '📖 Show help' },
            { command: 'translate', description: '🔄 Translate: /translate en es Hello' },
            { command: 'languages', description: '🌍 Available languages' },
            { command: 'about', description: 'ℹ️ About this bot' }
        ]);
    }

    setupErrorHandling() {
        this.bot.on('error', (error) => {
            console.error('Bot error:', error);
        });

        this.bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
        });
    }

    setupListeners() {
        // Start command
        this.bot.onText(/\/start/, async (msg) => {
            const chatId = msg.chat.id;
            const welcomeMessage = `
🌐 *Welcome to Language2Translator Bot!*

I'm your AI-powered translation assistant that can translate text between multiple languages.

*✨ Features:*
• Translate between 50+ languages
• Auto-detect source language
• Quick and accurate translations
• Simple commands

*📌 How to Use:*

1️⃣ *Direct Translation*
\`/translate [from] [to] [text]\`
Example: \`/translate en es Hello World\`

2️⃣ *Auto Translation*
Just send me any text and I'll detect the language and translate it to English

3️⃣ *Commands*
/start - Show this message
/help - Detailed guide
/translate - Translate text
/languages - See all languages
/about - About this bot

*Try it now!* Send any text or use /translate
            `;
            
            this.bot.sendMessage(chatId, welcomeMessage, { 
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        });

        // Help command
        this.bot.onText(/\/help/, async (msg) => {
            const chatId = msg.chat.id;
            const helpMessage = `
📚 *Language2Translator - Help Guide*

*🔹 Command Usage:*

• \`/translate [from] [to] [text]\`
  Translate text from one language to another
  Example: \`/translate en es Hello\`

• \`/languages\`
  Show all supported languages

• \`/about\`
  About this bot

• \`/start\`
  Welcome message

*🔹 Language Codes:*
\`en\` - English    \`es\` - Spanish
\`fr\` - French     \`de\` - German
\`it\` - Italian    \`ja\` - Japanese
\`zh\` - Chinese    \`ru\` - Russian
\`pt\` - Portuguese \`ar\` - Arabic
\`hi\` - Hindi      \`ko\` - Korean

*🔹 Auto-Translation:*
Simply send any text and I'll:
1. Detect the language
2. Translate it to English
3. Show you the result

*💡 Tips:*
• Use 2-letter language codes
• For best results, send clear text
• I can handle up to 5000 characters

*Need more help?* Just ask! 😊
            `;
            
            this.bot.sendMessage(chatId, helpMessage, { 
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        });

        // About command
        this.bot.onText(/\/about/, async (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, `
ℹ️ *About Language2Translator Bot*

*Version:* 1.0.0
*Built with:* Node.js & Telegram Bot API
*Translation Engine:* LibreTranslate

*Features:*
✅ 50+ Languages supported
✅ Auto language detection
✅ Fast & accurate translations
✅ Free to use
✅ Open source

*Created by:* Your Name
*Source Code:* GitHub
*Deployment:* Railway

*Made with ❤️ for the Telegram community*
            `, { parse_mode: 'Markdown' });
        });

        // Languages command
        this.bot.onText(/\/languages/, async (msg) => {
            const chatId = msg.chat.id;
            
            if (!this.translator.isReady) {
                this.bot.sendMessage(chatId, '⏳ Loading languages... Please wait a moment.');
                return;
            }

            const languages = this.translator.formatLanguageList();
            this.bot.sendMessage(chatId, languages, { 
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            });
        });

        // Translate command
        this.bot.onText(/\/translate\s+(\w+)\s+(\w+)\s+(.+)/, async (msg, match) => {
            const chatId = msg.chat.id;
            const from = match[1].toLowerCase();
            const to = match[2].toLowerCase();
            const text = match[3].trim();

            // Validate language codes
            if (!this.translator.isLanguageSupported(from)) {
                this.bot.sendMessage(chatId, 
                    `❌ Language code '${from}' not supported.\nUse /languages to see all supported codes.`
                );
                return;
            }

            if (!this.translator.isLanguageSupported(to)) {
                this.bot.sendMessage(chatId, 
                    `❌ Language code '${to}' not supported.\nUse /languages to see all supported codes.`
                );
                return;
            }

            // Send typing indicator
            this.bot.sendChatAction(chatId, 'typing');

            try {
                const translated = await this.translator.translate(text, from, to);
                const fromName = this.translator.getLanguageName(from);
                const toName = this.translator.getLanguageName(to);

                this.bot.sendMessage(chatId, 
                    `🔄 *Translation (${fromName} → ${toName}):*\n\n${translated}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (error) {
                this.bot.sendMessage(chatId, 
                    `❌ *Error:* ${error.message}\n\nPlease check your input and try again.`,
                    { parse_mode: 'Markdown' }
                );
            }
        });

        // Auto-translate any text (non-command messages)
        this.bot.on('message', async (msg) => {
            const chatId = msg.chat.id;
            const text = msg.text;

            // Skip if message is a command or empty
            if (!text || text.startsWith('/')) return;

            // Skip if message is too short
            if (text.length < 3) {
                this.bot.sendMessage(chatId, 
                    '📝 Send me a longer text (at least 3 characters) for translation.'
                );
                return;
            }

            // Send typing indicator
            this.bot.sendChatAction(chatId, 'typing');

            try {
                // Detect language
                const detection = await this.translator.detectLanguage(text);
                
                if (!detection || detection.confidence < 0.3) {
                    this.bot.sendMessage(chatId, 
                        `⚠️ Could not detect language with confidence.\n` +
                        `Try using: /translate en es Your text`
                    );
                    return;
                }

                const detectedLang = detection.language;
                const confidence = (detection.confidence * 100).toFixed(1);

                // If already English, don't translate
                if (detectedLang === 'en') {
                    this.bot.sendMessage(chatId, 
                        `ℹ️ *Text is already in English*\n\n` +
                        `Detected: ${this.translator.getLanguageName('en')} (${confidence}%)\n` +
                        `Use /translate to translate to other languages.`,
                        { parse_mode: 'Markdown' }
                    );
                    return;
                }

                // Translate to English
                const translated = await this.translator.translate(text, detectedLang, 'en');
                const langName = this.translator.getLanguageName(detectedLang);
                
                this.bot.sendMessage(chatId, 
                    `🔍 *Detected:* ${langName} (${confidence}% confidence)\n` +
                    `📝 *English Translation:*\n\n${translated}`,
                    { parse_mode: 'Markdown' }
                );
            } catch (error) {
                console.error('Auto-translation error:', error.message);
                // Silent fail - don't spam user with errors
            }
        });

        console.log('✅ Bot commands and listeners initialized');
    }

    start() {
        console.log('🚀 Language2Translator Bot is running!');
        console.log('📱 Bot username: @language2translatorbot');
        console.log(`🌐 Web server on port ${config.PORT}`);
        console.log('✅ Ready to translate!');
    }
}

module.exports = Bot;
