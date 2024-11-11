// warningAutoModSchema.js

const mongoose = require('mongoose');

const warningAMSchema = new mongoose.Schema({
    userId: String,
    guildId: String,
    warnings: { type: Number, default: 0 },
    lastWarning: { type: Date, default: Date.now },
});

const WarningAutoMod = mongoose.model('WarningAutoMod', warningAMSchema);

module.exports = WarningAutoMod;
