const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Assign a role to a user')
        .addUserOption(option => option.setName('target').setDescription('Select a user').setRequired(true))
        .addRoleOption(option => option.setName('role').setDescription('Select a role').setRequired(true)),
    category: 'roleManagement',
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const role = interaction.options.getRole('role');
        const member = interaction.guild.members.cache.get(target.id);

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({ content: `${target.username} already has the ${role.name} role.`, ephemeral: true });
        }

        await member.roles.add(role);
        await interaction.reply(`${role.name} role has been assigned to ${target.username}.`);
    },
};
