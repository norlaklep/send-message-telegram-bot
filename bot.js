const TelegramBot = require('node-telegram-bot-api');
const { sendEmail } = require('./email');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

function sendTelegramMessage(chatId, message) {
    bot.sendMessage(chatId, message);
}

function initBot() {
    // Handle /start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const welcomeMessage = `
Selamat datang! Untuk mengirim pesan, Anda bisa melewati email atau Telegram.
Gunakan perintah:
- /email untuk mengirim pesan melalui email
- /telegram untuk mengirim pesan melalui Telegram
        `;
        sendTelegramMessage(chatId, welcomeMessage);
    });

    // Handle /email command
    bot.onText(/\/email/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Silakan kirim pesan yang ingin Anda sampaikan melalui email.');
        bot.once('message', (msg) => {
            const message = msg.text;
            const ownerEmail = process.env.EMAIL_USER; // Use EMAIL_USER since it's the owner's email
            if (!ownerEmail) {
                return bot.sendMessage(chatId, 'Gagal mengirim pesan: alamat email pemilik tidak ditemukan.');
            }
            sendEmail(ownerEmail, 'Pesan dari Telegram', message);
            sendTelegramMessage(chatId, 'Pesan Anda telah dikirim melalui email.');
        });
    });
    

    // Handle /telegram command
    bot.onText(/\/telegram/, (msg) => {
        const chatId = msg.chat.id;
        bot.sendMessage(chatId, 'Silakan kirim pesan yang ingin Anda sampaikan melalui Telegram.');
        bot.once('message', (msg) => {
            const message = msg.text;
            sendTelegramMessage(process.env.OWNER_CHAT_ID, `Pesan dari pengguna: ${message}`);
            sendTelegramMessage(chatId, 'Pesan Anda telah dikirim melalui Telegram.');
        });
    });
}

module.exports = { initBot, sendTelegramMessage };
