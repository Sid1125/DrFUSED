const { SlashCommandBuilder } = require('discord.js');
const ServerSettings = require('../../models/serverSettingsSchema'); // Import the server settings model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('automodtoggle')
        .setDescription('Toggle automod filters for the server. (Default = Enabled)')
        .addStringOption(option => 
            option.setName('filter')
            .setDescription('Choose a filter to toggle')
            .setRequired(true)
            .addChoices(
                { name: 'Profanity Filter', value: 'profanityFilter' },
                { name: 'Spam Filter', value: 'spamFilter' },
                { name: 'Mention Filter', value: 'mentionFilter' },
                { name: 'Emoji Filter', value: 'emojiFilter' },
                { name: 'Caps Filter', value: 'capsFilter' },
                { name: 'Self-promo Filter', value: 'selfPromoFilter' },
                { name: 'Link Filter', value: 'linkFilter' }
            )),
    category: 'moderation',
    async execute(interaction) {
        const filter = interaction.options.getString('filter');

        // Check for admin permissions
        if (!interaction.member.permissions.has('Administrator')) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        try {
            // Find the server settings for the guild, or create if not exists
            const serverSettings = await ServerSettings.findOneAndUpdate(
                { guildId: interaction.guild.id },
                {},
                { new: true, upsert: true }
            );

            // Toggle the specified filter
            const currentStatus = serverSettings.toggles[filter];
            const newStatus = !currentStatus;
            serverSettings.toggles[filter] = newStatus;

            // Save the updated settings
            await serverSettings.save();

            return interaction.reply({ 
                content: `The ${filter.replace(/([A-Z])/g, ' $1').toLowerCase()} has been ${newStatus ? 'enabled' : 'disabled'}.`, 
                ephemeral: true 
            });
        } catch (error) {
            console.error('Error toggling automod filter:', error);
            return interaction.reply({ 
                content: 'There was an error updating the filter status. Please try again later.', 
                ephemeral: true 
            });
        }
    },
};
