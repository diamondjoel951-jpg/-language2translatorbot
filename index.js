const express = require('express');
const Bot = require('./bot');
const config = require('./config');

console.log('🚀 Starting Language2Translator Bot...');

// Initialize Express
const app = express();

// Health check endpoints
app.get('/', (req, res) => {
    res.json({ 
        status: 'online', 
        bot: 'Language2Translator',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        uptime: process.uptime()
    });
});

// Start bot
let bot;
try {
    bot = new Bot();
    bot.start();
} catch (error) {
    console.error('❌ Failed to start bot:', error.message);
    process.exit(1);
}

// Start server
const PORT = config.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Web server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Shutting down...');
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
});
