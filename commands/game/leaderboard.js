const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View the top players by XP, coins, level, and more.'),
    category: 'game',
    async execute(interaction) {
        // Fetch and sort the top 10 users by experience
        const users = await User.find().sort({ experience: -1 }).limit(10);

        // Create the leaderboard embed
        const leaderboardEmbed = new EmbedBuilder()
            .setTitle("🏆 Top Players")
            .setColor(0x00AE86)
            .setDescription("Here are the top players by experience and other metrics:")
            .setTimestamp(); // Optionally add a timestamp

        // Add fields for each player
        users.forEach((player, index) => {
            leaderboardEmbed.addFields({
                name: `${index + 1}. <@${player.userId}>`, // Mention user by ID
                value: `**XP:** ${player.experience}\n**Coins:** ${player.coins}\n**Level:** ${player.level}`,
                inline: true // Display fields inline for a compact look
            });
        });

        // If there are fewer than 10 players, you can also add a message indicating that
        if (users.length < 10) {
            leaderboardEmbed.setFooter({ text: "Less than 10 players available." });
        }

        // Send the leaderboard embed as a reply
        interaction.reply({ embeds: [leaderboardEmbed] });
    }
};
