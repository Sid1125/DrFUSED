const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const he = require('he'); // Importing the 'he' library for HTML decoding

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trivia')
        .setDescription('Start a trivia game.'),
    category: 'fun',
    async execute(interaction) {
        try {
            const res = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
            const question = he.decode(res.data.results[0].question);
            const correctAnswer = he.decode(res.data.results[0].correct_answer);
            const incorrectAnswers = res.data.results[0].incorrect_answers.map(he.decode);

            // Prepare the full response with answers
            const answers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
            const answersString = answers.map((answer, index) => `${index + 1}. ${answer}`).join('\n');

            await interaction.reply(`Trivia: ${question}\n\nOptions:\n${answersString}`);

            // Set up a message collector to collect responses for a limited time
            const filter = response => {
                return !isNaN(response.content) && response.author.id === interaction.user.id && response.content > 0 && response.content <= answers.length;
            };

            const collector = interaction.channel.createMessageCollector({ filter, time: 15000 }); // 15 seconds

            collector.on('collect', m => {
                const answerIndex = parseInt(m.content) - 1; // Convert to 0-based index
                const userAnswer = answers[answerIndex];

                const correctAnswerIndex = answers.indexOf(correctAnswer);

                if (userAnswer === answers[correctAnswerIndex]) {
                    interaction.followUp(`Correct! 🎉 The answer is: ${correctAnswer}`);
                } else {
                    interaction.followUp(`Wrong answer! The correct answer was: ${correctAnswer}`);
                }
                collector.stop(); // Stop collecting after an answer
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp('Time is up! No one answered.');
                }
            });

        } catch (error) {
            console.error('Error fetching trivia:', error);
            await interaction.reply('Error fetching trivia. Please try again later.');
        }
    },
};
