const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const WarningAutoMod = require('../../models/warningAutoModSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewautomodwarnings')
        .setDescription('View the automod warnings for a specific user. (ADMIN ONLY COMMAND)')
        .addUserOption(option => option.setName('user').setDescription('The user to view warnings for').setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const guildId = interaction.guild.id;
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }
        // Fetch warning data from the database
        const userWarnings = await WarningAutoMod.findOne({ userId: user.id, guildId });

        if (!userWarnings) {
            return interaction.reply({ content: `${user.tag} has no warnings recorded.`, ephemeral: true });
        }

        // Create the response message
        const warningsCount = userWarnings.warnings;
        await interaction.reply({ 
            content: `${user.tag} has ${warningsCount} warning(s) recorded.`, 
            ephemeral: true 
        });
    },
};
