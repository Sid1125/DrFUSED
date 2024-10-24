const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Ask the magic 8-ball a question.')
        .addStringOption(option => option.setName('question').setDescription('Your yes/no question').setRequired(true)),
    category: 'fun',
    async execute(interaction) {
        const answers = ['Yes', 'No', 'Maybe', 'Definitely', 'Ask again later'];
        const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
        interaction.reply(randomAnswer);
    },
};
