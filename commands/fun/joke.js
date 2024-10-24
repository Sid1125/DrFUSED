const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('joke')
        .setDescription('Fetch a random joke.'),
    category: 'fun',
    async execute(interaction) {
        try {
            const res = await axios.get('https://official-joke-api.appspot.com/random_joke'); // Example joke API
            interaction.reply(`${res.data.setup} - ${res.data.punchline}`);
        } catch (error) {
            interaction.reply('Error fetching joke.');
        }
    },
};
