require('dotenv').config();
const express = require('express');
const { initBot } = require('./bot'); // Import bot initialization
const { sendEmail } = require('./email'); // Import email functionality

const app = express();
app.use(express.json());

// Initialize the bot
initBot();

// Endpoint to send a message to the owner
app.post('/send', (req, res) => {
    const { type, message, subject } = req.body;

    if (type === 'telegram') {
        sendTelegramMessage(process.env.OWNER_CHAT_ID, message);
    } else if (type === 'email') {
        sendEmail(process.env.EMAIL_USER, subject || 'Message from bot', message);
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
