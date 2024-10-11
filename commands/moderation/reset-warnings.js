const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const warningsFilePath = './commands/moderation/warnings.json'; // Path to the JSON file

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reset-warnings')
        .setDescription('Reset warnings for a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose warnings to reset')
                .setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;

        // Initialize warningsData object
        let warningsData = {};

        // Load existing warnings from the file
        if (fs.existsSync(warningsFilePath)) {
            try {
                const fileData = fs.readFileSync(warningsFilePath, 'utf8');
                warningsData = JSON.parse(fileData); // Now, warningsData is properly initialized
                console.log('Loaded warnings data:', warningsData);
            } catch (error) {
                console.error('Error parsing warnings JSON:', error);
                return interaction.reply({ content: 'Error loading warnings data.', ephemeral: true });
            }
        } else {
            console.log('Warnings file does not exist.');
        }

        // Check if the guild exists in the warnings data
        if (!warningsData[guildId]) {
            return interaction.reply({ content: 'No warnings found for this server.', ephemeral: true });
        }

        // Reset the user's warnings
        const userId = user.id;
        if (warningsData[guildId][userId]) {
            delete warningsData[guildId][userId];
            fs.writeFileSync(warningsFilePath, JSON.stringify(warningsData, null, 2));

            // Send DM to the user
            try {
                await user.send(`Your warnings in the server **${interaction.guild.name}** have been reset.`);
                console.log(`Sent DM to ${user.tag}`);
            } catch (error) {
                console.error(`Could not send DM to ${user.tag}:`, error);
            }

            return interaction.reply(`Successfully reset warnings for ${user.tag}.`);
        } else {
            return interaction.reply({ content: `${user.tag} has no warnings.`, ephemeral: true });
        }
    },
};
