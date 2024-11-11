const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceplay')
        .setDescription('Forcefully plays a new song, interrupting the current one.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube URL or name of the song to play.')
                .setRequired(true)),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply(); // Defer reply at the start
        const query = interaction.options.getString('query');
        const queue = queues.get(interaction.guild.id);

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            const noChannelEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('You need to be in a voice channel to force play music!');
            return interaction.followUp({ embeds: [noChannelEmbed] });
        }

        // Check if the query is a valid URL
        const isUrl = query.startsWith('http://') || query.startsWith('https://');

        let songInfo;
        if (isUrl) {
            // If it's a URL, directly use it
            songInfo = { url: query, title: query }; // Replace with actual info retrieval if needed
        } else {
            // If it's not a URL, search for it
            const results = await ytSearch(query);
            if (results && results.videos.length > 0) {
                const videoList = results.videos.slice(0, 5);
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
                            .setCustomId(`forceplay_song_${index}`)
                            .setLabel(`${index + 1}`)
                            .setStyle(ButtonStyle.Primary)
                    ))
                );

                await interaction.followUp({ embeds: [videoListEmbed], components: [row] });

                const filter = i => i.user.id === interaction.user.id;
                try {
                    const collected = await interaction.channel.awaitMessageComponent({ filter, time: 30000 });
                    const selectedSongIndex = parseInt(collected.customId.split('_')[2]);
                    songInfo = { url: videoList[selectedSongIndex].url, title: videoList[selectedSongIndex].title };

                    await collected.update({ content: `You selected: **${songInfo.title}**`, components: [], embeds: [] });
                } catch (error) {
                    const timeoutEmbed = new EmbedBuilder()
                        .setColor(0xff0000)
                        .setDescription('Song selection timed out.');
                    return interaction.followUp({ embeds: [timeoutEmbed], components: [] });
                }
            } else {
                return interaction.followUp("No results found for your query.");
            }
        }

        // Add the song to the front of the queue
        queue.songs.unshift(songInfo);
        if (queue.player) {
            queue.player.stop(); // Stop current song immediately
        }

        await interaction.followUp(`Force playing: **${songInfo.title}**`);
    }
};
