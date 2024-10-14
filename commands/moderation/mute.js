const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');
const { PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mute')
        .setDescription('Temporarily mute a user for a specified amount of time')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to mute')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Time in minutes to mute the user')
                .setRequired(true)),
    category: 'moderation',
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const time = interaction.options.getInteger('time') * 60000;
        const member = interaction.guild.members.cache.get(user.id);

        if (!member.moderatable) {
            return interaction.reply('I cannot mute this user.');
        }

        await member.timeout(time, 'Temporary mute');
        await interaction.reply(`${user.username} has been muted for ${time / 60000} minutes.`);

        // Look for mod-logs channel
        const modLogsChannel = interaction.guild.channels.cache.find(channel => channel.name === 'mod-logs');
        if (modLogsChannel) {
            const embed = new EmbedBuilder()
                .setTitle('User Muted')
                .addFields(
                    { name: 'User', value: `${user.tag} (${user.id})` },
                    { name: 'Moderator', value: `${interaction.user.tag}` },
                    { name: 'Time', value: `${time / 60000} minutes` }
                )
                .setColor(0xffa500)
                .setTimestamp();

            modLogsChannel.send({ embeds: [embed] });
        } else {
            interaction.channel.send('Mod logs channel not found.');
        }
    },
};
