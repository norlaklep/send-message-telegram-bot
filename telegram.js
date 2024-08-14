const { bot } = require('./bot');

const sendTelegramMessage = (chatId, message) => {
    bot.sendMessage(chatId, message);
};

module.exports = {
    sendTelegramMessage,
};
