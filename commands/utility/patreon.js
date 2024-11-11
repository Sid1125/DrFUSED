// Import required Discord.js components
const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('patreon')
        .setDescription('Get a link to support me on Patreon!'),
    category: 'utility',
    async execute(interaction) {
        // Get bot's avatar URL
        const botAvatarURL = interaction.client.user.displayAvatarURL();

        // Create an embed message with a description of your Patreon
        const patreonEmbed = new EmbedBuilder()
            .setColor(0xFFD700) // Gold color for Patreon
            .setTitle("Support Us on Patreon!")
            .setDescription("Your support helps us improve and add new features. Thank you for making this possible!")
            .setThumbnail(botAvatarURL) // Bot's avatar as the thumbnail image
            .addFields(
                { name: "Patreon Link", value: "[Become a Patron!](https://patreon.com/sid1125)" },
                { name: "How Contributions Help", value: "Your support enables us to cover hosting costs, develop new features, and maintain the bot for everyone to enjoy." }
            )
            .setFooter({ text: "Thank you for being awesome!", iconURL: botAvatarURL }); // Bot's avatar as the footer icon

        // Send the embed to the user
        await interaction.reply({ embeds: [patreonEmbed] });
    },
};
