const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listroles')
        .setDescription('List all roles in the server'),
    category: 'roleManagement',
    async execute(interaction) {
        const roles = interaction.guild.roles.cache.map(role => role.name).join(', ');
        await interaction.reply(`Roles in this server: ${roles}`);
    },
};
