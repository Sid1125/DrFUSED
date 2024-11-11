const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('support')
        .setDescription('Get a link to our support server.'),
    category: 'utility',
    async execute(interaction) {
        const supportEmbed = new EmbedBuilder()
            .setTitle('Need Help?')
            .setDescription(
                'Join our support server for help, updates, and more!\n\n' +
                '[Click here to join our support server](https://discord.gg/vr8z8RBpdy)'
            )
            .setColor(0x00AE86)
            .setTimestamp();

        await interaction.reply({ embeds: [supportEmbed], ephemeral: true });
    },
};
