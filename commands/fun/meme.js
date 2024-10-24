const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Fetch a random meme from Reddit.'),
    category: 'fun',
    async execute(interaction) {
        try {
            const res = await axios.get('https://meme-api.com/gimme'); // Replace with actual meme API
            interaction.reply({ content: res.data.url });
        } catch (error) {
            interaction.reply('Error fetching meme.');
        }
    },
};
