// commands/giveaway/edit.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/Giveaway'); // Import the Giveaway model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawayedit')
        .setDescription('Edit an active giveaway')
        .addStringOption(option =>
            option.setName('messageid')
                .setDescription('The ID of the giveaway message')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('prize')
                .setDescription('New prize for the giveaway'))
        .addIntegerOption(option =>
            option.setName('duration')
                .setDescription('New duration of the giveaway in seconds')
                .setMinValue(1)),
    category: 'giveaway',

    async execute(interaction) {
        const messageId = interaction.options.getString('messageid');
        const newPrize = interaction.options.getString('prize');
        const newDuration = interaction.options.getInteger('duration');

        try {
            const giveaway = await Giveaway.findOne({ messageId: messageId });
            if (!giveaway) {
                return interaction.reply({
                    content: 'No giveaway found with that message ID.',
                    ephemeral: true
                });
            }

            if (newPrize) giveaway.prize = newPrize;
            if (newDuration) giveaway.duration = newDuration;

            await giveaway.save();

            await interaction.reply({
                content: `The giveaway has been updated! New prize: **${giveaway.prize}**, New duration: **${giveaway.duration} seconds**.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error editing giveaway:', error);
            await interaction.reply({
                content: 'An error occurred while editing the giveaway. Please try again.',
                ephemeral: true
            });
        }
    },
};
