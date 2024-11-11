const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');  // Change here
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearautorole')
        .setDescription('Clear the auto-role assignment'),
    category: 'roleManagement',
    async execute(interaction) {
        // Use the correct method to check permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) { // Change here
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        // Clear the role from the file
        fs.writeFileSync('autorole.json', JSON.stringify({ roleId: null }));

        await interaction.reply('Auto-role assignment has been cleared.');
    },
};
