const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const { queues, playSong } = require('./play'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('add')
        .setDescription('Adds a song to the queue.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The YouTube URL or name of the song to add.')
                .setRequired(true)),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();
        const guildId = interaction.guild.id;
        const queue = queues.get(guildId);

        let url;
        const query = interaction.options.getString('query');

        if (ytdl.validateURL(query)) {
            url = query;
        } else {
            const searchResult = await ytSearch(query);
            if (!searchResult || !searchResult.videos.length) {
                return interaction.followUp({ embeds: [{ color: 0xff0000, description: 'No videos found for the given song name.' }] });
            }

            // Display search results with buttons
            const videoList = searchResult.videos.slice(0, 5); // Get the top 5 results
            const videoListEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setTitle('Song Selection')
                .setDescription('Select a song from the list below:');

            videoList.forEach((video, index) => {
                videoListEmbed.addFields({
                    name: `${index + 1}. ${video.title}`,
                    value: `Duration: ${video.timestamp} | [Link](${video.url})`,
                });
            });

            const row = new ActionRowBuilder().addComponents(
                videoList.map((video, index) => (
                    new ButtonBuilder()
                        .setCustomId(`add_song_${index}`)
                        .setLabel(`${index + 1}`)
                        .setStyle(ButtonStyle.Primary)
                ))
            );

            await interaction.followUp({ embeds: [videoListEmbed], components: [row] });

            // Wait for button interaction
            const filter = i => i.user.id === interaction.user.id;
            try {
                const collected = await interaction.channel.awaitMessageComponent({ filter, time: 30000 }); // 30 seconds
                const selectedSongIndex = parseInt(collected.customId.split('_')[2]);
                url = videoList[selectedSongIndex].url;

                await collected.update({ content: `You selected: **${videoList[selectedSongIndex].title}**`, components: [], embeds: [] });
            } catch (error) {
                // Handle timeout
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription('Song selection timed out.');
                return interaction.followUp({ embeds: [timeoutEmbed], components: [] });
            }
        }

        // Add the selected song to the queue
        queue.songs.push({ url, title: url ? query : videoList[selectedSongIndex].title });

        // If a song is currently playing, don't restart the player
        if (queue.playing) {
            return interaction.followUp({ embeds: [{ color: 0x00ff00, description: `🎶 **${query}** has been added to the queue.` }] });
        } else {
            // If no song is playing, start playing the first song immediately
            playSong(queue, interaction);
        }
    },
};
