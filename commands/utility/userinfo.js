const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Display detailed info about a user')
        .addUserOption(option =>
            option.setName('target')
                .setDescription('Select a user')
                .setRequired(true)),
    category: 'utility',
    async execute(interaction) {
        const user = interaction.options.getUser('target');
        const member = interaction.guild.members.cache.get(user.id);

        const embed = new EmbedBuilder()
            .setColor(0x3498db)
            .setTitle(`${user.username}'s Info`)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Username', value: user.tag, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
                { name: 'Roles', value: member.roles.cache.map(role => role.name).join(', '), inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
