const { SlashCommandBuilder } = require('@discordjs/builders');
const { setTimeout } = require('timers/promises');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remindme')
        .setDescription('Set a reminder and the bot will DM you after the time is up.')
        .addStringOption(option => 
            option.setName('message')
                .setDescription('The reminder message')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('time')
                .setDescription('Time in minutes for the reminder')
                .setRequired(true)),
    async execute(interaction) {
        const message = interaction.options.getString('message');
        const time = interaction.options.getInteger('time') * 60000; // Convert minutes to milliseconds

        await interaction.reply(`Reminder set! I'll DM you in ${time / 60000} minutes.`);

        // Wait for the time specified
        await setTimeout(time);

        // Send the reminder DM
        await interaction.user.send(`⏰ Reminder: ${message}`);
    },
};
