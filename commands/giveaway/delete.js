// commands/giveaway/delete.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/Giveaway'); // Import the Giveaway model
const ArchivedGiveaway = require('../../models/ArchivedGiveaway');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawaydelete')
        .setDescription('Delete a giveaway')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The ID of the giveaway message')
                .setRequired(true)),
    category: 'giveaway',

    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');

        try {
            const giveaway = await Giveaway.findOne({ messageId: messageId });
            if (!giveaway) {
                return interaction.reply({
                    content: 'No giveaway found with that message ID.',
                    ephemeral: true
                });
            }

            await Giveaway.deleteOne({ messageId: messageId });
            await ArchivedGiveaway.deleteOne({ messageId: messageId });
            await interaction.reply({
                content: 'The giveaway has been successfully deleted.',
                ephemeral: true
            });

        } catch (error) {
            console.error('Error deleting giveaway:', error);
            await interaction.reply({
                content: 'An error occurred while deleting the giveaway. Please try again.',
                ephemeral: true
            });
        }
    },
};
