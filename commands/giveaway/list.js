// commands/giveaway/list.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js'); // Ensure you import EmbedBuilder
const Giveaway = require('../../models/Giveaway'); // Import the Giveaway model

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveawaylist')
        .setDescription('List all active giveaways in this server'),
    category: 'giveaway',

    async execute(interaction) {
        try {
            // Fetch giveaways for the current guild (server)
            const giveaways = await Giveaway.find({ guildId: interaction.guild.id });

            if (giveaways.length === 0) {
                return interaction.reply({
                    content: 'There are currently no active giveaways in this server.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('Active Giveaways in This Server')
                .setColor(0x00AE86);

            giveaways.forEach(giveaway => {
                const timeRemaining = Math.floor((giveaway.createdAt.getTime() + giveaway.duration * 1000 - Date.now()) / 1000);
                embed.addFields({
                    name: `🎁 Prize: ${giveaway.prize}`,
                    value: `Duration: ${timeRemaining} seconds remaining\nMessage ID: ${giveaway.messageId}`,
                    inline: false
                });
            });

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error listing giveaways:', error);
            await interaction.reply({
                content: 'An error occurred while listing the giveaways. Please try again.',
                ephemeral: true
            });
        }
    },
};
