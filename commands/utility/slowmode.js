const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode for the current channel.')
        .addIntegerOption(option => option.setName('duration').setDescription('Duration in seconds').setRequired(true)),
    category: 'utility',
    async execute(interaction) {
        const duration = interaction.options.getInteger('duration');

        if (duration < 0 || duration > 21600) return interaction.reply('Please provide a duration between 0 and 21600 seconds.');

        await interaction.channel.setRateLimitPerUser(duration);
        interaction.reply(`Slowmode has been set to ${duration} seconds.`);
    },
};
