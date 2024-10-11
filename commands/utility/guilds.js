const { SlashCommandBuilder } = require("@discordjs/builders");
const { EmbedBuilder } = require("discord.js");

const OWNER_ID = '699257426712592385'; // Your bot owner's user ID

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guilds')
        .setDescription('Lists all the guilds the bot is in.'),
    
    async execute(interaction) {
        // Check if the user is the bot owner
        if (interaction.user.id !== OWNER_ID) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        // Create an embed for the output
        const embed = new EmbedBuilder()
            .setTitle('Guilds List')
            .setColor('#0099ff'); // Set your preferred color here

        // Fetch guild names and IDs
        const guilds = interaction.client.guilds.cache.map(guild => `${guild.name} | Users - ${guild.memberCount} | (ID: ${guild.id})`);

        // Check if the bot is in any guilds
        if (guilds.length === 0) {
            embed.setDescription('The bot is not in any guilds.');
        } else {
            // Add the guilds to the embed description
            embed.setDescription(guilds.join('\n'));
        }

        // Reply with the embed
        await interaction.reply({ embeds: [embed] });
    },
};
