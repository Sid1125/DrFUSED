const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kick a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to kick')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)),
    userPermissions: ['KickMembers'],
    botPermissions: ['KickMembers'],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply('User not found in this server.');
        }

        if (!member.kickable) {
            return interaction.reply('I cannot kick this user. They may have a higher role than me or I lack the permissions.');
        }

        try {
            await member.kick(reason);
            interaction.reply(`${user.username} has been kicked for: ${reason}`);

            // Find mod-logs channel
            const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                // Create an embed for logging
                const logEmbed = new EmbedBuilder()
                    .setColor(0xffcc00)
                    .setTitle('User Kicked')
                    .setDescription(`**Kicked User:** ${user.tag} (${user.id})\n**Reason:** ${reason}\n**Kicked By:** ${interaction.user.tag}`)
                    .setTimestamp();
                
                // Send the log embed to mod-logs channel
                logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error(error);
            interaction.reply('An error occurred while attempting to kick the user. Please try again later.');
        }
    },
};
