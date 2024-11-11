// Import necessary classes
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const profanityFilter = require('profanity-filter');
const WarningAutoMod = require('../../models/warningAutoModSchema');
const ServerSettings = require('../../models/serverSettingsSchema'); // Import ServerSettings model

const MAX_MENTIONS = 10;
const MAX_EMOJIS = 15;
const MAX_CAPS_PERCENTAGE = 89;
const MAX_WARNINGS = 5; // Number of warnings before taking action

// Self-promotion phrases and link regex
const selfPromotionPhrases = ['check out my', 'subscribe to my', 'follow me on'];
const linkRegex = /https?:\/\/[^\s]+/;

// Execute function for automod
const execute = async (message) => {
    if (message.author.bot || message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

    const content = message.content.toLowerCase();
    const CapsContent = message.content;
    
    try {
        const serverSettings = await ServerSettings.findOne({ guildId: message.guild.id });
        if (!serverSettings) return; // If no settings found for the server, exit

        // Check if the profanity filter is enabled
        const { Filter } = await import('bad-words');
        const filter = new Filter();
        filter.addWords('custombadword1', 'custombadword2');
        if (serverSettings.toggles.profanityFilter && (filter.isProfane(content) || profanityFilter.clean(content) !== content)) {
            await issueWarning(message, 'Inappropriate Language Detected', 'Your message contained inappropriate language and was removed.');
            return;
        }

        // Check if the spam filter is enabled
        if (serverSettings.toggles.spamFilter && await checkForSpam(message)) {
            await issueWarning(message, 'Spam Detected', 'Please avoid spamming.');
            return;
        }

        // Mass Mentions
        if (serverSettings.toggles.mentionFilter) {
            const mentionCount = (content.match(/<@!?\d+>/g) || []).length;
            if (mentionCount >= MAX_MENTIONS) {
                await issueWarning(message, 'Mass Mention Detected', 'Please avoid mentioning multiple users.');
                return;
            }
        }

        // Function to count emojis in a message
        function countEmojis(content) {
            const emojiRegex = /(\p{Extended_Pictographic}|\p{Emoji_Presentation})/gu;
            const emojis = content.match(emojiRegex) || [];
            return emojis.length;
        }

        // Excessive Emojis Check
        if (serverSettings.toggles.emojiFilter) {
            const emojiCount = countEmojis(content);
            if (emojiCount > MAX_EMOJIS) {
                await issueWarning(message, 'Excessive Emojis Detected', 'Please reduce the number of emojis.');
                return;
            }
        }

        // Excessive Capital Letters Check
        if (serverSettings.toggles.capsFilter) {
            if (CapsContent.length === 0) {
                console.log('Content is empty, skipping capital letter check.');
            } else {
                const capsCount = CapsContent.replace(/[^A-Z]/g, "").length;
                const capsPercentage = (capsCount / CapsContent.length) * 100;        
                if (capsPercentage > MAX_CAPS_PERCENTAGE) {
                    await issueWarning(message, 'Excessive Capitals Detected', 'Please avoid using excessive capital letters.');
                    return;
                }
            }
        }

        // Self-promotion Detection
        if (serverSettings.toggles.selfPromoFilter && selfPromotionPhrases.some(phrase => content.includes(phrase))) {
            await issueWarning(message, 'Self-promotion Detected', 'Self-promotion is not allowed.');
            return;
        }

        // Link Detection
        if (serverSettings.toggles.linkFilter && linkRegex.test(content)) {
            await issueWarning(message, 'Link Detected', 'Posting links is not allowed.');
            return;
        }

    } catch (error) {
        console.error("Error in automod execution:", error);
    }
};

// Issue warning function with MongoDB integration
const issueWarning = async (message, title, description) => {
    const userId = message.author.id;
    const guildId = message.guild.id;

    // Retrieve or create warning document for user
    let userWarning = await WarningAutoMod.findOne({ userId, guildId });
    if (!userWarning) {
        userWarning = new WarningAutoMod({ userId, guildId, warnings: 0 });
    }

    // Increment and update warnings
    userWarning.warnings += 1;
    userWarning.lastWarning = new Date();
    await userWarning.save();

    // Send a warning embed
    const warningEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle(title)
        .setDescription(`${message.author}, ${description} This is warning ${userWarning.warnings}/${MAX_WARNINGS}.`)
        .setFooter({ text: 'Automod' })
        .setTimestamp();

    await message.delete();
    await message.channel.send({ embeds: [warningEmbed] });

    // Check if the user has reached the max warnings
    if (userWarning.warnings >= MAX_WARNINGS) {
        await applyPenalty(message);
        userWarning.warnings = 0; // Reset warnings after penalty
        await userWarning.save();
    }
};

// Apply penalty to the user after reaching the warning limit
const applyPenalty = async (message) => {
    const muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');
    if (muteRole) {
        // Add the Muted role to the member
        await message.member.roles.add(muteRole);
        await message.member.timeout(4 * 60 * 60 * 1000, 'Temporary mute');
        await message.channel.send(`${message.author} has been muted for 4 hours due to multiple warnings.`);
        const modLogsChannel = message.guild.channels.cache.find(channel => channel.name === 'mod-logs');
        if (modLogsChannel) {
            const embed = new EmbedBuilder()
                .setTitle('User Muted')
                .addFields(
                    { name: 'User', value: `${message.author.tag} (${message.author.id})` },
                    { name: 'Reason', value: 'Exceeded maximum warnings' },
                    { name: 'Duration', value: '4 hours' },
                    { name: 'Moderator', value: 'Automod System' } // Change if you want to log a specific moderator
                )
                .setColor(0xff0000)
                .setTimestamp();

            await modLogsChannel.send({ embeds: [embed] });
        } else {
            console.log('Mod logs channel not found.');
        }
        // Set a timeout to remove the Muted role after 4 hours
        setTimeout(async () => {
            try {
                await message.member.roles.remove(muteRole);
                await message.channel.send(`${message.author} has been unmuted after 4 hours.`);
            } catch (error) {
                console.error(`Failed to unmute ${message.author.tag}:`, error);
            }
        }, 4 * 60 * 60 * 1000); // 4 hours in milliseconds
    } else {
        await message.member.timeout(4 * 60 * 60 * 1000, 'Temporary mute');
        await message.channel.send(`${message.author} has been warned multiple times and has been muted. Please consider adding a "Muted" role for increased functionality.`);
    }
};

// Scheduled warning reset every 10 days
setInterval(async () => {
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
    await WarningAutoMod.updateMany({ lastWarning: { $lt: tenDaysAgo } }, { $set: { warnings: 0 } });
    console.log("Warnings reset for all users with warnings older than 10 days.");
}, 10 * 24 * 60 * 60 * 1000); // Run every 10 days

// Spam Detection Helper
async function checkForSpam(message) {
    const fetchedMessages = await message.channel.messages.fetch({ limit: 10 });
    const repeatedMessages = fetchedMessages.filter(msg =>
        msg.content === message.content &&
        msg.author.id === message.author.id
    );
    return repeatedMessages.size > 3; // Adjust threshold as needed
}

// Exporting the execute function
module.exports = {
    execute,
};
