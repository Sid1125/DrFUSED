const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unmute')
        .setDescription('Unmute a previously muted user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to unmute')
                .setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        // Check if the user has the required permissions
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member.communicationDisabledUntilTimestamp) {
            return interaction.reply({ content: 'This user is not muted.', ephemeral: true });
        }

        await member.timeout(null);
        await interaction.reply(`${user.username} has been unmuted.`);

        // Look for mod-logs channel
        const modLogsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
        if (modLogsChannel) {
            const embed = new EmbedBuilder()
                .setTitle('User Unmuted')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})` },
                    { name: 'Moderator', value: `${interaction.user.tag}` }
                )
                .setColor(0x00ff00)
                .setTimestamp();

            modLogsChannel.send({ embeds: [embed] });
        } else {
            interaction.channel.send('Mod logs channel not found.');
        }
    },
};
