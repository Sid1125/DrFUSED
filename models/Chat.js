const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true // Ensures each guild can only have one chatbot channel setting
    },
    channelId: {
        type: String,
        required: true
    }
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
