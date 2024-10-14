const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createrole')
        .setDescription('Create a new role in the server')
        .addStringOption(option => option.setName('name').setDescription('Name of the new role').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Color of the role in HEX format (optional)')),
    category: 'roleManagement',    
    async execute(interaction) {
        const roleName = interaction.options.getString('name');
        const roleColor = interaction.options.getString('color') || '#FFFFFF'; // Default color is white

        const role = await interaction.guild.roles.create({
            name: roleName,
            color: roleColor,
        });

        await interaction.reply(`Role ${role.name} has been created with color ${role.color}.`);
    },
};
