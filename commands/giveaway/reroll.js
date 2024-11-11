// commands/giveaway/reroll.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const Giveaway = require('../../models/ArchivedGiveaway'); // Import the Giveaway model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawayreroll')
        .setDescription('Reroll the winner of a giveaway. You have 2 days to reroll the giveaway.')
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

            const channel = await interaction.client.channels.fetch(giveaway.channelId);
            const message = await channel.messages.fetch(giveaway.messageId).catch(err => {
                console.error('Failed to fetch the message:', err);
                return null; // Return null if fetching fails
            });

            if (!message) {
                return interaction.reply({
                    content: 'Could not find the giveaway message. It may have been deleted.',
                    ephemeral: true
                });
            }

            const reactions = message.reactions.cache.get('🎉');
            const participants = reactions ? reactions.users.cache.filter(user => !user.bot).map(user => user.id) : [];

            if (participants.length === 0) {
                return interaction.reply({
                    content: `No participants for the giveaway of **${giveaway.prize}**.`,
                    ephemeral: true
                });
            }

            const newWinnerId = participants[Math.floor(Math.random() * participants.length)];
            const newWinner = await interaction.guild.members.fetch(newWinnerId);
            await channel.send(`🎉 Congratulations ${newWinner}, you have been chosen as the new winner of **${giveaway.prize}**! 🎉`);

            await interaction.reply({
                content: 'The giveaway winner has been rerolled.',
                ephemeral: true
            });

        } catch (error) {
            console.error('Error rerolling giveaway:', error);
            await interaction.reply({
                content: 'An error occurred while rerolling the giveaway. Please try again.',
                ephemeral: true
            });
        }
    },
};
