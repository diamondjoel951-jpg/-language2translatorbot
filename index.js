const express = require('express');
const cors = require('cors');
const Bot = require('./bot');
const config = require('./config');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoints for Railway
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: 'Language2Translator',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        memory: process.memoryUsage()
    });
});

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start the bot
let bot;
try {
    bot = new Bot();
    bot.start();
} catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
}

// Start the server
const PORT = config.PORT;
const server = app.listen(PORT, () => {
    console.log(`✅ Web server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const shutdown = () => {
    console.log('🛑 Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Web server closed');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Error handling
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    // Log but don't crash
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});
