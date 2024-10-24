const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('deleterole')
        .setDescription('Delete a role from the server')
        .addRoleOption(option => option.setName('role').setDescription('Select a role to delete').setRequired(true)),
    category: 'roleManagement',
    async execute(interaction) {
        const role = interaction.options.getRole('role');

        await role.delete();
        await interaction.reply(`Role ${role.name} has been deleted.`);
    },
};
