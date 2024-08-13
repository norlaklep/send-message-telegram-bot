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
