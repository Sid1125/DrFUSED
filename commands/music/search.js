const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require("@discordjs/builders");
const { queues } = require('./play');
const ytSearch = require('yt-search')
const ytdl = require('@distube/ytdl-core')
module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Search for a song without playing it.')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name or search query.')
                .setRequired(true)),
    category: 'music',
    async execute(interaction) {
        await interaction.deferReply();  // Acknowledge the interaction early
    
        const query = interaction.options.getString('query');
        const searchResult = await ytSearch(query);
    
        if (!searchResult || !searchResult.videos.length) {
            return interaction.followUp('No results found for the search query.');
        }
    
        const videoList = searchResult.videos.slice(0, 5);
        const videoListEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Search Results')
            .setDescription('Here are the top results:');
    
        videoList.forEach((video, index) => {
            videoListEmbed.addFields({
                name: `${index + 1}. ${video.title}`,
                value: `Duration: ${video.timestamp} | [Link](${video.url})`
            });
        });
    
        return interaction.followUp({ embeds: [videoListEmbed] });
    }
}     
