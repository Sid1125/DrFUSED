const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { queues, playSong } = require('./play'); // Ensure this path is correct
module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the currently playing song.'),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();

        const guildId = interaction.guild.id;
        const queue = queues.get(guildId);

        // Check if the queue exists and has songs
        if (!queue || !queue.songs.length) {
            return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'There is no song currently playing or in the queue!' }] });
        }

        // Get the currently playing song
        const currentSong = queue.songs[0]; // Get the currently playing song

        // Inform the user about the skipped song
        const skipEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setDescription(`🎶 Skipped **${currentSong.title}**.`);

        // Play the next song
        
        playSong(queue, interaction); // This will shift the song after it has played
        
        
    },
};
