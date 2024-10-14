const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

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
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);

        if (!member.communicationDisabledUntilTimestamp) {
            return interaction.reply('This user is not muted.');
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
