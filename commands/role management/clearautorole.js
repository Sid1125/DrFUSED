const { SlashCommandBuilder } = require('@discordjs/builders');
const { Permissions } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearautorole')
        .setDescription('Clear the auto-role assignment'),
    category: 'roleManagement',
    async execute(interaction) {
        if (!interaction.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        // Clear the role from the file
        fs.writeFileSync('autorole.json', JSON.stringify({ roleId: null }));

        await interaction.reply('Auto-role assignment has been cleared.');
    },
};
