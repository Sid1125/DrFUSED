const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { queues } = require('./play'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('displayqueue')
        .setDescription('Displays the current queue of songs.'),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const queue = queues.get(guildId);

        if (!queue || queue.songs.length === 0) {
            return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'The queue is currently empty.' }] });
        }

        const queueEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Current Queue');

        // Loop through the songs in the queue and add them to the embed
        queue.songs.forEach((song, index) => {
            queueEmbed.addFields({
                name: `${index + 1}. ${song.title}`,
                value: `[Link](${song.url})`,
            });
        });

        return interaction.followUp({ embeds: [queueEmbed] });
    },
};
