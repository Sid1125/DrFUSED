const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the server')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to ban')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)),
    userPermissions: ['BanMembers'],
    botPermissions: ['BanMembers'],
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const member = interaction.guild.members.cache.get(user.id);
        if (!member) {
            return interaction.reply('That user is not a member of this server.');
        }

        if (!member.bannable) {
            return interaction.reply('I cannot ban that user. Do they have a higher role than me?');
        }

        try {
            await member.ban({ reason });
            interaction.reply(`Successfully banned ${user.tag} for: ${reason}`);

            // Find mod-logs channel
            const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
            if (logChannel) {
                // Create an embed for logging
                const logEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setTitle('User Banned')
                    .setDescription(`**Banned User:** ${user.tag} (${user.id})\n**Reason:** ${reason}\n**Banned By:** ${interaction.user.tag}`)
                    .setTimestamp();
                
                // Send the log embed to mod-logs channel
                logChannel.send({ embeds: [logEmbed] });
            }

        } catch (error) {
            console.error(error);
            interaction.reply('I was unable to ban that user. Please try again later.');
        }
    },
};
