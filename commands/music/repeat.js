const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
module.exports = {
    data: new SlashCommandBuilder()
        .setName('repeat')
        .setDescription('Repeats the entire queue.'),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();
        const guildId = interaction.guild.id;
        const queue = queues.get(guildId);

        if (!queue || queue.songs.length === 0) {
            return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'The queue is empty!' }] });
        }

        queue.repeating = !queue.repeating; // Toggle repeating
        return interaction.followUp({ embeds: [{ color: 0x00ff00, description: `Repeating is now ${queue.repeating ? 'enabled' : 'disabled'}.` }] });
    },
};
