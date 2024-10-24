const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

// Path to the JSON file for storing warning counts
const warningsFilePath = path.join(__dirname, 'warnings.json');

// Ensure the JSON file exists
if (!fs.existsSync(warningsFilePath)) {
    fs.writeFileSync(warningsFilePath, JSON.stringify({}));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warns')
        .setDescription('Check a user\'s warnings.')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('The user to check')
                .setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const guildId = interaction.guild.id;
        const userId = target.id;

        // Load the current warnings from the JSON file
        const warningsData = JSON.parse(fs.readFileSync(warningsFilePath));

        // Check if the guild and user have any warnings
        const userWarnings = warningsData[guildId]?.[userId] || 0;

        if (userWarnings === 0) {
            return interaction.reply(`${target.username} has no warnings.`);
        }

        // Create an embed to show the user's warning count
        const embed = new EmbedBuilder()
            .setColor(0xffa500)
            .setTitle('User Warnings')
            .addFields(
                { name: 'User', value: `${target.tag} (${target.id})`, inline: true },
                { name: 'Warning Count', value: `${userWarnings}`, inline: true }
            )
            .setTimestamp();

        // Send the embed message with the warning count
        await interaction.reply({ embeds: [embed] });
    },
};
