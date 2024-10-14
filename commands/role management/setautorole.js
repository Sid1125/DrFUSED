const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setautorole')
        .setDescription('Set the role that will be automatically assigned to new members')
        .addRoleOption(option => option.setName('role').setDescription('Select the role to auto-assign').setRequired(true)),
    category: 'roleManagement',
    async execute(interaction) {
        // Check if the user has permission to manage roles
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const role = interaction.options.getRole('role');
        const guildId = interaction.guild.id;

        // Load existing autorole data or initialize an empty object
        let autoroleData = {};
        try {
            const data = fs.readFileSync('autorole.json', 'utf8');
            autoroleData = JSON.parse(data);
        } catch (err) {
            console.error('Error reading autorole.json:', err);
        }

        // Set the role ID for the current guild
        autoroleData[guildId] = { roleId: role.id };

        // Save the updated autorole data back to the file
        fs.writeFileSync('autorole.json', JSON.stringify(autoroleData, null, 2));

        await interaction.reply(`Auto-role has been set to ${role.name} for this server.`);
    },
};
