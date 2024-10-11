const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Generate an invite link for the bot'),
    async execute(interaction) {
        const inviteLink = `https://discord.com/oauth2/authorize?client_id=1293244608028999690`;

        const embed = new EmbedBuilder()
            .setTitle('Invite Me to Your Server!')
            .setDescription(`[Click here to invite the bot](${inviteLink})`)
            .setColor(0x00AE86)
            .setFooter({ text: 'Thank you for supporting the bot!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
