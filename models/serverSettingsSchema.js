const mongoose = require('mongoose');

const serverSettingsSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    toggles: {
        profanityFilter: {
            type: Boolean,
            default: true
        },
        spamFilter: {
            type: Boolean,
            default: true
        },
        mentionFilter: {
            type: Boolean,
            default: true
        },
        emojiFilter: {
            type: Boolean,
            default: true
        },
        capsFilter: {
            type: Boolean,
            default: true
        },
        selfPromoFilter: {
            type: Boolean,
            default: true
        },
        linkFilter: {
            type: Boolean,
            default: true
        }
    }
});

module.exports = mongoose.model('ServerSettings', serverSettingsSchema);
