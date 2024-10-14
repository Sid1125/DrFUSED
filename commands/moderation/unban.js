const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('Unban a user from the server')
        .addStringOption(option =>
            option.setName('user_id')
                .setDescription('The ID of the user to unban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the unban')
                .setRequired(false)),
    userPermissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    category: 'moderation',
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.options.getString('user_id');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        try {
            const bans = await interaction.guild.bans.fetch();
            const user = bans.get(userId);
            if (!user) {
                return interaction.editReply('That user is not banned from this server.');
            }

            await interaction.guild.members.unban(user.user.id, reason);
            interaction.editReply(`Successfully unbanned <@${user.user.id}> for: ${reason}`);

            // Find mod-logs channel
            const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                // Create an embed for logging
                const logEmbed = new EmbedBuilder()
                    .setColor(0x00ff00)
                    .setTitle('User Unbanned')
                    .setDescription(`**Unbanned User:** ${user.user.tag} (${user.user.id})\n**Reason:** ${reason}\n**Unbanned By:** ${interaction.user.tag}`)
                    .setTimestamp();
                
                // Send the log embed to mod-logs channel
                logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error(error);
            interaction.editReply('I was unable to unban that user. Please try again later.');
        }
    },
};
