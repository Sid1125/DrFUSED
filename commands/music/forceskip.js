const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
const ytSearch = require('yt-search')
const ytdl = require('@distube/ytdl-core')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('forceskip')
        .setDescription('Forcefully skips the current song.'),
    category: 'music',
    async execute(interaction) {
        const queue = queues.get(interaction.guild.id);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply('There is no song playing.');
        }

        queue.player.stop(); // Immediately stop the player to force the next song
        return interaction.reply('Skipped the current song.');
    }
}
