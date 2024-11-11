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

        // Limit the number of songs to 25 to avoid exceeding the limit
        const songsToDisplay = queue.songs.slice(0, 25);

        // Loop through the songs in the queue and add them to the embed
        songsToDisplay.forEach((song, index) => {
            queueEmbed.addFields({
                name: `${index + 1}. ${song.title}`,
                value: `[Link](${song.url})`,
            });
        });

        // Only add the "And X more songs" field if there is space
        if (queue.songs.length > 25) {
            queueEmbed.setFooter({
                text: `And ${queue.songs.length - 25} more songs in the queue!`
            });
        }

        return interaction.followUp({ embeds: [queueEmbed] });
    },
};
