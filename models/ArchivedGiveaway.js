// models/Giveaway.js
const mongoose = require('mongoose');

const archivedgiveawaySchema = new mongoose.Schema({
    messageId: { type: String, required: true },
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    prize: { type: String, required: true },
    duration: { type: Number, required: true },
    participants: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ArchivedGiveaway', archivedgiveawaySchema);
