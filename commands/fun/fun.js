const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');
const he = require('he'); // Importing the 'he' library for HTML decoding

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fun')
        .setDescription('Fun commands to play with!')
        .addSubcommand(subcommands =>
            subcommands
                .setName('8ball')
                .setDescription('Ask the magic 8-ball a question.')
                .addStringOption(option => option.setName('question').setDescription('Your yes/no question').setRequired(true)))
        .addSubcommand(subcommands =>
            subcommands
                .setName('av')
                .setDescription('Displays the avatar of the specified user.')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user whose avatar to display')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('coinflip')
                .setDescription('Flip a coin and get heads or tails.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('fact')
                .setDescription('Provides a random interesting fact using an API.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('joke')
                .setDescription('Fetch a random joke.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('meme')
                .setDescription('Fetch a random meme from Reddit.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('roll')
                .setDescription('Rolls a six-sided die.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('trivia')
                .setDescription('Start a trivia game.')),
    category: 'fun',
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case '8ball':
                const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Ask again later'];
                const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
                await interaction.reply(randomAnswer);
                break;

            case 'av':
                await interaction.deferReply();
                const user = interaction.options.getUser('user') || interaction.user;
                const avatarEmbed = new EmbedBuilder()
                    .setTitle(`${user.username}'s avatar`)
                    .setColor(0x333333)
                    .setImage(user.displayAvatarURL({ dynamic: true, size: 2048 }));
                await interaction.followUp({ embeds: [avatarEmbed] });
                break;

            case 'coinflip':
                const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
                await interaction.reply(`The coin landed on: ${result}`);
                break;

            case 'fact':
                await interaction.deferReply();
                try {
                    const factResponse = await axios.get('https://uselessfacts.jsph.pl/random.json');
                    const fact = factResponse.data.text;
                    const factEmbed = new EmbedBuilder()
                        .setTitle('🔍 Random Fact')
                        .setColor(0x333333)
                        .setDescription(fact);
                    await interaction.followUp({ embeds: [factEmbed] });
                } catch (error) {
                    console.error(error);
                    await interaction.followUp({ content: 'Sorry, I couldn\'t fetch a fact at the moment.' });
                }
                break;

            case 'joke':
                try {
                    const jokeResponse = await axios.get('https://official-joke-api.appspot.com/random_joke');
                    await interaction.reply(`${jokeResponse.data.setup} - ${jokeResponse.data.punchline}`);
                } catch (error) {
                    await interaction.reply('Error fetching joke.');
                }
                break;

            case 'meme':
                try {
                    const memeResponse = await axios.get('https://meme-api.com/gimme'); // Replace with actual meme API
                    await interaction.reply({ content: memeResponse.data.url });
                } catch (error) {
                    await interaction.reply('Error fetching meme.');
                }
                break;

            case 'roll':
                await interaction.deferReply();
                const roll = Math.floor(Math.random() * 6) + 1;
                const rollEmbed = new EmbedBuilder()
                    .setTitle('🎲 You rolled!')
                    .setColor(0x333333)
                    .setDescription(`You rolled a **${roll}**.`);
                await interaction.followUp({ embeds: [rollEmbed] });
                break;

            case 'trivia':
                try {
                    const triviaResponse = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
                    const question = he.decode(triviaResponse.data.results[0].question);
                    const correctAnswer = he.decode(triviaResponse.data.results[0].correct_answer);
                    const incorrectAnswers = triviaResponse.data.results[0].incorrect_answers.map(he.decode);
                    const answers = [correctAnswer, ...incorrectAnswers].sort(() => Math.random() - 0.5);
                    const answersString = answers.map((answer, index) => `${index + 1}. ${answer}`).join('\n');
                    await interaction.reply(`Trivia: ${question}\n\nOptions:\n${answersString}`);

                    const filter = response => {
                        return !isNaN(response.content) && response.author.id === interaction.user.id && response.content > 0 && response.content <= answers.length;
                    };

                    const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

                    collector.on('collect', m => {
                        const answerIndex = parseInt(m.content) - 1;
                        const userAnswer = answers[answerIndex];
                        const correctAnswerIndex = answers.indexOf(correctAnswer);

                        if (userAnswer === answers[correctAnswerIndex]) {
                            interaction.followUp(`Correct! 🎉 The answer is: ${correctAnswer}`);
                        } else {
                            interaction.followUp(`Wrong answer! The correct answer was: ${correctAnswer}`);
                        }
                        collector.stop();
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
                break;
        }
    },
};
