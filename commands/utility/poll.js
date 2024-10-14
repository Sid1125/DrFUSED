const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Create a poll for users to vote on.')
        .addStringOption(option => option.setName('question').setDescription('Poll question').setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription('First option').setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription('Second option').setRequired(true)),
    category: 'utility',
    async execute(interaction) {
        const question = interaction.options.getString('question');
        const option1 = interaction.options.getString('option1');
        const option2 = interaction.options.getString('option2');

        const pollMessage = await interaction.reply({
            content: `**${question}**\n\n1️⃣ - ${option1}\n2️⃣ - ${option2}`,
            fetchReply: true
        });

        await pollMessage.react('1️⃣');
        await pollMessage.react('2️⃣');
    },
};
