require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Email setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Function to send a message via Telegram
function sendTelegramMessage(chatId, message) {
    bot.sendMessage(chatId, message);
}

// Function to send a message via Email
function sendEmail(to, subject, text) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        text: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

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
        const ownerEmail = process.env.OWNER_EMAIL; // Make sure this is set in your .env file
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

// Endpoint to send a message to the owner
app.post('/send', (req, res) => {
    const { type, message, subject, email } = req.body;

    if (type === 'telegram') {
        sendTelegramMessage(process.env.OWNER_CHAT_ID, message);
    } else if (type === 'email') {
        if (!email) {
            return res.status(400).json({ error: 'Email address is required for sending emails' });
        }
        sendEmail(email, subject || 'Message from bot', message);
    } else {
        return res.status(400).json({ error: 'Invalid message type' });
    }

    res.status(200).json({ success: true });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
