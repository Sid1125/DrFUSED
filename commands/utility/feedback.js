const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription('Submit feedback to the bot developer.'),
    category: 'utility',
    async execute(interaction) {
        // Create the modal
        const feedbackModal = new ModalBuilder()
            .setCustomId('feedbackModal')
            .setTitle('Feedback Form');

        // Create the text input fields
        const feedbackInput = new TextInputBuilder()
            .setCustomId('feedbackInput')
            .setLabel("What's your feedback?")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder("Enter your feedback here...")
            .setRequired(true);

        const usernameInput = new TextInputBuilder()
            .setCustomId('usernameInput')
            .setLabel("Your Discord username (optional)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("Enter your username...")
            .setRequired(false);

        // Add the input fields to action rows
        const feedbackRow = new ActionRowBuilder().addComponents(feedbackInput);
        const usernameRow = new ActionRowBuilder().addComponents(usernameInput);

        // Add the rows to the modal
        feedbackModal.addComponents(feedbackRow, usernameRow);

        // Show the modal to the user
        await interaction.showModal(feedbackModal);
    },
};
