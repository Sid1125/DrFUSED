const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const ytSearch = require('yt-search');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { exec } = require('child_process');

const queues = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music in a voice channel when a YouTube URL or song name is provided.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('The YouTube URL or name of the song to play.')
                .setRequired(true)),
    category: 'music',
    queues,
    playSong,
    async execute(interaction) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        let query = interaction.options.getString('query');
        const guildId = interaction.guild.id;

        if (!voiceChannel) {
            const noChannelEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('You need to be in a voice channel to play music!');
            return interaction.followUp({ embeds: [noChannelEmbed] });
        }

        if (!queues.has(guildId)) {
            queues.set(guildId, {
                songs: [],
                player: null,
                connection: null,
                playing: false,
                looping: false, // Loop current song
                repeating: false // Repeat the entire queue
            });
        }

        const queue = queues.get(guildId);
        let url;
        let searchResult;

        if (ytdl.validateURL(query)) {
            url = query;
        } else {
            searchResult = await ytSearch(query);
            if (!searchResult || !searchResult.videos.length) {
                const noResultsEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription('No videos found for the given song name.');
                return interaction.followUp({ embeds: [noResultsEmbed] });
            }

            const videoList = searchResult.videos.slice(0, 5);
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
                        .setCustomId(`song_${index}`)
                        .setLabel(`${index + 1}`)
                        .setStyle(ButtonStyle.Primary)
                ))
            );

            await interaction.followUp({ embeds: [videoListEmbed], components: [row] });

            const filter = i => i.user.id === interaction.user.id;
            try {
                const collected = await interaction.channel.awaitMessageComponent({ filter, time: 30000 });
                const selectedSongIndex = parseInt(collected.customId.split('_')[1]);
                url = videoList[selectedSongIndex].url;

                await collected.update({ content: `You selected: **${videoList[selectedSongIndex].title}**`, components: [], embeds: [] });
            } catch (error) {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription('Song selection timed out.');
                return interaction.followUp({ embeds: [timeoutEmbed], components: [] });
            }
        }

        const song = { url, title: query };

        if (queue.playing) {
            queue.songs.push(song);
            const addedToQueueEmbed = new EmbedBuilder()
                .setColor(0x00ff00)
                .setDescription(`🎶 **${query}** has been added to the queue.`);
            return interaction.followUp({ embeds: [addedToQueueEmbed] });
        }

        queue.songs.push(song);
        queue.playing = true;

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        queue.connection = connection;

        exec('ffmpeg -version', (err, stdout, stderr) => {
            if (err) {
                const ffmpegEmbed = new EmbedBuilder()
                    .setColor(0xff0000)
                    .setDescription('FFmpeg is required for audio processing. Please install FFmpeg.');
                console.error('FFmpeg is not installed or not found in the system path.', err);
                return interaction.followUp({ embeds: [ffmpegEmbed] });
            }
        });

        playSong(queue, interaction);
    },
};

async function playSong(queue, interaction) {
    if (queue.songs.length === 0) {
        queue.playing = false;
        queue.connection.destroy();
        queues.delete(interaction.guild.id);
        return;
    }

    const currentSong = queue.songs.shift();

    try {
        const stream = ytdl(currentSong.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
        const resource = createAudioResource(stream, { inlineVolume: true }); // Enable inline volume

        // Set the volume level if it's defined
        if (queue.volume !== undefined) {
            resource.volume.setVolume(queue.volume / 100); // Adjust volume to a scale of 0 to 1
            console.log(`Setting volume to: ${queue.volume / 100}`); // Debug log
        }

        const player = createAudioPlayer();
        queue.player = player;

        player.play(resource);
        queue.connection.subscribe(player);

        const nowPlayingEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Now Playing')
            .setDescription(`🎶 **Playing:** [${currentSong.title}](${currentSong.url})`);
        await interaction.followUp({ embeds: [nowPlayingEmbed] });

        player.on('error', (error) => {
            const errorEmbed = new EmbedBuilder()
                .setColor(0xff0000)
                .setDescription('There was an error playing the track, retrying...');
            console.error('Error with the audio player:', error.message);
            interaction.followUp({ embeds: [errorEmbed] });

            const retryStream = ytdl(currentSong.url, { filter: 'audioonly' });
            const retryResource = createAudioResource(retryStream, { inlineVolume: true });
            if (queue.volume !== undefined) {
                retryResource.volume.setVolume(queue.volume / 100); // Set volume for retry as well
                console.log(`Setting retry volume to: ${queue.volume / 100}`); // Debug log
            }
            player.play(retryResource);
        });

        player.on(AudioPlayerStatus.Idle, () => {
            // If looping is enabled, keep the current song in the queue
            if (queue.looping) {
                queue.songs.unshift(currentSong); // Add the current song back to the start of the queue
            }
            // If repeating is enabled, add the entire queue back to the end
            if (queue.repeating && queue.songs.length > 0) {
                queue.songs.push(...queue.songs);
            }
            // Play the next song in the queue
            playSong(queue, interaction);
        });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription('Failed to play the video. This video may be restricted or have another issue.');
        console.error('Streaming error:', error);
        interaction.followUp({ embeds: [errorEmbed] });

        playSong(queue, interaction);
    }
}

// Command to toggle looping
